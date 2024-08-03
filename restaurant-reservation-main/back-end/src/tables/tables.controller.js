const service = require("./tables.service.js");
const reservationsService = require("../reservations/reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary.js");

async function tableExists(req, res, next) {
  const { tableId } = req.params;
  
  const table = await service.read(tableId);
  if (table !== undefined) {
	  res.locals.table = table;
    return next();
  }
  return res.status(404).json({ error: `Table ${tableId} cannot be found.` });
}

async function read(req, res, next) {
  const { tableId } = req.params;
  const data = await service.read(tableId);
  res.json({ data });
}

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function create(req, res) {
  const tableData = req.body;
  const data = await service.create(tableData);
  res.status(201).json( {data} );
}

async function update(req, res) {
  const newReservationId = req.body.data.reservation_id;
	let tableData = await service.update(res.locals.table.table_id, newReservationId);
  await reservationsService.updateStatus(newReservationId, "seated");
	tableData = tableData[0];
	res.json({ tableData });
}

async function notFound(req, res, next) {
  return res.status(404).json({ error: `Path does not exist.` });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function tableNameIsValid(req, res, next) {
    const {data = {} } = req.body;
    if (data.table_name.length < 2) {
        return next({
            status: 400,
            message: `Must be a valid table_name!`,
          });
    }

    return next();
}

function capacityIsValid(req, res, next) {
    const { data = {} } = req.body;
    const capacity = data.capacity;

    if ((capacity !== Number(capacity)) || isNaN(capacity) || (capacity < 1)) {
      return next({
        status: 400,
        message: `Must have a valid capacity!`,
      });
    }
    
    return next();
  }
  

  async function tableExistsIsOpenAndHasCapacity(req, res, next) {
    const { tableId } = req.params;
    const reservationId = req.body.data.reservation_id;
    const table = await service.read(tableId);
    res.locals.table = table;

    if (table === undefined) {
        return res.status(404).json({ error: `Table ${tableId} cannot be found.` });
    }

    if (table.reservation_id !== null) {
        return res.status(400).json({ error: `Table ${tableId} is already occupied!` });
    }
    
    const reservation = await reservationsService.read(reservationId);
    if (reservation === undefined) {
      return res.status(404).json({ error: `Reservation ${reservationId} cannot be found.` });
	  }
  
    if (reservation.people > table.capacity) {
      return res.status(400).json({ error: `Table ${tableId} does not meet required capacity of ${reservation.people}!` });
    }

    res.locals.table = table;
    return next();
    
  }

async function finishTable(req, res, next) {
  if (res.locals.table.reservation_id === null) {
    return res.status(400).json({ error: `Table is not occupied!` });  
  }
  let tableData = await service.finishTable(res.locals.table.table_id);
  await reservationsService.updateStatus(res.locals.table.reservation_id, "finished");
	const data  = tableData[0];
	res.status(200).json({ data });
}

async function reservationIsNotAlreadySeated (req, res, next) {
  const reservationId = req.body.data.reservation_id;
  const data = await reservationsService.read(reservationId);
  if (data.status === "seated") {
    return res.status(400).json({ error: `Reservation is already seated.` });
  }
  return next();
}

module.exports = {
  read: [asyncErrorBoundary(tableExists), 
    asyncErrorBoundary(read)],
  list: asyncErrorBoundary(list),
  create: [bodyDataHas("table_name"),
    tableNameIsValid,
    bodyDataHas("capacity"),
    capacityIsValid,
    asyncErrorBoundary(create)],
  update: [bodyDataHas("reservation_id"),
    asyncErrorBoundary(tableExistsIsOpenAndHasCapacity),
    asyncErrorBoundary(reservationIsNotAlreadySeated),
    asyncErrorBoundary(update)],
  destroy: [asyncErrorBoundary(tableExists),
    asyncErrorBoundary(finishTable)],
  notFound,
};
