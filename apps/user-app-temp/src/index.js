const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const app = express();
app.use(express.json());

let schemaText = 'type Query { hello: String }';
if (fs.existsSync(__dirname + '/schema.graphql')) {
  schemaText = fs.readFileSync(__dirname + '/schema.graphql', 'utf-8');
}
const schema = buildSchema(schemaText);
const root = { hello: () => 'Hello world' };
app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const todo = { id: Date.now(), text: req.body.text };
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(4000, () => console.log('todo app listening on 4000'));
