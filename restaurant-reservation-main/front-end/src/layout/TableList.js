import React from "react";
import "./Reservations.css";
import { useHistory } from "react-router-dom";

export const TableList = ({ tables }) => {
  const history = useHistory();

  const handleFinish = async (event) => {
    event.preventDefault();

    const tableId = event.target.getAttribute("data-table-id-finish");
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const confirmFinish = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );

    if (confirmFinish) {
      try {
        const response = await fetch(`${apiBaseUrl}/tables/${tableId}/seat`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          history.push("/");
          window.location.reload();
        } else {
          const errorData = await response.json();
          if (errorData.error) {
            console.error("Error:", errorData.error);
          }
        }
      } catch (error) {
        console.error("Error finishing table:", error);
      }
    }
  };

  if (tables.length !== 0) {
    return (
      <div>
        {tables.map((table) => (
          <div id="itemContainer">
            <h5 data-table-id-status={table.table_id}>{table.table_name}</h5>
            <h6 data-table-id-status={table.table_id}>
              Seats {table.capacity} people
            </h6>
            <h6 data-table-id-status={table.table_id}>
              {table.reservation_id ? "occupied" : "free"}
            </h6>

            {table.reservation_id !== null && (
              <div className="button-container">
                <button
                  type="button"
                  data-table-id-finish={table.table_id}
                  onClick={handleFinish}
                >
                  Finish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  } else {
    return <h4> No tables defined! </h4>;
  }
};

export default TableList;
