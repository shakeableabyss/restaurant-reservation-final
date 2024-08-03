import React, { useEffect, useState, useRef } from "react";
import { listReservations } from "../utils/api";
import ReservationList from "../layout/ReservationList";
import TableList from "../layout/TableList";
import ErrorAlert from "../layout/ErrorAlert";
import { today } from "../utils/date-time";
import { useHistory } from "react-router-dom";

/**
 * Defines the dashboard page.
 * @param paramDate
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, tables }) {
  console.log("render!")
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();
  const abortController = useRef(null);

  useEffect(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.current.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.current.abort();
  }, []);

  // Helper function to format the date
  const formatDate = (date) => {
    const [yyyy, mm, dd] = date.split("-");

    const yearNum = Number(yyyy);
    const monthNum = Number(mm) - 1;
    const dayNum = Number(dd);

    const dateObj = new Date(yearNum, monthNum, dayNum);
    const month = String(dateObj.getMonth() + 1);
    const day = String(dateObj.getDate());
    const year = dateObj.getFullYear();
    const dayName = getDayOfWeek(dateObj);

    return `${dayName}, ${month}/${day}/${year}`;
  };

  // Helper function to get the day of the week
  const getDayOfWeek = (dateObj) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const theDate = new Date(dateObj);
    const dayIndex = theDate.getDay();
    return daysOfWeek[dayIndex];
  };

  function getCurrentParamDate() {
    const [yyyy, mm, dd] = date.split("-");

    const yearNum = Number(yyyy);
    const monthNum = Number(mm);
    const dayNum = Number(dd);

    return new Date(yearNum, monthNum, dayNum);
  }

  function nextClick() {
    const newDate = getCurrentParamDate();

    // Add one day to the Date object
    newDate.setDate(newDate.getDate() + 1);

    // Format the new date back into the desired string format
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth()).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const goto = `/dashboard?date=${year}-${month}-${day}`;

    history.push(goto);
  }

  function backClick() {
    const newDate = getCurrentParamDate();

    // Add one day to the Date object
    newDate.setDate(newDate.getDate() - 1);

    // Format the new date back into the desired string format
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth()).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const goto = `/dashboard?date=${year}-${month}-${day}`;

    history.push(goto);
  }

  function todayClick() {
    // Parse the date string into a Date object
    const todayDate = today();

    const goto = `/dashboard?date=${todayDate}`;

    history.push(goto);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <div className="left-side">
          <h4 className="mb-0">Reservations for date: {formatDate(date)}</h4>
          <div className="button-container">
            <button type="button" className="btn-custom" onClick={backClick}>
              Previous
            </button>
            <button type="button" className="btn-custom" onClick={todayClick}>
              Today
            </button>
            <button type="button" className="btn-custom" onClick={nextClick}>
              Next
            </button>
          </div>
          <ErrorAlert error={reservationsError} />
          <ReservationList reservations={reservations} />
        </div>
        <div className="right-side">
          <TableList tables={tables} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
