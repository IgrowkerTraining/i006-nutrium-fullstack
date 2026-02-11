const express = require("express");
const { setupMiddleware } = require("./src/middleware");
const apiRoutes = require("./src/routes");
const config = require("./src/config");

const app = express();

setupMiddleware(app);

app.use("/api", apiRoutes);

app.listen(config.port, () => {
  console.log(`Example Auth Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
