const cors = require('cors');
const bodyParser = require('body-parser');

const setupMiddleware = (app) => {
  app.use(cors());
  app.use(bodyParser.json());
  
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
};

module.exports = { setupMiddleware };
