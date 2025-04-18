const express = require('express');
const router = express.Router();
const FridgeItem = require('../models/FridgeItem');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all fridge items
router.get('/', verifyToken, async (req, res) => {
    try {
        const items = await FridgeItem.find({ user: req.userId })
            .sort({ expiry: 1 });
        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

// Add new fridge item
router.post('/', verifyToken, async (req, res) => {
    try {
        const item = await FridgeItem.create({
            ...req.body,
            user: req.userId
        });
        res.status(201).json({ success: true, item });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item', error: error.message });
    }
});

// Update fridge item
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const item = await FridgeItem.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ success: true, item });
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
});

// Delete fridge item
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const item = await FridgeItem.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});

// Get items by category
router.get('/category/:category', verifyToken, async (req, res) => {
    try {
        const items = await FridgeItem.find({
            user: req.userId,
            category: req.params.category
        }).sort({ expiry: 1 });

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

// Get expiring items
router.get('/expiring', verifyToken, async (req, res) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Items expiring in next 7 days

        const items = await FridgeItem.find({
            user: req.userId,
            expiry: { $lte: date },
            status: 'active'
        }).sort({ expiry: 1 });

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expiring items', error: error.message });
    }
});

module.exports = router; 