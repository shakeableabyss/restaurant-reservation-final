import React from "react";
import { useHistory } from "react-router-dom";
import "./Reservations.css";

export const ReservationList = ({ reservations }) => {
  const history = useHistory();

  function formattedTextLine1(reservation) {
    const fTime = reservation.reservation_time.slice(0, -3);
    const fName = reservation.first_name + " " + reservation.last_name;
    return fTime + " - " + fName + " - " + reservation.status;
  }

  function formattedTextLine2(reservation) {
    return (
      "    Party of " + reservation.people + ", #" + reservation.mobile_number
    );
  }

  function handleSeatClick(reservation_id) {
    history.push(`/reservations/${reservation_id}/seat`);
  }

  function handleEditClick(reservation_id) {
    history.push(`/reservations/${reservation_id}/edit`);
  }

  const handleCancelClick = async (event) => {
    event.preventDefault();

    const reservationId = event.target.getAttribute(
      "data-reservation-id-cancel"
    );
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const confirmCancel = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );

    if (confirmCancel) {
      try {
        const response = await fetch(
          `${apiBaseUrl}/reservations/${reservationId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: { status: "cancelled" } }),
          }
        );

        if (response.ok) {
          history.push("/");
          window.location.reload();
        } else {
          console.error("Failed to cancel reservation");
        }
      } catch (error) {
        console.error("Error canceling reservation:", error);
      }
    }
  };

  if (reservations.length !== 0) {
    return (
      <div>
        {reservations.map((reservation) => (
          <div id="itemContainer">
            <h4 data-reservation-id-status={reservation.reservation_id}>
              {formattedTextLine1(reservation)}
            </h4>
            <h5>{formattedTextLine2(reservation)}</h5>
            <div className="button-container">
              {reservation.status === "booked" && (
                <>
                  <button
                    type="button"
                    href={`/reservations/${reservation.reservation_id}/edit`}
                    onClick={() => handleEditClick(reservation.reservation_id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    href={`/reservations/${reservation.reservation_id}/seat`}
                    onClick={() => handleSeatClick(reservation.reservation_id)}
                  >
                    Seat
                  </button>
                </>
              )}
              <button
                type="button"
                data-reservation-id-cancel={reservation.reservation_id}
                onClick={handleCancelClick}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    return <h4> No reservations for this day! </h4>;
  }
};

export default ReservationList;
