import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import NotFound from "./NotFound";
import ReservationCreate from "./ReservationCreate";
import TableCreate from "./TableCreate";
import TableList from "./TableList";
import ReservationSearch from "./ReservationSearch";
import ReservationSeat from "./ReservationSeat";
import ReservationEdit from "./ReservationEdit";
import DashboardWrapper from "../dashboard/DashboardWrapper";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes({ tables, todayString }) {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/reservations/new">
        <ReservationCreate />
      </Route>
      <Route path="/reservations/:reservationId/seat">
        <ReservationSeat tables={tables} />
      </Route>
      <Route path="/reservations/:reservationId/edit">
        <ReservationEdit />
      </Route>
      <Route path="/search">
        <ReservationSearch />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/tables/new">
        <TableCreate />
      </Route>
      <Route path="/tables">
        <TableList tables={tables} />
      </Route>
      <Route path="/dashboard">
        <DashboardWrapper tables={tables} todayString={todayString} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
