import mongoose from "mongoose";
const BlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        ref: "User",
    },
}, { timestamps: true });

// Setting TTL to 3600 seconds (1 hour), clears expired tokens after 1 hour
BlacklistSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("Blacklist", BlacklistSchema);