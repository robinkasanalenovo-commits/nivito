// ═══════════════════════════════════════════════════════
// 🎨 NIVITO DESIGN SYSTEM — Central theme tokens
// ═══════════════════════════════════════════════════════

export const theme = {
  bg: {
    page: "linear-gradient(180deg, #fef3c7 0%, #fed7aa 50%, #fef3c7 100%)",
    pageSoft: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
    card: "#ffffff",
    cardSoft: "#fafaf9",
  },

  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    300: "#6ee7b7",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    900: "#064e3b",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    gradientDark: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
    shadow: "0 8px 20px rgba(16,185,129,0.25)",
    shadowLg: "0 20px 40px rgba(5,150,105,0.3)",
  },

  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },

  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    600: "#db2777",
    900: "#831843",
    gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
  },

  danger: {
    50: "#fef2f2",
    200: "#fecaca",
    600: "#dc2626",
    700: "#b91c1c",
    900: "#7f1d1d",
  },

  gray: {
    50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb",
    300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280",
    600: "#4b5563", 700: "#374151", 900: "#111827",
  },

  font: {
    family: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    sizes: { xs: 11, sm: 12, base: 14, md: 15, lg: 16, xl: 18, "2xl": 22, "3xl": 28, "4xl": 36 },
    weights: { normal: 500, semi: 600, bold: 700, extra: 800, black: 900 },
  },

  radius: { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 32, full: 999 },
  shadow: {
    sm: "0 2px 8px rgba(0,0,0,0.04)",
    md: "0 4px 14px rgba(0,0,0,0.08)",
    lg: "0 10px 25px rgba(0,0,0,0.10)",
    xl: "0 20px 40px rgba(0,0,0,0.12)",
    glow: "0 0 0 4px rgba(16,185,129,0.1)",
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32 },
} as const;

export const ui = {
  page: {
    minHeight: "100vh",
    background: theme.bg.page,
    padding: "16px 0 100px",
    fontFamily: theme.font.family,
  } as React.CSSProperties,

  phone: {
    maxWidth: 430, margin: "0 auto", padding: "0 12px",
    display: "grid", gap: 14, position: "relative",
  } as React.CSSProperties,

  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  } as React.CSSProperties,

  iconBtn: {
    width: 40, height: 40, borderRadius: "50%", background: "#fff",
    border: `1px solid ${theme.gray[200]}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: theme.shadow.md, cursor: "pointer", textDecoration: "none",
    color: theme.gray[900], fontSize: 18, fontWeight: 700,
  } as React.CSSProperties,

  heroCard: {
    background: theme.primary.gradientDark,
    borderRadius: theme.radius["2xl"],
    padding: "30px 24px",
    color: "#fff", boxShadow: theme.primary.shadowLg,
    position: "relative", overflow: "hidden",
  } as React.CSSProperties,

  card: {
    background: "#fff",
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.gray[200]}`,
    boxShadow: theme.shadow.sm,
    overflow: "hidden",
  } as React.CSSProperties,

  btnPrimary: {
    width: "100%",
    background: theme.primary.gradient,
    color: "#fff",
    padding: "14px 18px",
    borderRadius: theme.radius.md,
    border: "none",
    fontSize: 15, fontWeight: 800,
    cursor: "pointer",
    boxShadow: theme.primary.shadow,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  } as React.CSSProperties,

  btnOutline: {
    width: "100%",
    background: "#fff",
    color: theme.primary[700],
    padding: "12px 18px",
    borderRadius: theme.radius.md,
    border: `2px solid ${theme.primary[100]}`,
    fontSize: 14, fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,

  logoPill: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", padding: "8px 16px 8px 8px",
    borderRadius: theme.radius.full,
    boxShadow: theme.shadow.md,
    border: `1px solid ${theme.gray[200]}`,
  } as React.CSSProperties,

  logoIcon: {
    width: 28, height: 28, borderRadius: "50%",
    background: theme.primary.gradient,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 6px rgba(16,185,129,0.4)", color: "#fff",
  } as React.CSSProperties,

  logoText: {
    fontWeight: 900, color: theme.primary[600],
    fontSize: 15, letterSpacing: 0.3,
  } as React.CSSProperties,

  fieldLabel: {
    display: "block", fontSize: 10, fontWeight: 800,
    color: theme.gray[500], textTransform: "uppercase",
    letterSpacing: 1.2, marginBottom: 8,
  } as React.CSSProperties,

  fieldInput: {
    width: "100%", padding: "14px 16px",
    background: theme.gray[50],
    border: `2px solid ${theme.gray[100]}`,
    borderRadius: theme.radius.md,
    fontSize: 14, fontWeight: 600,
    color: theme.gray[900], outline: "none",
    transition: "all 0.2s ease", boxSizing: "border-box",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 16, fontWeight: 800, color: theme.gray[900], margin: 0,
  } as React.CSSProperties,
};