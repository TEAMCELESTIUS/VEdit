const mongoose = require("mongoose");

const CommitSchema = new mongoose.Schema({
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    commitHash: String,
    parentCommitHash: { type: String, default: null },
    diffUrl: String,  // AWS S3 URL
    fullVideo: Boolean,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Commit", CommitSchema);
