import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import Routes from "./Routes";
import { listTables } from "../utils/api";
import { today } from "../utils/date-time";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tablesError, setTablesError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    setTablesError(null);
    listTables({}, abortController.signal)
      .then(setTables)
      .then(setLoading(false))
      .catch(setTablesError);
    return () => abortController.abort();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row h-100">
        <div className="col-md-2 side-bar">
          <Menu />
        </div>
        <div className="col">
          <Routes tables={tables} todayString={today()} />
        </div>
      </div>
    </div>
  );
}

export default Layout;
