const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary.js");

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;

  const reservation = await service.read(reservationId);
  if (reservation !== undefined) {
    res.locals.reservation = reservation;
    return next();
  }
  return res
    .status(404)
    .json({ error: `Reservation ${reservationId} cannot be found.` });
}

async function read(req, res, next) {
  const { reservationId } = req.params;
  const data = await service.read(reservationId);
  res.json({ data });
}

async function list(req, res) {
  const { date } = req.query;
  let { mobile_number } = req.query;
  if (mobile_number) {
    mobile_number = mobile_number.replace(/\D/g, "");
    const data = await service.search(mobile_number);
    res.json({ data });
  } else {
    const data = await service.list(date);
    res.json({ data });
  }
}

async function create(req, res) {
  const reservationData = req.body;
  const data = await service.create(reservationData);
  res.status(201).json({ data });
}

async function update(req, res) {
  const updatedReservation = req.body.data;
  const reservationData = await service.update(updatedReservation);
  const data = reservationData[0];
  res.status(200).json({ data });
}

async function notFound(req, res, next) {
  return res.status(404).json({ error: `Path does not exist.` });
}

function notTuesday(req, res, next) {
  const data = req.body.data;
  const dayName = getDayOfWeek(data.reservation_date);
  if (dayName === "Tuesday") {
    return next({
      status: 400,
      message: `We are closed on Tuesdays!`,
    });
  }

  return next();
}

function getDayOfWeek(dateString) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

function timeOk(req, res, next) {
  const data = req.body.data;
  const fullTime = data.reservation_time;

  const regex12Hour =
    /^(0?[1-9]|1[0-2])(?:([:.])?([0-5][0-9]))?[\s]?([AaPp][Mm])$/;

  // Check if the input matches the 12-hour format
  const match = fullTime.match(regex12Hour);
  let time = fullTime;

  if (match) {
    const hours = match[1];
    const minutes = match[3] || "00"; // Default to '00' if no minutes
    const ampm = match[4];

    // Convert hours to 24-hour format
    let convertedHours = parseInt(hours, 10);
    if (ampm.toUpperCase() === "PM") {
      convertedHours += 12;
      if (convertedHours === 24) {
        convertedHours = 0; // Handle 12:00PM as 00:00
      }
    } else if (convertedHours === 12) {
      convertedHours = 0; // Handle 12:00AM as 00:00
    }

    // Construct the 24-hour format time string
    time = `${convertedHours.toString().padStart(2, "0")}:${minutes}`;
  }

  let ftime = time;

  if (ftime.includes(":")) {
    ftime = ftime.substring(0, 2) + ftime.substring(3, 5);
  }

  if (ftime < 1030) {
    return next({
      status: 400,
      message: "Time is too early!",
    });
  } else if (ftime > 2130) {
    return next({
      status: 400,
      message: "Time is too late!",
    });
  }

  let date = data.reservation_date;
  let noColonDate;

  let year, month, day;

  if (date.includes("-")) {
    // Split the date string into year, month, and day
    const [year, month, day] = date.split("-");
    // Return the date in the desired format
    noColonDate = `${year}${month}${day}`;
  } else {
    // If the date string is in the format "YYYYMMDD" or "MMDDYYYY"
    if (isYearFirst(date) === "YYYYMMDD") {
      // Convert "YYYYMMDD" format to "YYYY-MM-DD"
      year = date.slice(0, 4);
      month = date.slice(4, 6);
      day = date.slice(6, 8);
      noColonDate = year + month + day;
      date = `${year}-${month}-${day}`;
      req.body.data.reservation_date = date;
    } else {
      // If the date string is in the format "MMDDYYYY"
      month = date.slice(0, 2);
      day = date.slice(2, 4);
      year = date.slice(4);
      noColonDate = year + month + day;
      date = `${year}-${month}-${day}`;
      req.body.data.reservation_date = date;
    }
  }

  // Get the server's time zone offset
  const serverTimezoneOffset = new Date().getTimezoneOffset();

  // Create a new Date object with the current time and adjust for the server's time zone
  const now = new Date();
  now.setMinutes(now.getMinutes() + serverTimezoneOffset);

  const thisYear = now.getFullYear();
  const thisMonth = String(now.getMonth() + 1).padStart(2, "0");
  const thisDay = String(now.getDate()).padStart(2, "0");
  const thisDate = thisYear + thisMonth + thisDay;

  // Get the hours and minutes
  const hours = now.getHours().toString();
  const minutes = now.getMinutes().toString();

  // Format the time as a string without colon
  const thisTime = hours + minutes;

  if (noColonDate < thisDate) {
    return next({
      status: 400,
      message: "Date must be in the future!",
    });
  } else if (noColonDate === thisDate && time < thisTime) {
    return next({
      status: 400,
      message: noColonDate + thisDate + time + thisTime,
      //message: "Time must be in the future!",
    });
  } else {
    return next();
  }
}

