module.exports = {
  apps: [
    {
      name: "BlooChatBackend",
      script: "build/server.js",
      interpreter: "node",
      autorestart: true,
      exec_mode: "cluster",
      instances: 1,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
