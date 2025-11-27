// backend/index.js
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());

// Endpoint to download video
app.get("/download", async (req, res) => {
  const url = req.query.url;
  const quality = req.query.quality || "highest";

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    ytdl(url, {
      quality: quality
    }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download video" });
  }
});

// Endpoint to download subtitles (if available)
app.get("/subtitles", async (req, res) => {
  const url = req.query.url;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: "No subtitles available" });
    }

    const subtitleUrl = tracks[0].baseUrl;
    res.redirect(subtitleUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get subtitles" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`YT Downloader running on port ${PORT}`));
