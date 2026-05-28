const { performance } = require('node:perf_hooks');

const URL = 'http://localhost:3001/users';
const REQUEST_COUNT = 100;
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
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

  for (let i = 0; i < REQUEST_COUNT; i += 1) {
    await fetchWithTimeout(URL, TIMEOUT_MS);
  }

  const totalMs = performance.now() - start;
  const avgMs = totalMs / REQUEST_COUNT;
  const reqPerSec = (REQUEST_COUNT / totalMs) * 1000;

  return {
    protocol: 'REST',
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

    console.log('[REST] benchmark concluido');
    console.log(result);
  } catch (error) {
    const message = error.code === 'ECONNREFUSED'
      ? 'Conexao recusada. O server REST esta rodando na porta 3001?'
      : error.message;
    console.error(`[REST] erro: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
