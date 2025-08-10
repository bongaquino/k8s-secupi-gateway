const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ardata Staging App!', environment: process.env.NODE_ENV });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 