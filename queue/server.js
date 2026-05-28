const http = require('http');

const PORT = 3005;

const USERS = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: 20 + (index % 30),
}));

function randomDelay() {
  return Math.floor(Math.random() * 5) + 1;
}

// Simulacao de Message Queue in-memory.
// A fila de "request" recebe mensagens; o "worker" processa e coloca na fila de "response".
const requestQueue = [];
const responseQueues = new Map(); // correlationId -> callback

// Worker que processa a fila continuamente
setInterval(() => {
  while (requestQueue.length > 0) {
    const msg = requestQueue.shift();
    processMessage(msg);
  }
}, 1);

async function processMessage(msg) {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));

  const callback = responseQueues.get(msg.correlationId);
  if (callback) {
    responseQueues.delete(msg.correlationId);
    callback({ correlationId: msg.correlationId, users: USERS });
  }
}

// Endpoint HTTP para receber mensagens na fila (simula um producer via HTTP).
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/enqueue') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const msg = JSON.parse(body);

      // Coloca na fila e espera resposta via correlationId.
      requestQueue.push(msg);
      responseQueues.set(msg.correlationId, (response) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      });
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[Queue] server running on http://localhost:${PORT}`);
});
