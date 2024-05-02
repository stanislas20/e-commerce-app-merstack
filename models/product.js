import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter a Product Name"]
    }
    ,
    description: {
        type: String,
        required: [true, "Please Enter a Description"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter a price"]

    },

    stock: {
        type: Number,
        required: [true, "Please Enter a stock"]

    },
    images: [{
        public_id: String,
        url: String,

    }],

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

export const Product = mongoose.model("Product", schema)