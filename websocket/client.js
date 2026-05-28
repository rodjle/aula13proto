const WebSocket = require('ws');
const { performance } = require('node:perf_hooks');

const URL = 'ws://localhost:3004';
const REQUEST_COUNT = 100;
const TIMEOUT_MS = 5000;

async function runBenchmark() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const pending = new Map();
    let completed = 0;
    const start = performance.now();
    let connTimeout;

    connTimeout = setTimeout(() => {
      ws.terminate();
      reject(new Error('WebSocket connection timeout'));
    }, TIMEOUT_MS);

    ws.on('open', () => {
      clearTimeout(connTimeout);
      // Envia todas as 100 mensagens sequencialmente para medir round-trip individual.
      sendNext(0);
    });

    ws.on('error', (err) => {
      clearTimeout(connTimeout);
      reject(err);
    });

    function sendNext(i) {
      if (i >= REQUEST_COUNT) return;
      const id = i;
      pending.set(id, performance.now());
      ws.send(JSON.stringify({ type: 'GET_USERS', id }));
    }

    ws.on('message', (raw) => {
      const data = JSON.parse(raw);
      pending.delete(data.id);
      completed += 1;

      if (completed < REQUEST_COUNT) {
        sendNext(completed);
      } else {
        const totalMs = performance.now() - start;
        ws.close();
        resolve({
          protocol: 'WebSocket',
          totalMs,
          avgMs: totalMs / REQUEST_COUNT,
          reqPerSec: (REQUEST_COUNT / totalMs) * 1000,
          requests: REQUEST_COUNT,
        });
      }
    });
  });
}

async function main() {
  try {
    const result = await runBenchmark();
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(result));
      return;
    }

    console.log('[WebSocket] benchmark concluido');
    console.log(result);
  } catch (error) {
    const message = error.message.includes('ECONNREFUSED')
      ? 'Conexao recusada. O server WebSocket esta rodando na porta 3004?'
      : error.message;
    console.error(`[WebSocket] erro: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
