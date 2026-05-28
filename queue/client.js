const { performance } = require('node:perf_hooks');

const URL = 'http://localhost:3005/enqueue';
const REQUEST_COUNT = 100;
const TIMEOUT_MS = 10000;

async function enqueueWithTimeout(correlationId, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'GET_USERS', correlationId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Timeout de ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function runBenchmark() {
  const start = performance.now();

  // Sequencial para medir throughput real da fila.
  for (let i = 0; i < REQUEST_COUNT; i += 1) {
    await enqueueWithTimeout(`msg-${i}`, TIMEOUT_MS);
  }

  const totalMs = performance.now() - start;
  const avgMs = totalMs / REQUEST_COUNT;
  const reqPerSec = (REQUEST_COUNT / totalMs) * 1000;

  return {
    protocol: 'Queue',
    totalMs,
    avgMs,
    reqPerSec,
    requests: REQUEST_COUNT,
  };
}

async function main() {
  try {
    const result = await runBenchmark();
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(result));
      return;
    }

    console.log('[Queue] benchmark concluido');
    console.log(result);
  } catch (error) {
    const message = error.code === 'ECONNREFUSED'
      ? 'Conexao recusada. O server Queue esta rodando na porta 3005?'
      : error.message;
    console.error(`[Queue] erro: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
