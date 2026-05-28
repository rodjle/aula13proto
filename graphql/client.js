const { performance } = require('node:perf_hooks');

const URL = 'http://localhost:3002/graphql';
const REQUEST_COUNT = 100;
const TIMEOUT_MS = 5000;
const QUERY = '{ users { id name email age } }';

async function postGraphqlWithTimeout(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;
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
    await postGraphqlWithTimeout(TIMEOUT_MS);
  }

  const totalMs = performance.now() - start;
  const avgMs = totalMs / REQUEST_COUNT;
  const reqPerSec = (REQUEST_COUNT / totalMs) * 1000;

  return {
    protocol: 'GraphQL',
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

    console.log('[GraphQL] benchmark concluido');
    console.log(result);
  } catch (error) {
    const message = error.code === 'ECONNREFUSED'
      ? 'Conexao recusada. O server GraphQL esta rodando na porta 3002?'
      : error.message;
    console.error(`[GraphQL] erro: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
