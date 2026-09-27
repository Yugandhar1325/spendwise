const express = require("express");
const protect = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();

// All routes below are protected
router.use(protect);


// ==========================================
// GET /api/transactions
// Get all transactions for the logged-in user
// ==========================================

router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id
        }).sort({ date: -1 });

        res.json(transactions);

    } catch (error) {
        console.error("Get Transactions Error:", error.message);
        res.status(500).json({
            message: "Server error fetching transactions"
        });
    }
});


// ==========================================
// POST /api/transactions
// Add a new transaction (income or expense)
// ==========================================

router.post("/", async (req, res) => {
    try {
        const { type, name, amount, category } = req.body;

        // Validate
        if (!type || !name || !amount) {
            return res.status(400).json({
                message: "Please provide type, name, and amount"
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                message: "Type must be 'income' or 'expense'"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            type,
            name,
            amount,
            category: category || "Other"
        });

        res.status(201).json(transaction);

    } catch (error) {
        console.error("Add Transaction Error:", error.message);
        res.status(500).json({
            message: "Server error adding transaction"
        });
    }
});


// ==========================================
// DELETE /api/transactions/:id
// Delete a transaction
// ==========================================

router.delete("/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // Make sure user owns this transaction
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to delete this transaction"
            });
        }

        await Transaction.findByIdAndDelete(req.params.id);

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error("Delete Transaction Error:", error.message);
        res.status(500).json({
            message: "Server error deleting transaction"
        });
    }
});


// ==========================================
// GET /api/transactions/summary
// Get totals for the logged-in user
// ==========================================

router.get("/summary", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id
        });

        let totalIncome = 0;
        let totalExpenses = 0;
        const categories = {};

        transactions.forEach((t) => {
            if (t.type === "income") {
                totalIncome += t.amount;
            } else {
                totalExpenses += t.amount;

                if (categories[t.category]) {
                    categories[t.category] += t.amount;
                } else {
                    categories[t.category] = t.amount;
                }
            }
        });

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            savings: totalIncome - totalExpenses,
            categories
        });

    } catch (error) {
        console.error("Summary Error:", error.message);
        res.status(500).json({
            message: "Server error fetching summary"
        });
    }
});


module.exports = router;
