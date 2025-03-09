const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files (MP3s, images, etc.)
app.use(express.static("public"));

// Endpoint to get song list
app.get("/songs", (req, res) => {
  const songsDirectory = path.join(__dirname, "public", "songs");

  fs.readdir(songsDirectory, (err, files) => {
    if (err) {
      console.error("❌ Error reading songs directory:", err);
      return res.status(500).json({ error: "Failed to read songs folder" });
    }

    // Filter only MP3 files
    const songFiles = files.filter(file => file.endsWith(".mp3"));

    res.json(songFiles);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