const isYearFirst = (dateStr) => {
  const month1 = parseInt(dateStr.slice(4, 6), 10);
  const day1 = parseInt(dateStr.slice(6, 8), 10);

  const month2 = parseInt(dateStr.slice(0, 2), 10);
  const day2 = parseInt(dateStr.slice(2, 4), 10);

  // Check if the month and day values are valid for YYYYMMDD format
  if (month1 > 0 && month1 <= 12 && day1 > 0 && day1 <= 31) {
    return "YYYYMMDD";
  }

  // Check if the month and day values are valid for MMDDYYYY format
  if (month2 > 0 && month2 <= 12 && day2 > 0 && day2 <= 31) {
    return "MMDDYYYY";
  }
};

function reservationDateIsValid(req, res, next) {
  const { data = {} } = req.body;
  let dateString = data.reservation_date;

  // Check if the date string is in the format "YYYY-MM-DD"

  if (dateString.includes("-")) {
    // No modification needed for "YYYY-MM-DD" format
  } else {
    // If the date string is in the format "YYYYMMDD" or "MMDDYYYY"
    if (isYearFirst(dateString) === "YYYYMMDD") {
      // Convert "YYYYMMDD" format to "YYYY-MM-DD"
      const year = dateString.slice(0, 4);
      const month = dateString.slice(4, 6);
      const day = dateString.slice(6, 8);
      dateString = `${year}-${month}-${day}`;
    } else {
      // If the date string is in the format "MMDDYYYY"
      const month = dateString.slice(0, 2);
      const day = dateString.slice(2, 4);
      const year = dateString.slice(4);
      dateString = `${year}-${month}-${day}`;
    }
  }

  const thisDate = new Date(dateString);

  if (isNaN(thisDate.getTime())) {
    return next({
      status: 400,
      message: `Must be a valid reservation_date!`,
    });
  }

  return next();
}

function reservationTimeIsValid(req, res, next) {
  const { data = {} } = req.body;
  const timeString = data.reservation_time;

  const timePattern =
    /^(0?[1-9]|1[0-2])(:?[0-5][0-9])?\s?([AaPp][Mm])|([0-9]{2}(:?[0-9]{2})?)$/;

  if (!timePattern.test(timeString)) {
    return next({
      status: 400,
      message: `Must be a valid reservation_time!`,
    });
  }

  return next();
}

function peopleIsNumerical(req, res, next) {
  const { data = {} } = req.body;
  const people = data.people;

  if (people !== Number(people) || isNaN(people) || people < 1) {
    return next({
      status: 400,
      message: `Must be a valid number of people!`,
    });
  }
  return next();
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

function validStatus(req, res, next) {
  const status = req.body.data.status;
  const currentStatus = res.locals.reservation.status;
  if (currentStatus === "finished") {
    return res.status(400).json({ error: `Status is already "finished".` });
  }
  switch (status) {
    case "booked":
      return next();
    case "seated":
      return next();
    case "finished":
      return next();
    case "cancelled":
      return next();
    default:
      return res.status(400).json({ error: `Status is unknown.` });
  }
}

async function updateStatus(req, res, next) {
  const { status } = req.body.data;
  const { reservationId } = req.params;
  let tableData = await service.updateStatus(reservationId, status);
  data = tableData[0];
  res.status(200).json({ data });
}

function statusOkForNewReservation(req, res, next) {
  if (
    req.body.data.status === "seated" ||
    req.body.data.status === "finished"
  ) {
    return res
      .status(400)
      .json({ error: `Not a valid status: ${req.body.data.status}.` });
  }
  return next();
}

module.exports = {
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  list: asyncErrorBoundary(list),
  create: [
    bodyDataHas("first_name"),
    bodyDataHas("last_name"),
    bodyDataHas("mobile_number"),
    bodyDataHas("reservation_date"),
    reservationDateIsValid,
    bodyDataHas("reservation_time"),
    reservationTimeIsValid,
    bodyDataHas("people"),
    peopleIsNumerical,
    timeOk,
    notTuesday,
    statusOkForNewReservation,
    create,
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    bodyDataHas("first_name"),
    bodyDataHas("last_name"),
    bodyDataHas("mobile_number"),
    bodyDataHas("reservation_date"),
    reservationDateIsValid,
    bodyDataHas("reservation_time"),
    reservationTimeIsValid,
    bodyDataHas("people"),
    peopleIsNumerical,
    timeOk,
    notTuesday,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    validStatus,
    asyncErrorBoundary(updateStatus),
  ],
  notFound,
};
