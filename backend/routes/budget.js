const express = require("express");
const protect = require("../middleware/auth");
const Budget = require("../models/Budget");

const router = express.Router();

// All routes below are protected
router.use(protect);


// ==========================================
// GET /api/budget
// Get the current month's budget
// ==========================================

router.get("/", async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budget = await Budget.findOne({
            user: req.user._id,
            month,
            year
        });

        if (!budget) {
            return res.json({
                amount: 0,
                month,
                year
            });
        }

        res.json(budget);

    } catch (error) {
        console.error("Get Budget Error:", error.message);
        res.status(500).json({
            message: "Server error fetching budget"
        });
    }
});


// ==========================================
// POST /api/budget
// Set or update current month's budget
// ==========================================

router.post("/", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Please enter a valid budget amount"
            });
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Upsert: create if not exists, update if exists
        const budget = await Budget.findOneAndUpdate(
            {
                user: req.user._id,
                month,
                year
            },
            {
                amount,
                user: req.user._id,
                month,
                year
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json(budget);

    } catch (error) {
        console.error("Set Budget Error:", error.message);
        res.status(500).json({
            message: "Server error setting budget"
        });
    }
});


module.exports = router;
