import { Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import PaperDetail from "./pages/PaperDetail";
import Bookmarks from "./pages/Bookmarks";
import Settings from "./pages/Settings";
import { hasCompletedOnboarding } from "./lib/localStorage";

function RootRedirect() {
  return hasCompletedOnboarding() ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/onboarding" replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/paper" element={<PaperDetail />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
