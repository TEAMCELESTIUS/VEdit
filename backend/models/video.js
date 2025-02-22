const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
    title: String,
    description: String,
    commits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commit" }]
});

module.exports = mongoose.model("Video", VideoSchema);
