const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("../config");

const setupMiddleware = (app) => {
  app.use(cors(config.corsOptions));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
};

module.exports = { setupMiddleware };
