module.exports = {
  apps: [{
    name: 'spine-care-api',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://jadejakarmvir12_db_user:iJ0tynaV71gf9iIl@cluster0.w8zmdv1.mongodb.net/',
      JWT_SECRET: 'a-very-long-and-random-secret-for-your-jwt-tokens' // Change this to your own secret
    }
  }]
};
