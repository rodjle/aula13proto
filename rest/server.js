const express = require('express');

const PORT = 3001;
const app = express();

const USERS = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: 20 + (index % 30),
}));

function randomDelay() {
  return Math.floor(Math.random() * 5) + 1;
}

app.get('/users', async (_req, res) => {
  // Delay curto para simular I/O de banco ou rede.
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));
  res.json(USERS);
});

app.listen(PORT, () => {
  console.log(`[REST] server running on http://localhost:${PORT}`);
});
