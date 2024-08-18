import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import moment from 'moment';

const addReservation = (
  reservationId,
  firstName,
  lastName,
  mobileNumber,
  reservationDate,
  reservationTime,
  people
) => {
  return {
    data: {
      reservation_id: reservationId,
      first_name: firstName,
      last_name: lastName,
      mobile_number: mobileNumber,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      people: people,
    },
  };
};

function ReservationEdit() {
  const history = useHistory();
  const { reservationId } = useParams();
  const [data, setData] = useState({});
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
  const [loading, setLoading] = useState(true);
  const [isMobileValid, setIsMobileValid] = useState(true);
  const [mobileWarning, setMobileWarning] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/reservations/${reservationId}`,
          {
            signal: abortController.signal,
          }
        );
        const jsonData = await response.json();

        if (response.ok) {
          setData(jsonData.data);
          setLoading(false);
        } else {
          console.error("Error fetching data:", jsonData.error);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch request aborted");
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (data) {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setMobileNumber(data.mobile_number);
      const dateString = data.reservation_date;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setReservationDate(`${year}-${month}-${day}`);
      let timeString = data.reservation_time;
      timeString = timeString?.slice(0, -3) || "";
      setReservationTime(timeString);
      setPeople(data.people);
    }
  }, [data]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const reservationData = addReservation(
      reservationId,
      firstName,
      lastName,
      mobileNumber,
      reservationDate,
      reservationTime,
      people
    );

    const abortController = new AbortController();
    let response;

    try {
      response = await fetch(`${apiBaseUrl}/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
        signal: abortController.signal, 
      });

    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
      }
    }

    setTuesdayWarning(false);
    setPastWarning(false);
    setEarlyWarning(false);
    setLateWarning(false);
    setMobileWarning(false);

    const responseData = await response.json();

    if (response.ok) {
      history.push(`/dashboard?date=${responseData.data.reservation_date.slice(0,10)}`);
    } else {
      switch (responseData.error) {
        case "Time is in the past!":
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
        case "Must be a valid mobile number!":
          setMobileWarning(true);
          break;
      }
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
    const date = moment(dateString);
    const dayName = date.format('dddd');
    return dayName;
  }

  function handleCancelClick() {
    history.goBack();
  }

  return (
    !loading && (
      <div>
        {(pastWarning || tuesdayWarning || earlyWarning || lateWarning || mobileWarning) && (
          <div className="alert alert-danger">
            {earlyWarning && <h5>Warning: Too early, not open yet!</h5>}
            {lateWarning && <h5>Warning: Too late, restaurant will close!</h5>}
            {pastWarning && (
              <h5>Warning: Date / Time must be in the future!</h5>
            )}
            {tuesdayWarning && <h5>Warning: We are closed on Tuesdays!</h5>}
            {mobileWarning && <h5>Warning: Mobile number is not valid!</h5>}
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
          isMobileValid={isMobileValid}
          setIsMobileValid={setIsMobileValid}
        />
      </div>
    )
  );
}

export default ReservationEdit;
