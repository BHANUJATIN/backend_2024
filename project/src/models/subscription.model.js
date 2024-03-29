import mongoose, {Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // on who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)