import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import { useEffect } from "react";
const AUTH_SERVER = "http://localhost:5174"; // SSO frontend

export default function Login() {
  useEffect(() => {
    const redirect = `${window.location.origin}/sso/callback`;
    window.location.href = `${AUTH_SERVER}/login?redirect=${redirect}`;
  }, []);

  return <p>Redirecting to SSO login...</p>;
  const { login: authLogin } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "signup"

  // login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup fields
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authLogin(`${loginUsername}@slvai.tech`, loginPassword);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── SIGNUP ── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!signupUsername.trim()) return setError("Username is required");
    if (signupPassword.length < 6) return setError("Password must be at least 6 characters");
    if (signupPassword !== signupConfirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName || signupUsername,
          email: `${signupUsername}@slvai.tech`,
          password: signupPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created! Signing you in…");
      await authLogin(`${signupUsername}@slvai.tech`, signupPassword);
    } catch (err) {
      setError(err.message || "Signup failed");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  /* ─── STYLES ─── */
  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#050d1a",
      position: "relative",
      overflow: "hidden",
    },
    gridBg: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
      pointerEvents: "none",
    },
    glow1: {
      position: "absolute",
      width: 500,
      height: 500,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
      top: "-10%",
      left: "-10%",
      pointerEvents: "none",
    },
    glow2: {
      position: "absolute",
      width: 400,
      height: 400,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(2,132,199,0.06) 0%, transparent 70%)",
      bottom: "-10%",
      right: "-5%",
      pointerEvents: "none",
    },
    card: {
      position: "relative",
      zIndex: 10,
      width: 420,
      background: "rgba(8,18,34,0.95)",
      border: "1px solid rgba(14,165,233,0.13)",
      borderRadius: 18,
      padding: "38px 36px 32px",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 72px rgba(0,0,0,0.55), 0 0 60px rgba(14,165,233,0.05)",
    },
    logoWrap: {
      textAlign: "center",
      marginBottom: 28,
    },
    logoBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: 13,
      background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
      boxShadow: "0 6px 20px rgba(14,165,233,0.38)",
      fontSize: 22,
      fontWeight: 800,
      color: "#fff",
      marginBottom: 12,
      letterSpacing: -1,
    },
    logoTitle: {
      display: "block",
      fontSize: 22,
      fontWeight: 700,
      color: "#f0f9ff",
      letterSpacing: "-0.5px",
    },
    logoSub: {
      display: "block",
      fontSize: 12.5,
      color: "#475569",
      marginTop: 3,
      letterSpacing: "0.02em",
    },
    tabs: {
      display: "flex",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: 3,
      marginBottom: 26,
      gap: 3,
    },
    tab: (active) => ({
      flex: 1,
      padding: "9px 0",
      border: "none",
      borderRadius: 7,
      fontFamily: "inherit",
      fontSize: 13.5,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.18s",
      color: active ? "#fff" : "#475569",
      background: active ? "#0ea5e9" : "transparent",
      boxShadow: active ? "0 2px 10px rgba(14,165,233,0.35)" : "none",
    }),
    msgBox: (type) => ({
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      padding: "10px 13px",
      borderRadius: 8,
      fontSize: 13,
      marginBottom: 18,
      background: type === "error" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
      border: `1px solid ${type === "error" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
      color: type === "error" ? "#fca5a5" : "#86efac",
      lineHeight: 1.5,
    }),
    label: {
      display: "block",
      fontSize: 11.5,
      fontWeight: 700,
      color: "#64748b",
      marginBottom: 7,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
    },
    group: {
      marginBottom: 15,
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 9,
      color: "#e2e8f0",
      fontFamily: "inherit",
      fontSize: 14.5,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    emailWrap: {
      display: "flex",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 9,
      overflow: "hidden",
    },
    emailInput: {
      flex: 1,
      padding: "11px 14px",
      background: "rgba(255,255,255,0.04)",
      border: "none",
      color: "#e2e8f0",
      fontFamily: "inherit",
      fontSize: 14.5,
      outline: "none",
      minWidth: 0,
    },
    emailSuffix: {
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      background: "rgba(14,165,233,0.08)",
      borderLeft: "1px solid rgba(14,165,233,0.15)",
      color: "#38bdf8",
      fontSize: 13.5,
      fontWeight: 600,
      whiteSpace: "nowrap",
      userSelect: "none",
    },
    previewText: {
      marginTop: 5,
      paddingLeft: 2,
      fontSize: 11.5,
      color: "#0ea5e9",
    },
    submitBtn: {
      width: "100%",
      padding: "13px 0",
      marginTop: 8,
      border: "none",
      borderRadius: 9,
      fontFamily: "inherit",
      fontSize: 14.5,
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
      boxShadow: "0 4px 16px rgba(14,165,233,0.32)",
      transition: "opacity 0.15s, transform 0.15s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      letterSpacing: "0.01em",
    },
    footerNote: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 12.5,
      color: "#334155",
    },
    footerLink: {
      color: "#38bdf8",
      cursor: "pointer",
      fontWeight: 600,
      background: "none",
      border: "none",
      fontFamily: "inherit",
      fontSize: "inherit",
      padding: 0,
    },
  };

  /* focus highlight via onFocus/onBlur */
  const focusStyle = { borderColor: "#0ea5e9", boxShadow: "0 0 0 3px rgba(14,165,233,0.12)", background: "rgba(14,165,233,0.05)" };
  const blurStyle = {};
  const addFocus = (e) => Object.assign(e.target.style, focusStyle);
  const removeFocus = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "rgba(255,255,255,0.04)";
  };
  const addEmailFocus = (e) => {
    const wrap = e.target.closest("[data-emailwrap]");
    if (wrap) { wrap.style.borderColor = "#0ea5e9"; wrap.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }
  };
  const removeEmailFocus = (e) => {
    const wrap = e.target.closest("[data-emailwrap]");
    if (wrap) { wrap.style.borderColor = "rgba(255,255,255,0.08)"; wrap.style.boxShadow = "none"; }
  };

  return (
    <div style={s.page}>
      <div style={s.gridBg} />
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoBadge}>M</div>
          <span style={s.logoTitle}>slvai mail</span>
          <span style={s.logoSub}>@slvai.tech workspace</span>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(mode === "login")} onClick={() => switchMode("login")}>Sign In</button>
          <button style={s.tab(mode === "signup")} onClick={() => switchMode("signup")}>Create Account</button>
        </div>

        {/* Messages */}
        {error && <div style={s.msgBox("error")}>⚠ {error}</div>}
        {success && <div style={s.msgBox("success")}>✓ {success}</div>}

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={s.group}>
              <label style={s.label}>Email</label>
              <div data-emailwrap style={{ ...s.emailWrap, transition: "border-color 0.2s, box-shadow 0.2s" }}>
                <input
                  style={s.emailInput}
                  placeholder="yourname"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value.replace(/@.*/g, "").toLowerCase())}
                  onFocus={addEmailFocus}
                  onBlur={removeEmailFocus}
                  autoComplete="username"
                  required
                />
                <div style={s.emailSuffix}>@slvai.tech</div>
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onFocus={addFocus}
                onBlur={removeFocus}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.65 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </form>
        )}

        {/* ── SIGNUP ── */}
        {mode === "signup" && (
          <form onSubmit={handleSignup}>
            <div style={s.group}>
              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                type="text"
                placeholder="Your full name"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                onFocus={addFocus}
                onBlur={removeFocus}
                autoComplete="name"
              />
            </div>

            <div style={s.group}>
              <label style={s.label}>Choose your email</label>
              <div data-emailwrap style={{ ...s.emailWrap, transition: "border-color 0.2s, box-shadow 0.2s" }}>
                <input
                  style={s.emailInput}
                  placeholder="yourname"
                  value={signupUsername}
                  onChange={e => setSignupUsername(e.target.value.replace(/[@\s]/g, "").toLowerCase())}
                  onFocus={addEmailFocus}
                  onBlur={removeEmailFocus}
                  autoComplete="username"
                  required
                />
                <div style={s.emailSuffix}>@slvai.tech</div>
              </div>
              {signupUsername && (
                <div style={s.previewText}>
                  ✦ <strong>{signupUsername}@slvai.tech</strong>
                </div>
              )}
            </div>

            <div style={s.group}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Min. 6 characters"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                onFocus={addFocus}
                onBlur={removeFocus}
                autoComplete="new-password"
                required
              />
            </div>

            <div style={s.group}>
              <label style={s.label}>Confirm Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Repeat your password"
                value={signupConfirm}
                onChange={e => setSignupConfirm(e.target.value)}
                onFocus={addFocus}
                onBlur={removeFocus}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.65 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Creating account…
                </>
              ) : "Create Account →"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={s.footerNote}>
          {mode === "login" ? (
            <>No account?{" "}
              <button style={s.footerLink} onClick={() => switchMode("signup")}>Create one</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button style={s.footerLink} onClick={() => switchMode("login")}>Sign in</button>
            </>
          )}
        </div>
      </div>

      {/* Spinner keyframe injected minimally */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}