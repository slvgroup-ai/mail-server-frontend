import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MailInbox from "./pages/MailInbox";
import { useAuth } from "./context/AuthContext";
import SSOCallback from "./pages/SSOCallback";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* SSO callback */}
        <Route path="/sso/callback" element={<SSOCallback />} />


        {/* Public */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/mails" />}
        />

        {/* Protected */}
        <Route
          path="/mails"
          element={user ? <MailInbox /> : <Navigate to="/login" />}
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/mails" />} />
        <Route path="*" element={<Navigate to="/mails" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;