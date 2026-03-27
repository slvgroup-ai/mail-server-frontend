import { useEffect, useState, useRef } from "react";
import { API_BASE_URL ,EMAIL_DOMAIN_SUB_COMPANY_NAME} from "../config";
import { useAuth } from "../context/AuthContext";

/* ─── Icons (inline SVG components) ─── */
const Icon = ({ d, size = 20, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d={d} />
    </svg>
);

const InboxIcon = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const SendIcon = () => <Icon d="M22 2L11 13 M22 2L15 22l-4-9-9-4 18-7z" />;
const PencilIcon = () => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const ChevronDown = () => <Icon d="M6 9l6 6 6-6" size={16} />;
const XIcon = () => <Icon d="M18 6L6 18 M6 6l12 12" size={18} />;
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const MinimizeIcon = () => <Icon d="M5 12h14" size={16} />;
const MaximizeIcon = () => <Icon d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" size={16} />;

/* ─── Sun / Moon Icons ─── */
const SunIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
);

export default function MailInbox() {
    const { logout, user } = useAuth();

    // ── Dark mode: default TRUE ──
    const [dark, setDark] = useState(true);

    const [mails, setMails] = useState([]);
    const [sentMails, setSentMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("inbox");
    const [selected, setSelected] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [composeOpen, setComposeOpen] = useState(false);
    const [composeMinimized, setComposeMinimized] = useState(false);
    const [composeMaximized, setComposeMaximized] = useState(false);
    const [compose, setCompose] = useState({ to: "", subject: "", text: "" });
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [sendSuccess, setSendSuccess] = useState(false);
    const userMenuRef = useRef(null);

    /* ── Fetch inbox ── */
    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE_URL}/mail/my`, { credentials: "include" }).then(r => r.json()),
            fetch(`${API_BASE_URL}/mail/sent`, { credentials: "include" }).then(r => r.json()),
        ]).then(([inboxData, sentData]) => {
            setMails(inboxData.mails || []);
            setSentMails(sentData.mails || []);
        }).finally(() => setLoading(false));
    }, []);

    /* ── Close user menu on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const sendMail = async () => {
        setSending(true);
        setSendError(null);
        setSendSuccess(false);
        try {
            const res = await fetch(`${API_BASE_URL}/mail/send`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(compose),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Send failed");
            }
            const newSent = {
                _id: Date.now().toString(),
                from: user?.email || "me",
                to: compose.to,
                subject: compose.subject,
                text: compose.text,
                createdAt: new Date().toISOString(),
            };
            setSentMails(prev => [newSent, ...prev]);
            setSendSuccess(true);
            setTimeout(() => {
                setCompose({ to: "", subject: "", text: "" });
                setComposeOpen(false);
                setSendSuccess(false);
            }, 1200);
        } catch (err) {
            setSendError(err.message);
        } finally {
            setSending(false);
        }
    };

    const currentMails = view === "inbox" ? mails : sentMails;
    const filtered = currentMails.filter(m =>
        !searchQuery ||
        (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.to || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const userInitial = (user?.email?.[0] || user?.name?.[0] || "U").toUpperCase();
    const userEmail = user?.email || "user@example.com";
    const userName = user?.name || userEmail.split("@")[0];

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        return isToday
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    // ── Build dynamic style object based on dark flag ──
    const t = theme(dark);

    return (
        <div style={t.root}>
            {/* ── TOP BAR ── */}
            <header style={t.topbar}>
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

                <div style={t.searchWrap}>
                    <SearchIcon />
                    <input
                        style={t.searchInput}
                        placeholder="Search mail"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Right controls: dark toggle + user menu */}
                <div style={t.topRight} ref={userMenuRef}>
                    {/* ── Dark Mode Toggle ── */}
                    <button
                        style={t.themeToggleBtn}
                        onClick={() => setDark(v => !v)}
                        title={dark ? "Switch to light mode" : "Switch to dark mode"}
                        aria-label="Toggle dark mode"
                    >
                        <div style={t.toggleTrack}>
                            <div style={t.toggleThumb}>
                                {dark ? <MoonIcon /> : <SunIcon />}
                            </div>
                        </div>
                    </button>

                    {/* ── User Avatar ── */}
                    <div style={t.userAvatar} onClick={() => setShowUserMenu(v => !v)}>
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
                            <button style={t.userMenuBtn} onClick={logout}>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div style={t.body}>
                {/* ── SIDEBAR ── */}
                <aside style={t.sidebar}>
                    <button style={t.composeBtn} onClick={() => { setComposeOpen(true); setComposeMinimized(false); }}>
                        <PencilIcon />
                        <span>Compose</span>
                    </button>

                    <nav style={t.nav}>
                        <button
                            style={{ ...t.navItem, ...(view === "inbox" ? t.navItemActive : {}) }}
                            onClick={() => { setView("inbox"); setSelected(null); }}
                        >
                            <InboxIcon />
                            <span>Inbox</span>
                            {mails.length > 0 && <span style={t.badge}>{mails.length}</span>}
                        </button>
                        <button
                            style={{ ...t.navItem, ...(view === "sent" ? t.navItemActive : {}) }}
                            onClick={() => { setView("sent"); setSelected(null); }}
                        >
                            <SendIcon />
                            <span>Sent</span>
                        </button>
                    </nav>
                </aside>

                {/* ── MAIL LIST + DETAIL ── */}
                <main style={t.main}>
                    {selected ? (
                        <div style={t.detail}>
                            <button style={t.backBtn} onClick={() => setSelected(null)}>
                                ← Back to {view === "inbox" ? "Inbox" : "Sent"}
                            </button>
                            <h2 style={t.detailSubject}>{selected.subject || "(no subject)"}</h2>
                            <div style={t.metaCard}>
                                <div style={t.metaAvatar}>
                                    {((view === "inbox" ? selected.from : selected.to)?.[0] || "?").toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={t.metaFrom}>
                                            {view === "inbox" ? selected.from : `To: ${selected.to}`}
                                        </span>
                                        <span style={t.metaDate}>
                                            {new Date(selected.date || selected.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={t.metaTo}>
                                        {view === "inbox"
                                            ? <>to <span>{selected.to}</span></>
                                            : <>from <span>{selected.from}</span></>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div style={t.bodyWrap}>
                                {selected.html ? (
                                    <iframe srcDoc={selected.html} style={t.iframe} title="mail" sandbox="allow-same-origin" />
                                ) : (
                                    <pre style={t.plainText}>{selected.text || "(empty)"}</pre>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={t.listArea}>
                            <div style={t.listHeader}>
                                <span style={t.listTitle}>{view === "inbox" ? "Inbox" : "Sent"}</span>
                            </div>
                            {loading ? (
                                <div style={t.emptyState}>Loading…</div>
                            ) : filtered.length === 0 ? (
                                <div style={t.emptyState}>
                                    {searchQuery ? "No results found." : `No ${view === "inbox" ? "inbox" : "sent"} mails.`}
                                </div>
                            ) : (
                                filtered.map((mail) => (
                                    <div
                                        key={mail._id}
                                        style={t.mailRow}
                                        onClick={() => setSelected(mail)}
                                        onMouseEnter={e => e.currentTarget.style.background = dark ? "#2a2d31" : "#f2f6fc"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={t.mailAvatar}>
                                            {((view === "inbox" ? mail.from : mail.to)?.[0] || "?").toUpperCase()}
                                        </div>
                                        <div style={t.mailContent}>
                                            <div style={t.mailTop}>
                                                <span style={t.mailFrom}>
                                                    {view === "inbox" ? (mail.from || "Unknown") : (mail.to || "Unknown")}
                                                </span>
                                                <span style={t.mailDate}>{formatDate(mail.date || mail.createdAt)}</span>
                                            </div>
                                            <div style={t.mailSubject}>{mail.subject || "(no subject)"}</div>
                                            <div style={t.mailSnippet}>
                                                {(mail.text || "").slice(0, 100) || "(no preview)"}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ── COMPOSE WINDOW ── */}
            {composeOpen && (
                <div style={{
                    ...t.composeWindow,
                    ...(composeMaximized ? t.composeMaximized : {}),
                    ...(composeMinimized ? t.composeMinimized : {}),
                }}>
                    <div style={t.composeHeader}>
                        <span style={t.composeTitle}>New Message</span>
                        <div style={t.composeActions}>
                            <button style={t.composeIconBtn} onClick={() => setComposeMinimized(v => !v)} title="Minimize">
                                <MinimizeIcon />
                            </button>
                            <button style={t.composeIconBtn} onClick={() => setComposeMaximized(v => !v)} title="Full screen">
                                <MaximizeIcon />
                            </button>
                            <button style={t.composeIconBtn} onClick={() => { setComposeOpen(false); setCompose({ to: "", subject: "", text: "" }); setSendError(null); }} title="Close">
                                <XIcon />
                            </button>
                        </div>
                    </div>

                    {!composeMinimized && (
                        <>
                            <div style={t.composeFields}>
                                <div style={t.composeField}>
                                    <input
                                        placeholder="To"
                                        value={compose.to}
                                        onChange={e => setCompose({ ...compose, to: e.target.value })}
                                        style={t.composeInput}
                                    />
                                </div>
                                <div style={t.composeField}>
                                    <input
                                        placeholder="Subject"
                                        value={compose.subject}
                                        onChange={e => setCompose({ ...compose, subject: e.target.value })}
                                        style={t.composeInput}
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder=""
                                value={compose.text}
                                onChange={e => setCompose({ ...compose, text: e.target.value })}
                                style={t.composeTextarea}
                            />
                            <div style={t.composeFooter}>
                                {sendError && <span style={t.errorMsg}>{sendError}</span>}
                                {sendSuccess && <span style={t.successMsg}>✓ Sent!</span>}
                                <button
                                    style={{ ...t.sendBtn, ...(sending ? { opacity: 0.7 } : {}) }}
                                    onClick={sendMail}
                                    disabled={sending || !compose.to}
                                >
                                    {sending ? "Sending…" : "Send"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────── THEME FACTORY ─────────── */
function theme(dark) {
    const c = dark ? {
        bg: "#1f2124",
        bgAlt: "#292b2f",
        bgHover: "#2a2d31",
        border: "#3c3f43",
        text: "#e8eaed",
        textSub: "#9aa0a6",
        textMuted: "#80868b",
        searchBg: "#303134",
        navActive: "#283142",
        composeBg: "#292b2f",
        composeInput: "#292b2f",
        composeField: "#3c3f43",
        mainBg: "#1e2022",
        sidebarBg: "#1f2124",
    } : {
        bg: "#f6f8fc",
        bgAlt: "#fff",
        bgHover: "#f2f6fc",
        border: "#e0e0e0",
        text: "#202124",
        textSub: "#5f6368",
        textMuted: "#5f6368",
        searchBg: "#eaf1fb",
        navActive: "#D3E3FD",
        composeBg: "#fff",
        composeInput: "#fff",
        composeField: "#e0e0e0",
        mainBg: "#fff",
        sidebarBg: "#f6f8fc",
    };

    return {
        root: {
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            background: c.bg,
            fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
            color: c.text,
            overflow: "hidden",
        },
        topbar: {
            height: 64,
            background: c.bg,
            display: "flex",
            alignItems: "center",
            padding: "0 16px 0 8px",
            gap: 16,
            position: "relative",
            zIndex: 10,
        },
        logoArea: {
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 220,
            paddingLeft: 8,
        },
        hamburger: {
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "50%",
            marginRight: 4,
        },
        bar: {
            display: "block",
            width: 18,
            height: 2,
            background: c.textSub,
            borderRadius: 2,
        },
        logoMailPrefix: {
            fontSize: 28,
            fontWeight: 700,
            background: "linear-gradient(90deg, #EA4335, #FBBC05)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            letterSpacing: -1,
        },
        logoMail: {
            fontSize: 28,
            fontWeight: 700,
            color: "#EA4335",
            lineHeight: 1,
            letterSpacing: -1,
        },
        logoText: {
            fontSize: 22,
            fontWeight: 400,
            color: c.textSub,
            letterSpacing: -0.5,
            marginTop: 2,
        },
        searchWrap: {
            flex: 1,
            maxWidth: 720,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: c.searchBg,
            borderRadius: 24,
            padding: "0 20px",
            height: 46,
            color: c.textSub,
            transition: "box-shadow 0.2s",
        },
        searchInput: {
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: 16,
            color: c.text,
            outline: "none",
            fontFamily: "inherit",
        },
        topRight: {
            marginLeft: "auto",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
        },
        /* ── Dark Mode Toggle Button ── */
        themeToggleBtn: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
        },
        toggleTrack: {
            width: 42,
            height: 24,
            borderRadius: 12,
            background: dark ? "#3c3f43" : "#c8d8f0",
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: "0 3px",
            transition: "background 0.3s",
            justifyContent: dark ? "flex-end" : "flex-start",
        },
        toggleThumb: {
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: dark ? "#8ab4f8" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            color: dark ? "#1a73e8" : "#fbbc04",
            transition: "background 0.3s",
            flexShrink: 0,
        },
        userAvatar: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#EA4335",
            color: "#fff",
            width: 36,
            height: 36,
            borderRadius: "50%",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            justifyContent: "center",
            userSelect: "none",
        },
        userMenu: {
            position: "absolute",
            top: 44,
            right: 0,
            width: 280,
            background: c.bgAlt,
            borderRadius: 8,
            boxShadow: dark
                ? "0 4px 24px rgba(0,0,0,0.5)"
                : "0 4px 24px rgba(0,0,0,0.18)",
            overflow: "hidden",
            zIndex: 100,
            border: `1px solid ${c.border}`,
        },
        userMenuHeader: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 12px",
        },
        userMenuAvatar: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#EA4335",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
        },
        userMenuName: {
            fontWeight: 600,
            fontSize: 14,
            color: c.text,
        },
        userMenuEmail: {
            fontSize: 12,
            color: c.textSub,
            marginTop: 2,
        },
        userMenuDivider: {
            height: 1,
            background: c.border,
            margin: "0 0 4px",
        },
        userMenuBtn: {
            display: "block",
            width: "100%",
            padding: "10px 16px",
            textAlign: "left",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: c.text,
            fontFamily: "inherit",
            borderRadius: 0,
        },
        body: {
            flex: 1,
            display: "flex",
            overflow: "hidden",
        },
        sidebar: {
            width: 256,
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
            background: c.sidebarBg,
        },
        composeBtn: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "8px 8px 16px 16px",
            padding: "16px 24px 16px 20px",
            background: dark ? "#283142" : "#C2E7FF",
            border: "none",
            borderRadius: 16,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            color: dark ? "#8ab4f8" : "#001d35",
            fontFamily: "inherit",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.2s, background 0.2s",
        },
        nav: {
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "0 8px",
        },
        navItem: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "8px 16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            color: c.text,
            fontFamily: "inherit",
            fontWeight: 500,
            borderRadius: 24,
            width: "100%",
            textAlign: "left",
            transition: "background 0.15s",
        },
        navItemActive: {
            background: c.navActive,
            fontWeight: 700,
        },
        badge: {
            marginLeft: "auto",
            background: "transparent",
            fontSize: 12,
            fontWeight: 700,
            color: c.text,
        },
        main: {
            flex: 1,
            overflowY: "auto",
            background: c.mainBg,
            borderRadius: 16,
            margin: "0 16px 16px 0",
            border: `1px solid ${c.border}`,
        },
        listArea: {
            display: "flex",
            flexDirection: "column",
        },
        listHeader: {
            padding: "16px 24px 12px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        listTitle: {
            fontSize: 14,
            color: c.textSub,
            fontWeight: 500,
        },
        emptyState: {
            padding: 40,
            textAlign: "center",
            color: c.textSub,
            fontSize: 14,
        },
        mailRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "12px 20px",
            borderBottom: `1px solid ${c.border}`,
            cursor: "pointer",
            transition: "background 0.15s",
            background: "transparent",
        },
        mailAvatar: {
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: dark ? "#444" : "#5f6368",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
            marginTop: 2,
        },
        mailContent: {
            flex: 1,
            minWidth: 0,
        },
        mailTop: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
        },
        mailFrom: {
            fontWeight: 700,
            fontSize: 14,
            color: c.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        mailDate: {
            fontSize: 12,
            color: c.textSub,
            flexShrink: 0,
            marginLeft: 8,
        },
        mailSubject: {
            fontSize: 14,
            color: c.text,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2,
        },
        mailSnippet: {
            fontSize: 13,
            color: c.textSub,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        detail: {
            padding: "24px 40px",
            maxWidth: 800,
        },
        backBtn: {
            background: "none",
            border: "none",
            color: dark ? "#8ab4f8" : "#1a73e8",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 0 16px",
            fontFamily: "inherit",
            display: "block",
        },
        detailSubject: {
            fontSize: 24,
            fontWeight: 400,
            marginBottom: 20,
            color: c.text,
        },
        metaCard: {
            display: "flex",
            gap: 12,
            marginBottom: 20,
            alignItems: "flex-start",
        },
        metaAvatar: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: dark ? "#444" : "#5f6368",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 16,
            flexShrink: 0,
        },
        metaFrom: {
            fontWeight: 600,
            fontSize: 14,
            color: c.text,
        },
        metaDate: {
            fontSize: 12,
            color: c.textSub,
        },
        metaTo: {
            fontSize: 13,
            color: c.textSub,
            marginTop: 2,
        },
        bodyWrap: {
            padding: "20px 0",
            borderTop: `1px solid ${c.border}`,
            marginTop: 8,
        },
        plainText: {
            whiteSpace: "pre-wrap",
            fontSize: 14,
            color: c.text,
            lineHeight: 1.6,
            fontFamily: "inherit",
            margin: 0,
        },
        iframe: {
            width: "100%",
            minHeight: 400,
            border: "none",
        },
        /* Compose */
        composeWindow: {
            position: "fixed",
            bottom: 0,
            right: 24,
            width: 500,
            background: c.composeBg,
            borderRadius: "12px 12px 0 0",
            boxShadow: dark
                ? "0 8px 40px rgba(0,0,0,0.6)"
                : "0 8px 40px rgba(0,0,0,0.22)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        },
        composeMaximized: {
            top: 0, left: 0, right: 0, bottom: 0,
            width: "100%",
            borderRadius: 0,
        },
        composeMinimized: {
            height: 48,
        },
        composeHeader: {
            background: dark ? "#1a1a2e" : "#404040",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            flexShrink: 0,
        },
        composeTitle: {
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
        },
        composeActions: {
            display: "flex",
            gap: 4,
        },
        composeIconBtn: {
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            opacity: 0.8,
        },
        composeFields: {
            borderBottom: `1px solid ${c.border}`,
        },
        composeField: {
            borderBottom: `1px solid ${c.border}`,
        },
        composeInput: {
            width: "100%",
            border: "none",
            padding: "10px 16px",
            fontSize: 14,
            color: c.text,
            background: c.composeBg,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
        },
        composeTextarea: {
            flex: 1,
            width: "100%",
            border: "none",
            padding: "12px 16px",
            fontSize: 14,
            color: c.text,
            background: c.composeBg,
            outline: "none",
            fontFamily: "inherit",
            resize: "none",
            minHeight: 260,
            boxSizing: "border-box",
        },
        composeFooter: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderTop: `1px solid ${c.border}`,
            background: c.composeBg,
        },
        sendBtn: {
            background: dark ? "#8ab4f8" : "#0b57d0",
            color: dark ? "#001d35" : "#fff",
            border: "none",
            borderRadius: 20,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
        },
        errorMsg: {
            color: "#EA4335",
            fontSize: 13,
            flex: 1,
        },
        successMsg: {
            color: "#34a853",
            fontSize: 13,
            flex: 1,
            fontWeight: 600,
        },
    };
}