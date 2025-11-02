// check-env.js
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET', 
  'NEXTAUTH_URL',
  'BASE_URL'
];

console.log('🔍 Checking environment variables...');
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: ${process.env[envVar].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${envVar}: MISSING`);
  }
});