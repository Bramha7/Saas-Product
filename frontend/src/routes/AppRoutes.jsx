import React from "react";
import Register from "../screens/Register.jsx";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import Login from "../screens/Login.jsx";
import Home from "../screens/Home.jsx";
import Project from "../screens/Project.jsx";
import UserAuth from "../auth/UserAuth.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <UserAuth>
            <Home />
          </UserAuth>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/project"
        element={
          <UserAuth>
            <Project />
          </UserAuth>
        }
      />
    </Routes>
  );
}
