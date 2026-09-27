const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["income", "expense"],
            required: [true, "Transaction type is required"]
        },

        name: {
            type: String,
            required: [true, "Name/source is required"],
            trim: true
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [1, "Amount must be at least 1"]
        },

        category: {
            type: String,
            default: "Other",
            trim: true
        },

        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Transaction", transactionSchema);
