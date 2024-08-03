import React from 'react';
import { useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';

const DashboardWrapper = ({ tables, todayString }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get('date');
  const dateToUse = dateFromQuery || todayString;

  return (
    <Dashboard
      key={location.search} // Add the key prop here
      date={dateToUse}
      tables={tables}
    />
  );
};

export default DashboardWrapper;