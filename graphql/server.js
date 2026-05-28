const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLInt, GraphQLString } = require('graphql');

const PORT = 3002;
const app = express();

const USERS = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: 20 + (index % 30),
}));

function randomDelay() {
  return Math.floor(Math.random() * 5) + 1;
}

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        // No GraphQL, o resolver encapsula a logica de acesso a dados.
        await new Promise((resolve) => setTimeout(resolve, randomDelay()));
        return USERS;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery });

app.use('/graphql', createHandler({ schema }));

app.listen(PORT, () => {
  console.log(`[GraphQL] server running on http://localhost:${PORT}/graphql`);
});
