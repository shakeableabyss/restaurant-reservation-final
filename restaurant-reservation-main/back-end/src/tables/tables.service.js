const knex = require("../db/connection");

function list() {
  return knex("tables")
          .select("*")
          .orderBy("table_name", "asc");
}

function read(tableId) {
	return knex("tables")
		.select("*")
		.where( {table_id: tableId})
		.first();
}

function create(data) {
  const { data: tableData } = data;
    return knex("tables")
    .insert(tableData)
    .returning("*")
    .then((result) => result[0]);
}

function update(tableId, reservationId) {
    return knex("tables")
        .where({table_id: tableId})
        .update({reservation_id: reservationId}, ["reservation_id"]);
}

function finishTable(tableId) {
  return knex("tables")
      .where({table_id: tableId})
      .update({reservation_id: null}, ["reservation_id"]);
}

module.exports = {
    list,
    read,
    create,
    update,
    finishTable,
  };