import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import "./Reservations.css";

export const ReservationSeat = ({ tables = [] }) => {
  const history = useHistory();
  const { reservationId } = useParams();
  const [tablesError, setTablesError] = useState(null);
  const [warning, setWarning] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const tableId = event.target.elements.table_id.value;

    const reservationData = { data: { reservation_id: reservationId } };

    setWarning(false);

    try {
      const response = await fetch(`${apiBaseUrl}/tables/${tableId}/seat`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        history.push("/");
        window.location.reload();
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setWarning(true);
          setTablesError(errorData.error);
        }
      }
    } catch (error) {
      console.error("Error seating reservation:", error);
    }
  };

  function handleCancelClick() {
    history.push("/");
  }

  if (tables.length !== 0) {
    return (
      <div>
        {warning && (
          <div className="alert alert-danger">
            <h5>{tablesError}</h5>
          </div>
        )}
        <div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="table_id">Table number:</label>
            <select id="table_id" name="table_id">
              {tables.map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_name + " - " + table.capacity}
                </option>
              ))}
            </select>
            <button
              type="submit"
              href={`/reservations/${reservationId}/seat`}
              data-testid="formSubmit"
            >
              Submit
            </button>
            <button type="button" onClick={handleCancelClick}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  } else {
    return <h4> No tables defined! </h4>;
  }
};

export default ReservationSeat;
