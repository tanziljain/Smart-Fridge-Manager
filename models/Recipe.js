const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide recipe title'],
        trim: true
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        amount: String,
        unit: String
    }],
    instructions: [{
        type: String,
        required: true
    }],
    prepTime: {
        type: Number,
        required: true
    },
    cookTime: {
        type: Number,
        required: true
    },
    servings: {
        type: Number,
        required: true
    },
    cuisine: {
        type: String,
        enum: ['italian', 'mexican', 'indian', 'chinese', 'american', 'other']
    },
    dietary: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free']
    }],
    nutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    image: String,
    isFavorite: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['user', 'generated', 'external'],
        default: 'user'
    },
    externalId: String // For storing IDs from external APIs
}, {
    timestamps: true
});

// Indexes for faster queries
recipeSchema.index({ user: 1, isFavorite: 1 });
recipeSchema.index({ user: 1, cuisine: 1 });
recipeSchema.index({ user: 1, dietary: 1 });

module.exports = mongoose.model('Recipe', recipeSchema); 