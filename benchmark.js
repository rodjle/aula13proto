const { runBenchmark: runRest } = require('./rest/client');
const { runBenchmark: runGraphql } = require('./graphql/client');
const { runBenchmark: runGrpc } = require('./grpc/client');
const { runBenchmark: runWebsocket } = require('./websocket/client');
const { runBenchmark: runQueue } = require('./queue/client');

function formatResultRow(result) {
  const protocol = result.protocol.padEnd(9, ' ');
  const total = `${result.totalMs.toFixed(1)} ms`.padStart(8, ' ');
  const avg = `${result.avgMs.toFixed(2)} ms`.padStart(10, ' ');
  const rps = `${result.reqPerSec.toFixed(1)}`.padStart(9, ' ');

  return `| ${protocol} | ${total} | ${avg} | ${rps} |`;
}

async function main() {
  console.log('==============================================');
  console.log('       PROTOCOL PERFORMANCE BENCHMARK');
  console.log('==============================================');

  const runners = [runRest, runGraphql, runGrpc, runWebsocket, runQueue];

  let results;
  try {
    results = await Promise.all(runners.map((fn) => fn()));
  } catch (error) {
    console.error('\nFalha ao executar benchmark:', error.message);
    console.error('Verifique se os servidores estao rodando com: npm start');
    process.exit(1);
  }

  console.log('+-----------+----------+------------+-----------+');
  console.log('| Protocol  | Total ms | Avg req ms | Req/s     |');
  console.log('+-----------+----------+------------+-----------+');
  for (const result of results) {
    console.log(formatResultRow(result));
  }
  console.log('+-----------+----------+------------+-----------+');
}

if (require.main === module) {
  main();
}
