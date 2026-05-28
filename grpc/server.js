const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PORT = 3003;
const PROTO_PATH = path.join(__dirname, 'users.proto');

const USERS = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: 20 + (index % 30),
}));

function randomDelay() {
  return Math.floor(Math.random() * 5) + 1;
}

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDef).users;

// Implementacao do RPC — gRPC usa callbacks para responder.
async function getUsers(call, callback) {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));
  callback(null, { users: USERS });
}

function main() {
  const server = new grpc.Server();
  server.addService(usersProto.UserService.service, { GetUsers: getUsers });
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error('[gRPC] falha ao iniciar:', err.message);
      process.exit(1);
    }
    console.log(`[gRPC] server running on localhost:${PORT}`);
  });
}

main();
