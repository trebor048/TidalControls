import express from "express";
import { actions } from "@neptune";

const app = express();
const port = 3003;

// Generate routes for all Neptune actions
for (const category of Object.keys(actions)) {
  const categoryActions = actions[category];
  for (const action of Object.keys(categoryActions)) {
    const actionHandler = categoryActions[action];
    const route = `/${category}/${action}`;
    app.post(route, async (req, res) => {
      try {
        const result = await actionHandler(req.body); // Call the action handler with request body
        res.json(result); // Send back the result
      } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
      }
    });
  }
}

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
