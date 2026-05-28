const { WebSocketServer } = require('ws');

const PORT = 3004;

const USERS = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: 20 + (index % 30),
}));

function randomDelay() {
  return Math.floor(Math.random() * 5) + 1;
}

const wss = new WebSocketServer({ port: PORT });

// WebSocket e full-duplex: o server responde a cada mensagem diretamente na mesma conexao.
wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    const msg = JSON.parse(raw);
    if (msg.type === 'GET_USERS') {
      await new Promise((resolve) => setTimeout(resolve, randomDelay()));
      ws.send(JSON.stringify({ id: msg.id, users: USERS }));
    }
  });
});

console.log(`[WebSocket] server running on ws://localhost:${PORT}`);
