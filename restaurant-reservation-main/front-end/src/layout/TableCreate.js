import React, { useState } from "react";
import { useHistory } from "react-router-dom";

const addTable = (tableName, capacity) => {
  return { data: { table_name: tableName, capacity: capacity } };
};

function TableCreate() {
  const history = useHistory();
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const tableData = addTable(tableName, capacity);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const abortController = new AbortController();

    try {
      const response = await fetch(`${apiBaseUrl}/tables/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
        signal: abortController.signal,
      });

      if (response.ok) {
        console.log("Table submitted successfully");
        history.push("/dashboard");
        //window.location.reload();
      } else {
        console.error("Failed to submit table");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch request aborted");
      } else {
        console.error("Error submitting table:", error);
      }
    }

    return () => {
      abortController.abort();
    };
  };

  function handleCancelClick() {
    history.goBack();
  }

  return (
    <form name="create" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="table_name">Table Name:</label>
        <input
          id="table_name"
          name="table_name"
          type="text"
          required={true}
          pattern="^(?=.*?[\w\d])(?=.*?[\w\d]).*$"
          onChange={(e) => setTableName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="capacity">Capacity:</label>
        <input
          id="capacity"
          name="capacity"
          type="text"
          required={true}
          onChange={(e) => setCapacity(Number(e.target.value))}
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
}

export default TableCreate;
