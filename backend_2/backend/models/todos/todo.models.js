import mongoose from "mongoose"

const todoSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        complete: {
            type: Boolean,
            default: false, 
        },
        createdBy: { // now we need relations coz we have a user model that need to be linked here
            // this is a special type
            // reference
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // this is the reference to Model 'User'
        },
        subTodos: [
            {
                // how each object looks like 
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubTodo"
            }
        ] // array of subtodos


    }, {timestamps: true}
);

export const Todo = mongoose.model("Todo", todoSchema);