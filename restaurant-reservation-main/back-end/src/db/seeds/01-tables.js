const fs = require('fs');
const path = require('path');

const tablesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/01-tables.json'), 'utf8')
);

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
    .then(function() {
      return knex("tables").insert(tablesData);
    });
};
