const express = require("express");
const { setupMiddleware } = require("./src/middleware");
const apiRoutes = require("./src/routes");
const config = require("./src/config");

// Carga todos los modelos Sequelize y define sus asociaciones
// (debe importarse antes de que cualquier ruta use los modelos)
require("./src/models");

const app = express();

setupMiddleware(app);

app.use("/api/v1", apiRoutes);

app.listen(config.port, () => {
  console.log(`Example Auth Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
