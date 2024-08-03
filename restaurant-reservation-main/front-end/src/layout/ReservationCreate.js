import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ReservationForm from "./ReservationForm";

const addReservation = (
  firstName,
  lastName,
  mobileNumber,
  reservationDate,
  reservationTime,
  people
) => {
  return {
    data: {
      first_name: firstName,
      last_name: lastName,
      mobile_number: mobileNumber,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      people: people,
    },
  };
};

function ReservationCreate() {
  const history = useHistory();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState("");
  const [tuesdayWarning, setTuesdayWarning] = useState(false);
  const [pastWarning, setPastWarning] = useState(false);
  const [earlyWarning, setEarlyWarning] = useState(false);
  const [lateWarning, setLateWarning] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const reservationData = addReservation(
      firstName,
      lastName,
      mobileNumber,
      reservationDate,
      reservationTime,
      people
    );
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const abortController = new AbortController();

    try {
      const response = await fetch(`${apiBaseUrl}/reservations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
        signal: abortController.signal,
      });

      setTuesdayWarning(false);
      setPastWarning(false);
      setEarlyWarning(false);
      setLateWarning(false);

      const responseData = await response.json();

      if (response.ok) {
        const dateObj = new Date(responseData.data.reservation_date);
        const month = String(dateObj.getMonth() + 1);
        const day = String(dateObj.getDate());
        const year = dateObj.getFullYear();

        const goto = `${year}-${month}-${day}`;
        history.push(`/dashboard?date=${goto}`);
      } else {
        switch (responseData.error) {
          case "Time must be in the future!":
          case "Date must be in the future!":
            setPastWarning(true);
            if (!tuesdayWarning && checkForTuesday(reservationDate)) {
              setTuesdayWarning(true);
            }
            break;
          case "We are closed on Tuesdays!":
            setTuesdayWarning(true);
            break;
          case "Time is too early!":
            setEarlyWarning(true);
            break;
          case "Time is too late!":
            setLateWarning(true);
            break;
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function checkForTuesday(dateString) {
    const dayName = getDayOfWeek(dateString);
    if (dayName === "Tuesday") {
      return true;
    } else {
      return false;
    }
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

  // Define the function to be executed when the button is clicked
  function handleCancelClick() {
    history.goBack();
  }

  return (
    <div>
      {(pastWarning || tuesdayWarning || earlyWarning || lateWarning) && (
        <div className="alert alert-danger">
          {earlyWarning && <h5>Warning: Too early, not open yet!</h5>}
          {lateWarning && <h5>Warning: Too late, restaurant will close!</h5>}
          {pastWarning && <h5>Warning: Date / Time must be in the future!</h5>}
          {tuesdayWarning && <h5>Warning: We are closed on Tuesdays!</h5>}
        </div>
      )}
      <ReservationForm
        firstName={firstName}
        lastName={lastName}
        mobileNumber={mobileNumber}
        reservationDate={reservationDate}
        reservationTime={reservationTime}
        people={people}
        handleSubmit={handleSubmit}
        handleCancelClick={handleCancelClick}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setMobileNumber={setMobileNumber}
        setReservationDate={setReservationDate}
        setReservationTime={setReservationTime}
        setPeople={setPeople}
      />
    </div>
  );
}

export default ReservationCreate;
