const fs = require('fs');
const path = require('path');

const reservationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/00-reservations.json'), 'utf8')
);

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(function() {
      return knex("reservations").insert(reservationsData);
    });
};
