import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quiz from "./pages/Quiz";
import AuthCard from "./pages/AuthCard";
import Dashboard from "./pages/Dashboard";
import Grocery from "./pages/Grocery";
import Feedback from "./pages/Feedback";
import Layout from "./pages/Layout";
import ProfileManagement from "./pages/ProfileManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthCard />} />
        <Route path="/auth" element={<AuthCard />} />
        <Route path="/quiz" element={<Quiz />} />

        {/* Sidebar layout for authenticated pages */}
        <Route element={<Layout />}>
          <Route path="/profileManagement" element={<ProfileManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
