const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Get all recipes
router.get('/', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, recipes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});

// Get favorite recipes
router.get('/favorites', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({
            user: req.user._id,
            isFavorite: true
        }).sort({ updatedAt: -1 });
        res.json({ success: true, recipes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
});

// Generate recipes based on ingredients
router.post('/generate', protect, async (req, res) => {
    try {
        const { ingredients, cuisine, dietary } = req.body;

        // Call Spoonacular API to generate recipes
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
            params: {
                ingredients: ingredients.join(','),
                number: 5,
                cuisine: cuisine,
                diet: dietary,
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });

        // Get detailed recipe information for each recipe
        const recipes = await Promise.all(
            response.data.map(async (recipe) => {
                const details = await axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
                    params: {
                        apiKey: process.env.SPOONACULAR_API_KEY
                    }
                });
                return {
                    title: details.data.title,
                    ingredients: details.data.extendedIngredients.map(ing => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit
                    })),
                    instructions: details.data.instructions.split('\n').filter(step => step.trim()),
                    prepTime: details.data.preparationMinutes,
                    cookTime: details.data.cookingMinutes,
                    servings: details.data.servings,
                    cuisine: details.data.cuisines[0] || 'other',
                    dietary: details.data.diets,
                    nutrition: {
                        calories: details.data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount,
                        protein: details.data.nutrition.nutrients.find(n => n.name === 'Protein')?.amount,
                        carbs: details.data.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount,
                        fat: details.data.nutrition.nutrients.find(n => n.name === 'Fat')?.amount
                    },
                    image: details.data.image,
                    source: 'generated',
                    externalId: details.data.id.toString()
                };
            })
        );

        // Save generated recipes to database
        const savedRecipes = await Promise.all(
            recipes.map(recipe => Recipe.create({
                ...recipe,
                user: req.user._id
            }))
        );

        res.json({ success: true, recipes: savedRecipes });
    } catch (error) {
        res.status(500).json({ message: 'Error generating recipes', error: error.message });
    }
});

// Add a new recipe
router.post('/', protect, async (req, res) => {
    try {
        const recipe = await Recipe.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json({ success: true, recipe });
    } catch (error) {
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

// Update recipe
router.put('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json({ success: true, recipe });
    } catch (error) {
        res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
});

// Toggle favorite status
router.patch('/:id/favorite', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, user: req.user._id });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        recipe.isFavorite = !recipe.isFavorite;
        await recipe.save();

        res.json({ success: true, recipe });
    } catch (error) {
        res.status(500).json({ message: 'Error updating favorite status', error: error.message });
    }
});

// Delete recipe
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json({ success: true, message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
});

module.exports = router; 