# Protocols Benchmark

Monorepo em Node.js para comparar performance entre 5 estilos de comunicacao client-server:

- REST
- GraphQL
- gRPC
- WebSocket
- Message Queue (simulada em memoria)

## Estrutura

```txt
/protocols-benchmark
  /rest
  /graphql
  /grpc
  /websocket
  /queue
  /dashboard
  package.json
```

## Requisitos

- Node.js 18+

## Instalacao

```bash
npm install
```

## Execucao

Subir todos os servidores (protocolos + dashboard):

```bash
npm start
```

Rodar benchmark no terminal (todos os clients):

```bash
npm run benchmark
```

Subir somente o dashboard:

```bash
npm run dashboard
```

## Portas

- Dashboard: http://localhost:3000
- REST: http://localhost:3001
- GraphQL: http://localhost:3002/graphql
- gRPC: localhost:3003
- WebSocket: ws://localhost:3004
- Queue: http://localhost:3005

## Como funciona

- Cada pasta de protocolo possui `server.js` e `client.js`.
- Cada client executa 100 operacoes e calcula:
  - tempo total (ms)
  - media por request (ms)
  - throughput (req/s)
- Todos os servers adicionam delay aleatorio de 1 a 5ms para simular I/O.
- O dashboard dispara benchmarks via `child_process` e exibe os resultados em cards e grafico comparativo.

## Observacoes

- O benchmark espera que os servidores dos protocolos estejam ativos.
- Erros de timeout e conexao sao tratados nos clients.
