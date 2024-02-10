import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "password is required"]
        }
        // ways to save timestamp
        // createdAt , updatedAt {timestamps:true} as 2nd object
    }, {timestamps:true}
);

// kya model banau ?
// kiske base pe banau ?
export const User = mongoose.model("User", userSchema)

// this User will be changed to users in monogodb while saving in collection


