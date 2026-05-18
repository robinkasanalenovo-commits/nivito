"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Phone, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { theme, ui } from "@/lib/theme";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (mobile.length !== 10) return setMessage("Mobile 10 digits ka hona chahiye");
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobile, password }),
      });
      const data = await res.json();
      if (res.ok) {
       localStorage.setItem("nivito_user", JSON.stringify(data.customer));

localStorage.setItem(
  "nivito_customer",
  JSON.stringify({
    name: data.customer.full_name || data.customer.name || "",
    full_name: data.customer.full_name || data.customer.name || "",
    mobile: data.customer.mobile_number || data.customer.mobile || "",
    mobile_number: data.customer.mobile_number || data.customer.mobile || "",
    phone: data.customer.mobile_number || data.customer.mobile || "",
    full_address:
      data.customer.full_address ||
      [
        data.customer.area,
        data.customer.sub_area,
        data.customer.address,
        data.customer.landmark,
      ]
        .filter((v) => v && String(v).trim())
        .join(", "),
    address: data.customer.address || "",
    area: data.customer.area || "",
    sub_area: data.customer.sub_area || "",
    landmark: data.customer.landmark || "",
  })
);
        setMessage("Login successful");
        setTimeout(() => { window.location.href = "/profile"; }, 700);
      } else setMessage(data.message || "Login failed");
    } catch { setMessage("Something went wrong"); }
    finally { setLoading(false); }
  }

  const isSuccess = message.includes("successful");
  const isValid = mobile.length === 10 && password.length > 0;

  return (
    <main style={ui.page}>  {/* 👈 Same amber background as Profile! */}
      <div style={ui.phone}>
        {/* Top Bar */}
        <div style={ui.topBar}>
          <Link href="/" style={ui.iconBtn}>
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <div style={ui.logoPill}>
            <div style={ui.logoIcon}>
              <Sparkles size={14} strokeWidth={3} />
            </div>
            <span style={ui.logoText}>Nivito</span>
          </div>
        </div>

        {/* Hero Card — same green gradient as Profile user card */}
        <section style={ui.heroCard}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(20px)" }} />

          <div style={{
            position: "absolute", top: 24, right: 24, width: 50, height: 50, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)",
          }}>
            <ShieldCheck size={24} color="#fff" strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.05, margin: 0, letterSpacing: -1 }}>
            Welcome <br />
            <span style={{
              background: theme.accent.gradient,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              back 👋
            </span>
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, fontWeight: 500, marginTop: 12 }}>
            Apne Nivito account me login karein
          </p>
        </section>

        {/* Form Card — same white card style as Profile menu */}
        <section style={{ ...ui.card, padding: "24px 22px" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Mobile */}
            <div>
              <label style={ui.fieldLabel}>Mobile Number</label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                background: focused === "mobile" ? "#fff" : theme.gray[50],
                border: `2px solid ${focused === "mobile" ? theme.primary[500] : theme.gray[100]}`,
                borderRadius: theme.radius.md,
                boxShadow: focused === "mobile" ? theme.shadow.glow : "none",
                transition: "all 0.2s ease",
              }}>
                <Phone size={18} color={focused === "mobile" ? theme.primary[500] : theme.gray[400]} strokeWidth={2.5} />
                <span style={{ fontSize: 14, fontWeight: 800, color: theme.gray[700] }}>+91</span>
                <div style={{ width: 1, height: 18, background: theme.gray[200] }} />
                <input
                  type="tel" value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onFocus={() => setFocused("mobile")} onBlur={() => setFocused(null)}
                  placeholder="9876543210" required
                  style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14, fontWeight: 600, color: theme.gray[900] }}
                />
                {mobile.length === 10 && <CheckCircle2 size={18} color={theme.primary[500]} fill={theme.primary[100]} strokeWidth={2.5} />}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={ui.fieldLabel}>Password</label>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                background: focused === "pass" ? "#fff" : theme.gray[50],
                border: `2px solid ${focused === "pass" ? theme.primary[500] : theme.gray[100]}`,
                borderRadius: theme.radius.md,
                boxShadow: focused === "pass" ? theme.shadow.glow : "none",
                transition: "all 0.2s ease",
              }}>
                <Lock size={18} color={focused === "pass" ? theme.primary[500] : theme.gray[400]} strokeWidth={2.5} />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                  placeholder="Enter password" required
                  style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14, fontWeight: 600, color: theme.gray[900] }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  {showPassword ? <EyeOff size={18} color={theme.gray[500]} /> : <Eye size={18} color={theme.gray[500]} />}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <Link href="/forgot-password" style={{ fontSize: 12, color: theme.primary[600], fontWeight: 700, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading || !isValid}
              style={{
                ...ui.btnPrimary,
                background: !isValid || loading ? theme.gray[300] : theme.primary.gradient,
                boxShadow: !isValid || loading ? "none" : theme.primary.shadow,
                cursor: !isValid || loading ? "not-allowed" : "pointer",
                padding: "16px",
              }}
            >
              {loading ? "Logging in..." : <>Login Securely <span>→</span></>}
            </button>

            {/* Message */}
            {message && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                borderRadius: theme.radius.sm, fontSize: 13, fontWeight: 700,
                background: isSuccess ? theme.primary[50] : theme.danger[50],
                border: `1px solid ${isSuccess ? theme.primary[100] : theme.danger[200]}`,
                color: isSuccess ? theme.primary[700] : theme.danger[700],
              }}>
                {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{message}</span>
              </div>
            )}
          </form>

          {/* OR Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 14px" }}>
            <div style={{ flex: 1, height: 1, background: theme.gray[200] }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: theme.gray[400], letterSpacing: 2 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: theme.gray[200] }} />
          </div>

          {/* Signup CTA — pink card style like Refer & Earn */}
          <Link href="/signup" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: theme.pink.gradient,
            border: `2px dashed ${theme.pink[200]}`,
            borderRadius: theme.radius.md, padding: 14, textDecoration: "none",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.gray[700] }}>New to Nivito?</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: theme.pink[600] }}>Create Account →</span>
          </Link>
        </section>

        {/* Trust footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: theme.gray[700] }}>
            <ShieldCheck size={14} color={theme.primary[600]} strokeWidth={2.5} />
            <span>256-bit Encrypted</span>
          </div>
          <div style={{ width: 4, height: 4, background: theme.gray[300], borderRadius: "50%" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: theme.gray[700] }}>
            <Sparkles size={14} color={theme.accent[500]} fill={theme.accent[500]} />
            <span>Trusted by 10K+</span>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: theme.gray[500], marginTop: 4, fontWeight: 500 }}>
          Need help? Call <a href="tel:9873513566" style={{ color: theme.primary[600], fontWeight: 800, textDecoration: "none" }}>9873513566</a>
        </p>
      </div>
    </main>
  );
}
