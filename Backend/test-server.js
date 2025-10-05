console.log('Starting server test...');

try {
  require("dotenv").config();
  console.log('✅ dotenv loaded');
  
  const express = require("express");
  console.log('✅ express loaded');
  
  const app = express();
  console.log('✅ express app created');
  
  const PORT = process.env.PORT || 5003;
  console.log('PORT:', PORT);
  
  app.get('/', (req, res) => {
    res.json({ message: 'Test server working!' });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
  });
  
  // Keep server running
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}