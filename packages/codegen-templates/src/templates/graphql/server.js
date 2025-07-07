const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');

const schemaText = fs.existsSync('schema.graphql') ? fs.readFileSync('schema.graphql', 'utf-8') : 'type Query { hello: String }';
const schema = buildSchema(schemaText);

const root = {
  hello: () => 'Hello world',
};

const app = express();
app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

app.listen(4000, () => console.log('GraphQL server listening on 4000'));
