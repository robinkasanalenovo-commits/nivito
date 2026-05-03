"use client";

import Link from "next/link";
import { CSSProperties } from "react";

export default function PrivacyPage() {
  return (
    <main style={styles.main}>
      <div style={styles.phone}>
        <div style={styles.headerTop}>
          <Link href="/profile" style={styles.backBtn}>‹</Link>
          <h1 style={styles.title}>Privacy Policy</h1>
          <div style={{ width: 36 }} />
        </div>

        <section style={styles.card}>
          <div style={styles.iconRow}>
            <div style={styles.shieldBox}>🛡️</div>
            <div>
              <p style={styles.cardTitle}>Nivito Privacy Policy</p>
              <p style={styles.cardSub}>Last updated: May 2026</p>
            </div>
          </div>

          <Section title="1. Information We Collect">
            Hum aapka naam, mobile number, delivery address aur order history collect karte hain — taaki aapka order time pe deliver ho sake.
          </Section>
          <Section title="2. How We Use Your Data">
            Aapka data sirf order processing, delivery, customer support aur offers bhejne ke liye use hota hai. Hum kabhi kisi third party ko aapka data sell nahi karte.
          </Section>
          <Section title="3. Data Security">
            Aapka data secure servers pe encrypted form mein store hota hai. Industry-standard security measures use karte hain.
          </Section>
          <Section title="4. Your Rights">
            Aap kabhi bhi apna account delete kar sakte hain ya apna data download/update karne ke liye support se contact kar sakte hain.
          </Section>
          <Section title="5. Contact Us">
            Privacy se related koi sawaal? Call: <strong>9873513566</strong><br />
            Email: <strong>nivito.in@gmail.com</strong>
          </Section>
        </section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
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
  card: {
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18,
  },
  iconRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 6 },
  shieldBox: {
    width: 44, height: 44, borderRadius: 12, background: "#cffafe",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
  },
  cardTitle: { fontSize: 15, fontWeight: 800, color: "#111", margin: 0 },
  cardSub: { fontSize: 11, color: "#6b7280", margin: "2px 0 0" },
};