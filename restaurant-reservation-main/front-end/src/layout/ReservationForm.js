import React, { useState } from "react";

const ReservationForm = ({
  firstName,
  lastName,
  mobileNumber,
  reservationDate,
  reservationTime,
  people,
  handleSubmit,
  handleCancelClick,
  setFirstName,
  setLastName,
  setMobileNumber,
  setReservationDate,
  setReservationTime,
  setPeople,
}) => {

  const [isMobileValid, setIsMobileValid] = useState(true);

  const handleChangeMobile = (e) => {
    const value = e.target.value;
    const phoneNumberRegex = /^(\(?\d{3}\)?[-\s]?|\d{3}[-\s]?)\d{3}[-\s]?\d{4}$/;
    setIsMobileValid(phoneNumberRegex.test(value));
    setMobileNumber(value);
  };

  return (
    <form name="create" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="first_name">First Name:</label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          required={true}
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
        />
      </div>
      <div className="form-row">
        <label htmlFor="last_name">Last Name:</label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          required={true}
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
        />
      </div>
      <div className="form-row">
        <label htmlFor="mobile_number">Mobile Number:</label>
        <input
          id="mobile_number"
          name="mobile_number"
          type="text"
          required={true}
          onChange={handleChangeMobile}
          value={mobileNumber}
          style={{ borderColor: isMobileValid ? 'black' : 'red' }}
      />
      {!isMobileValid && <span>Invalid phone number format</span>}
      </div>
      <div className="form-row">
        <label htmlFor="reservation_date">Reservation Date:</label>
        <input
          id="reservation_date"
          name="reservation_date"
          type="date"
          required={true}
          onChange={(e) => setReservationDate(e.target.value)}
          value={reservationDate}
        />
      </div>
      <div className="form-row">
        <label htmlFor="reservation_time">Reservation Time:</label>
        <input
          id="reservation_time"
          name="reservation_time"
          type="time"
          pattern="^(0?[1-9]|1[0-2])(:?[0-5][0-9])?\s?([AaPp][Mm])|([0-9]{2}(:?[0-9]{2})?)$"
          required={true}
          onChange={(e) => setReservationTime(e.target.value)}
          value={reservationTime}
        />
      </div>
      <div className="form-row">
        <label htmlFor="people">Number of People:</label>
        <input
          id="people"
          name="people"
          type="number"
          required={true}
          onChange={(e) => setPeople(Number(e.target.value))}
          value={people}
        />
      </div>
      <div className="button-container">
        <button type="submit" data-testid="formSubmit">
          Submit
        </button>
        <button type="button" onClick={handleCancelClick}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;
