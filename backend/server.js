require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Multer Storage (Temporary File Upload)
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// Import Routes
const videoRoutes = require("./routes/videoRoutes");
app.use("/videos", videoRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
