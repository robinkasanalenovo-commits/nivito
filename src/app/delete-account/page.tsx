"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, CSSProperties } from "react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm');
      return;
    }
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("nivito_user") || "null");
      if (user?.id) await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      localStorage.removeItem("nivito_user");
      localStorage.removeItem("nivito_addresses");
      localStorage.removeItem("nivito_referral");
      alert("Account delete ho gaya. Bye 👋");
      router.push("/");
    } catch {
      alert("Kuch problem hui. Phir try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.phone}>
        <div style={styles.headerTop}>
          <Link href="/profile" style={styles.backBtn}>‹</Link>
          <h1 style={styles.title}>Delete Account</h1>
          <div style={{ width: 36 }} />
        </div>

        <section style={styles.warnCard}>
          <div style={{ fontSize: 28 }}>⚠️</div>
          <div>
            <p style={{ fontWeight: 800, color: "#7f1d1d", margin: 0, fontSize: 14 }}>Dhyaan dijiye!</p>
            <p style={{ fontSize: 12, color: "#991b1b", margin: "4px 0 0" }}>
              Account delete karne se aapka saara data — orders, addresses, referral, wallet — permanent delete ho jayega.
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>Kya delete hoga?</p>
          <ul style={{ fontSize: 12, color: "#4b5563", paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
            <li>Aapka profile aur login</li>
            <li>Saved addresses</li>
            <li>Order history</li>
            <li>Referral code aur wallet balance</li>
            <li>Notification preferences</li>
          </ul>

          <div style={{ marginTop: 16 }}>
            <label style={styles.fieldLabel}>
              Confirm karne ke liye <span style={{ color: "#dc2626", fontFamily: "monospace" }}>DELETE</span> type karein:
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={styles.input}
            />
          </div>

          <button
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || loading}
            style={{
              ...styles.deleteBtn,
              background: confirmText !== "DELETE" || loading ? "#d1d5db" : "#dc2626",
              cursor: confirmText !== "DELETE" || loading ? "not-allowed" : "pointer",
            }}
          >
            🗑 {loading ? "Deleting..." : "Permanently Delete Account"}
          </button>

          <Link href="/profile" style={styles.cancelLink}>Cancel — Take me back</Link>
        </section>

        <p style={{ textAlign: "center", fontSize: 12, color: "#6b7280" }}>
          Help chahiye? Call <strong>9873513566</strong>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fef3c7 0%, #fed7aa 50%, #fef3c7 100%)",
    padding: "16px 0", fontFamily: "system-ui, -apple-system, sans-serif",
  },
  phone: { maxWidth: 420, margin: "0 auto", padding: "0 12px", display: "grid", gap: 14 },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  backBtn: {
    width: 36, height: 36, borderRadius: "50%", background: "#fff",
    border: "1px solid #e5e7eb", display: "flex", alignItems: "center",
    justifyContent: "center", textDecoration: "none", color: "#111", fontSize: 20, fontWeight: 700,
  },
  title: { fontSize: 18, fontWeight: 800, margin: 0, color: "#111" },
  warnCard: {
    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14,
    padding: 14, display: "flex", gap: 12, alignItems: "flex-start",
  },
  card: {
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 16,
  },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 },
  input: {
    width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
    border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  deleteBtn: {
    width: "100%", padding: "11px", color: "#fff", border: "none",
    borderRadius: 8, fontWeight: 700, fontSize: 14, marginTop: 14,
  },
  cancelLink: {
    display: "block", textAlign: "center", color: "#059669",
    fontWeight: 700, padding: "10px 0", textDecoration: "none", fontSize: 13, marginTop: 4,
  },
};
