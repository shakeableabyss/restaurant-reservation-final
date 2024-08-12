const { PORT = 5001 } = process.env;

const app = require("./app");
const knex = require("./db/connection");

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error(error);
    knex.destroy();
  });

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}

/*
const { PORT = 5001 } = process.env;
const path = require('path');
const express = require('express');
const app = express();
const knex = require('./db/connection');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API routes
require('./app')(app);

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

knex.migrate
  .latest()
  .then((migrations) => {
    console.log('migrations', migrations);
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error(error);
    knex.destroy();
  });

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}
  */