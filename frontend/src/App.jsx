import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import CommandCenter from "./pages/CommandCenter.jsx";
import Forecast from "./pages/Forecast.jsx";
import RiskIntelligence from "./pages/RiskIntelligence.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import ScenarioLab from "./pages/ScenarioLab.jsx";
import ModelIntelligence from "./pages/ModelIntelligence.jsx";
import DataHealth from "./pages/DataHealth.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/*" element={<Login />} />
      <Route path="/signup/*" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<CommandCenter />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="risk-intelligence" element={<RiskIntelligence />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="scenario-lab" element={<ScenarioLab />} />
        <Route path="model-intelligence" element={<ModelIntelligence />} />
        <Route path="data-health" element={<DataHealth />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
