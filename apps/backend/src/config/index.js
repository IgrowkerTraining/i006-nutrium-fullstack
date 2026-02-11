const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "mock-jwt-secret",
  corsOptions: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
};

module.exports = config;
