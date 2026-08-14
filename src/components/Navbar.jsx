import { useRef, useState } from "react";
import { EMAIL_DOMAIN_SUB_COMPANY_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { theme } from "../styles/theme";
import { SearchIcon, SunIcon, MoonIcon, ChevronDown } from "./Icons";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { searchQuery, setSearchQuery } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const t = theme(dark);

  const userInitial = (
    user?.email?.[0] ||
    user?.name?.[0] ||
    "U"
  ).toUpperCase();
  const userEmail = user?.email || "user@example.com";
  const userName = user?.name || userEmail.split("@")[0];

  return (
    <header style={t.topbar}>
      {/* Logo */}
      <div style={t.logoArea}>
        <div style={t.hamburger}>
          <span style={t.bar} />
          <span style={t.bar} />
          <span style={t.bar} />
        </div>
        <span style={t.logoMailPrefix}>{EMAIL_DOMAIN_SUB_COMPANY_NAME}</span>
        <span style={t.logoMail}>M</span>
        <span style={t.logoText}>ail</span>
      </div>

      {/* Search */}
      <div style={t.searchWrap}>
        <SearchIcon />
        <input
          style={t.searchInput}
          placeholder="Search mail"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right: theme toggle + user menu */}
      <div style={t.topRight} ref={userMenuRef}>
        {/* Dark Mode Toggle */}
        <button
          style={t.themeToggleBtn}
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          <div style={t.toggleTrack}>
            <div style={t.toggleThumb}>{dark ? <MoonIcon /> : <SunIcon />}</div>
          </div>
        </button>

        {/* User Avatar */}
        <div
          name="user_avatar"
          data-testid="user_avatar"
          style={t.userAvatar}
          onClick={() => setShowUserMenu((v) => !v)}
        >
          {userInitial}
          <ChevronDown />
        </div>

        {showUserMenu && (
          <div style={t.userMenu}>
            <div style={t.userMenuHeader}>
              <div style={t.userMenuAvatar}>{userInitial}</div>
              <div>
                <div style={t.userMenuName}>{userName}</div>
                <div style={t.userMenuEmail}>{userEmail}</div>
              </div>
            </div>
            <div style={t.userMenuDivider} />
            <button
              name="logout_button"
              data-testid="logout_button"
              style={t.userMenuBtn}
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
