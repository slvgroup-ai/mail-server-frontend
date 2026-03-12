import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export default function SSOCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      fetch(`${API_BASE_URL}/auth/sso-login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
    }
    if (token) {
      // store token
      localStorage.setItem("sso_token", token);
      localStorage.setItem("token", token);

      // set user in context
      // setUser({ token });

      // redirect to protected page
      navigate("/mails");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Logging you in...</p>;
}