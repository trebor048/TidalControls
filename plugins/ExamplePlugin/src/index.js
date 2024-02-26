import { store, actions } from "@neptune/core";
import express from "express";

// Create an Express app
const app = express();
const port = 3000; // Choose any port you prefer

// Define a variable to store the current playback state
let currentPlaybackState = {
  title: "",
  coverArt: "",
  currentTime: 0,
};

// Endpoint to get the current playback state
app.get("/currentPlaybackState", (req, res) => {
  res.json(currentPlaybackState);
});

// Update current playback state whenever a new song is loaded
const updateCurrentPlaybackState = () => {
  const { title, coverArt, currentTime } = store.getState().content.mediaItem;
  currentPlaybackState = {
    title,
    coverArt,
    currentTime,
  };
};

// Listen for playback control actions
const playbackControlListener = store.subscribe(() => {
  const { type } = store.getState().ui.playbackControls;
  switch (type) {
    case actions.ui.playbackControls.PLAY_PREVIOUS:
    case actions.ui.playbackControls.PLAY_NEXT:
      updateCurrentPlaybackState();
      break;
    default:
      break;
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to stop the plugin when unloading
export const onUnload = () => {
  playbackControlListener(); // Unsubscribe from playback control actions
};
