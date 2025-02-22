const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { spawn } = require("child_process");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const upload = multer({ dest: "uploads/" });

// Upload a file to Supabase Storage
const uploadToSupabase = async (filePath, key) => {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage.from("videos").upload(key, fileBuffer, { upsert: true });
    if (error) throw error;
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/videos/${key}`;
};

// Create a new video entry
router.post("/", async (req, res) => {
    const { title, description } = req.body;
    const { data, error } = await supabase.from("videos").insert([{ title, description }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Commit a new video version
router.post("/:id/commit", upload.single("video"), async (req, res) => {
    const videoId = req.params.id;

    // Get the latest commit
    const { data: latestCommit } = await supabase.from("commits").select("*").eq("video_id", videoId).order("created_at", { ascending: false }).limit(1).single();

    const commitHash = Date.now().toString(); // Simple hash
    let diffUrl;
    let fullVideo = false;

    if (latestCommit) {
        // Create a video diff using FFmpeg
        const diffFilePath = `uploads/diff-${commitHash}.mp4`;
        const ffmpeg = spawn("ffmpeg", ["-i", latestCommit.diff_url, "-i", req.file.path, "-filter_complex", "blend=all_mode=difference", diffFilePath]);

        ffmpeg.on("close", async () => {
            diffUrl = await uploadToSupabase(diffFilePath, `diffs/${commitHash}.mp4`);
            fs.unlinkSync(diffFilePath);
        });
    } else {
        // First commit, store full video
        diffUrl = await uploadToSupabase(req.file.path, `videos/${commitHash}.mp4`);
        fullVideo = true;
    }

    // Save commit record
    const { data, error } = await supabase.from("commits").insert([
        { video_id: videoId, commit_hash: commitHash, parent_commit_hash: latestCommit?.commit_hash || null, diff_url: diffUrl, full_video: fullVideo }
    ]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ commitHash, diffUrl });
});

// Get all commits of a video
router.get("/:id/commits", async (req, res) => {
    const { data, error } = await supabase.from("commits").select("*").eq("video_id", req.params.id).order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Get a specific commit
router.get("/:id/commit/:commitHash", async (req, res) => {
    const { data, error } = await supabase.from("commits").select("*").eq("video_id", req.params.id).eq("commit_hash", req.params.commitHash).single();
    if (error) return res.status(404).json({ error: "Commit not found" });

    res.json({ commit: data, videoUrl: data.diff_url });
});

module.exports = router;
