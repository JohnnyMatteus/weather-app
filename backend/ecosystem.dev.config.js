module.exports = {
  apps: [
    {
      name: 'weather-app-backend-dev',
      script: 'src/index.ts',
      interpreter: 'tsx',
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
