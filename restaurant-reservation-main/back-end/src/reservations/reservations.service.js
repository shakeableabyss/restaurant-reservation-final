const knex = require("../db/connection");

function list(date) {
  if(date) {
		return knex("reservations as r")
		  .select("*")
      .where( {reservation_date: date} )
      .whereNot( {status: "finished"} )
		  .distinct("r.reservation_id")
      .orderBy("r.reservation_time", "asc");
  }	
  return knex("reservations")
          .select("*")
          .orderBy("reservation_time", "asc");
}

function read(reservationId) {
	return knex("reservations")
		.select("*")
		.where( {reservation_id: reservationId})
		.first();
}

function create(data) {
  const { data: reservationData } = data;
    return knex("reservations")
        .insert(reservationData)
        .returning("*")
        .then((result) => result[0]);
}

function update(data) {
    return knex("reservations")
        .where({reservation_id: data.reservation_id})
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          mobile_number: data.mobile_number,
          reservation_date: data.reservation_date,
          reservation_time: data.reservation_time,
          people: data.people,
          status: data.status
        },
      "*")
        .returning(["*"]);
}

function updateStatus(reservationId, status) {
  return knex("reservations")
      .where({reservation_id: reservationId})
      .update({status: status}, ["status"])
      .returning(["*"]);
}

function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
  }

module.exports = {
    list,
    read,
    create,
    update,
    updateStatus,
    search
  };