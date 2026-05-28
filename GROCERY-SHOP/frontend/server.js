const express = require("express");
const path = require("path");
const app = express();

const PORT = 3000;

// Dynamic configuration endpoint for the client browser
app.get("/config.js", (req, res) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  res.setHeader("Content-Type", "application/javascript");
  res.send(`window.API_BASE_URL = "${backendUrl}";`);
});

// Serve static elements after config route definitions
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Web server statically serving components on port ${PORT}`);
});
