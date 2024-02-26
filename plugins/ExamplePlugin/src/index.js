import express from "express";
import { intercept, actions, store } from "@neptune/core";
import { neptune, playbackControls } from "@neptune";

const app = express();
const port = 3003;
const serverPort = 16257;
const trackRegex = /track\/(\d+)/;

let currentPlaybackState = {
  title: "",
  coverArt: "",
  currentTime: 0,
};

// Function to update current playback state
const updateCurrentPlaybackState = () => {
  const { title, coverArt, currentTime } = store.getState().content.mediaItem;
  currentPlaybackState = {
    title,
    coverArt,
    currentTime,
  };
};

// Express endpoint to get the current playback state
app.get("/currentPlaybackState", (req, res) => {
  res.json(currentPlaybackState);
});

// Start Express server
const expressServer = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle playback control actions in Neptune
neptune.on("playbackControl", (control) => {
  switch (control) {
    case "play":
      playbackControls.play();
      break;
    case "pause":
      playbackControls.pause();
      break;
    case "next":
      playbackControls.playNext();
      break;
    case "previous":
      playbackControls.playPrevious();
      break;
    default:
      break;
  }
});

// Intercept playback control actions to trigger updates
const unloadIntercept = intercept([
  "playbackControls/SET_PLAYBACK_STATE",
  "playbackControls/PLAY_PREVIOUS",
  "playbackControls/PLAY_NEXT",
], () => {
  updateCurrentPlaybackState();
});

// HTTP server to receive track ID for fetching and playing
const server = http.createServer((req, res) => {
  if (req.method !== "POST") return;

  req.setEncoding("utf-8");
  const body = [];

  req.on("data", (chunk) => body.push(chunk));
  req.on("end", () => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");

    const shareData = body.join("");
    const trackId = shareData.match(trackRegex)?.[1];
    if (trackId) {
      actions.content.fetchAndPlayMediaItem({ itemId: trackId, itemType: "track" });
    }
  });
});

// Start HTTP server for receiving track ID
server.listen(serverPort, () => {
  console.log(`Neptune Song Share server listening on port ${serverPort}`);
});

// Function to stop the plugin when unloading
export const onUnload = () => {
  unloadIntercept();
  expressServer.close(() => {
    console.log("Express server closed");
  });
  server.close(() => {
    console.log("Neptune Song Share server closed");
  });
};
