import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Login from "./Pages/LoginForm";
import Register from "./Pages/Sign-upForm";
import AboutUs from "./Pages/about-us";
import Dashboard from "./Components/UserDashboard";
import Charities from "./Pages/Charities";
import AdminDashboard from "./Components/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import CharityDetails from "./Pages/CharityDetails";
import CharityDonation from "./Pages/CharityDonation";
import AdminCharityForm from "./Pages/AdminCharityForm";
import DrawExperience from "./Pages/DrawExperience";
import OAuthSuccess from "./Pages/OAuthSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/charities/:id" element={<CharityDetails />} />
        <Route path="/charities/:id/donate" element={<CharityDonation />} />
        <Route path="/draw-experience" element={<DrawExperience />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN CHARITY CREATE */}
        <Route
          path="/admin/charities/new"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminCharityForm />
            </ProtectedRoute>
          }
        />

        {/* ADMIN CHARITY EDIT */}
        <Route
          path="/admin/charities/:id/edit"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminCharityForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
