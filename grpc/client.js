const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { performance } = require('node:perf_hooks');

const PORT = 3003;
const PROTO_PATH = path.join(__dirname, 'users.proto');
const REQUEST_COUNT = 100;

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDef).users;

function callGetUsers(client) {
  return new Promise((resolve, reject) => {
    // gRPC usa deadline ao inves de timeout generico.
    const deadline = new Date(Date.now() + 5000);
    client.GetUsers({}, { deadline }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

async function runBenchmark() {
  const client = new usersProto.UserService(
    `localhost:${PORT}`,
    grpc.credentials.createInsecure()
  );

  // Espera conexao
  await new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + 5000);
    client.waitForReady(deadline, (err) => {
      if (err) return reject(new Error('gRPC connection timeout'));
      resolve();
    });
  });

  const start = performance.now();

  for (let i = 0; i < REQUEST_COUNT; i += 1) {
    await callGetUsers(client);
  }

  const totalMs = performance.now() - start;
  const avgMs = totalMs / REQUEST_COUNT;
  const reqPerSec = (REQUEST_COUNT / totalMs) * 1000;

  client.close();

  return {
    protocol: 'gRPC',
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

    console.log('[gRPC] benchmark concluido');
    console.log(result);
  } catch (error) {
    console.error(`[gRPC] erro: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
