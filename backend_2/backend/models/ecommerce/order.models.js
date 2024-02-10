import mongoose from "mongoose";

// this help to track orderItem

const orderItemSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity:{
        type: Number,
        required: true,
    },
})

const orderSchema = new mongoose.Schema({
    orderPrice:{
        type:Number,
        required:true
    },
    customer: {
        type: mongoose.Schema.Type.ObjectId,
        ref: "User",
        required: true,
    },
    OrderItems: {
        type: [ orderItemSchema ]
    },
    address: {
        type: String,
        required: true,
    },
    // enum for status
    status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "DELIVERED"],
        default: "PENDING",
    },
}, {timestamps:true})

export const Order = mongoose.model("Order", orderSchema);