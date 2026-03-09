import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home"; 
import Register from "./pages/Registration/Registration";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import WeightStatistic from "./pages/Weight_Statistic/WeightStatistic";
import PersonalProducts from "./pages/Personal_Products/PersonalProducts";
import PersonalMeals from "./pages/Diary/PersonalMeals";
import Settings from "./pages/Settings/Settings";
import Family from "./pages/Family/Family";
import FamilyMemberProfile from "./pages/FamilyMemberProfile/FamilyMemberProfile";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registration" element={<Register />} />
        <Route path="/diary" element={<PersonalMeals />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/weight-statistic" element={<WeightStatistic />} />
        <Route path="/my-products" element={<PersonalProducts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/families" element={<Family />} />
        <Route path="/family/member/:userId" element={<FamilyMemberProfile />} />     
      </Routes>
    </Router>
  );
}