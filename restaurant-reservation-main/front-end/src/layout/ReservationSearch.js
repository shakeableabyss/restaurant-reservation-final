import React, { useState } from "react";
import ReservationList from "../layout/ReservationList";

/**
 * Defines the "Not Found" page that is displayed for any unmatched route.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function ReservationSearch() {
  const [number, setNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const abortController = new AbortController();

    try {
      const response = await fetch(
        `${apiBaseUrl}/reservations?mobile_number=${number}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setReservations(responseData.data);
        setSearchPerformed(true);
      } else {
        console.error("Search Failed");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch request aborted");
      } else {
        console.error("Error fetching data:", error);
      }
    }

    return () => {
      abortController.abort();
    };
  };

  return (
    <div>
      <form name="search" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            id="number"
            name="mobile_number"
            type="text"
            required={true}
            placeholder="Enter a customer's phone number"
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div className="button-container">
          <button type="submit" data-testid="formSubmit">
            Find
          </button>
        </div>
      </form>
      {searchPerformed && reservations.length === 0 ? (
        <h4>No reservations found</h4>
      ) : (
        reservations.length !== 0 && (
          <ReservationList reservations={reservations} />
        )
      )}
    </div>
  );
}

export default ReservationSearch;
