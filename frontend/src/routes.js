import React from "react";
import { Route } from "react-router-dom";
import Hoc from "./hoc/hoc"
import Chat from "./containers/Chat";

//navigates to chatID in Contact.js
const BaseRouter = () => (
  <Hoc>
    <Route exact path="/:chatID/" component={Chat} />
  </Hoc>
);

export default BaseRouter;