"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Home,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

type SubAreaType = {
  id: number;
  name: string;
  active: boolean;
};

type AreaType = {
  id: number;
  name: string;
  active: boolean;
  order: number;
  subAreas: SubAreaType[];
};

type RawSubAreaType = Partial<SubAreaType>;

type RawAreaType = Partial<Omit<AreaType, "subAreas">> & {
  subAreas?: RawSubAreaType[];
};

type SignupMessageType = {
  text: string;
  type: "success" | "error";
};

const fieldWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "18px",
  border: "1px solid #f3f4f6",
};

const inputStyle = {
  border: "none",
  background: "transparent",
  outline: "none",
  width: "100%",
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "800",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginBottom: "8px",
};

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedSubAreaId, setSelectedSubAreaId] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [areaLoading, setAreaLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<SignupMessageType | null>(null);

  useEffect(() => {
    async function loadAreas() {
      try {
        const res = await fetch("/api/admin-data", { cache: "no-store" });
        const data = await res.json();
        const rawAreas = Array.isArray(data.areas) ? (data.areas as RawAreaType[]) : [];

        const cleanAreas: AreaType[] = rawAreas
          .map((area, index) => ({
            id: Number(area.id || index + 1),
            name: area.name || "",
            active: area.active ?? true,
            order: Number(area.order || index + 1),
            subAreas: Array.isArray(area.subAreas)
              ? area.subAreas.map((sub, subIndex) => ({
                  id: Number(sub.id || subIndex + 1),
                  name: sub.name || "",
                  active: sub.active ?? true,
                }))
              : [],
          }))
          .filter((area) => area.name.trim() && area.active)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        queueMicrotask(() => setAreas(cleanAreas));
      } catch {
        queueMicrotask(() => setAreas([]));
      } finally {
        queueMicrotask(() => setAreaLoading(false));
      }
    }

    loadAreas();
  }, []);

  const selectedArea = useMemo(
    () => areas.find((area) => String(area.id) === selectedAreaId),
    [areas, selectedAreaId]
  );

  const activeSubAreas = useMemo(
    () => (selectedArea?.subAreas || []).filter((sub) => sub.active),
    [selectedArea]
  );

  const selectedSubArea = useMemo(
    () => activeSubAreas.find((sub) => String(sub.id) === selectedSubAreaId),
    [activeSubAreas, selectedSubAreaId]
  );

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      setMessage({ text: "Please enter your full name.", type: "error" });
      return;
    }

    if (!selectedArea) {
      setMessage({ text: "Please select your area.", type: "error" });
      return;
    }

    if (!selectedSubArea) {
      setMessage({ text: "Please select your sub area.", type: "error" });
      return;
    }

    if (!fullAddress.trim()) {
      setMessage({ text: "Please enter your full address.", type: "error" });
      return;
    }

    if (mobile.length !== 10) {
      setMessage({ text: "Please enter a valid 10 digit mobile number.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const trimmedName = fullName.trim();
      const trimmedAddress = fullAddress.trim();
      const trimmedLandmark = landmark.trim();
      const customerFullAddress = `${selectedArea.name}, ${selectedSubArea.name}, ${trimmedAddress}${
        trimmedLandmark ? `, Landmark: ${trimmedLandmark}` : ""
      }`;

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          mobile_number: mobile,
          password,
          area: selectedArea.name,
          area_id: selectedArea.id,
          sub_area: selectedSubArea.name,
          sub_area_id: selectedSubArea.id,
          address: trimmedAddress,
          landmark: trimmedLandmark,
          full_address: customerFullAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Signup failed. Please try again.", type: "error" });
        return;
      }

      localStorage.setItem(
        "nivito_customer",
        JSON.stringify({
          name: trimmedName,
          full_name: trimmedName,
          mobile,
          mobile_number: mobile,
          phone: mobile,
          address: trimmedAddress,
          full_address: customerFullAddress,
          area: selectedArea.name,
          sub_area: selectedSubArea.name,
          landmark: trimmedLandmark,
        })
      );

      setMessage({ text: "Account created successfully.", type: "success" });
      setFullName("");
      setMobile("");
      setPassword("");
      setSelectedAreaId("");
      setSelectedSubAreaId("");
      setFullAddress("");
      setLandmark("");
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ backgroundColor: "#f2f5f0", minHeight: "100vh", padding: "20px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/" style={{ backgroundColor: "white", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <ArrowLeft size={22} color="#111827" />
          </Link>
          <div style={{ backgroundColor: "white", padding: "10px 20px", borderRadius: "25px", fontWeight: "900", color: "#059669", fontSize: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            Nivito
          </div>
        </div>

        <section style={{
          background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
          borderRadius: "35px", padding: "30px 24px 60px", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(5, 150, 105, 0.25)"
        }}>
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "18px", backdropFilter: "blur(8px)" }}>
              <Sparkles size={14} /> Fresh groceries & home services
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 12px" }}>
              Create your <br /> Nivito account
            </h1>
            <p style={{ fontSize: "14.5px", opacity: 0.9, fontWeight: "500", lineHeight: "1.5", margin: 0, maxWidth: "280px" }}>
              Select your delivery area first, then create your account.
            </p>
          </div>
        </section>

        <section style={{
          backgroundColor: "white", borderRadius: "32px", padding: "28px 24px", marginTop: "-40px", position: "relative", zIndex: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
        }}>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={fieldWrapStyle}>
                <User size={20} color="#9ca3af" />
                <input suppressHydrationWarning type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Area</label>
              <div style={fieldWrapStyle}>
                <MapPin size={20} color="#059669" />
                <select
                  suppressHydrationWarning
                  value={selectedAreaId}
                  onChange={(e) => {
                    setSelectedAreaId(e.target.value);
                    setSelectedSubAreaId("");
                  }}
                  required
                  style={{ ...inputStyle, fontWeight: "700", color: selectedAreaId ? "#111827" : "#9ca3af" }}
                >
                  <option value="">{areaLoading ? "Areas loading..." : "Select your area"}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Sub Area</label>
              <div style={fieldWrapStyle}>
                <Home size={20} color="#059669" />
                <select
                  suppressHydrationWarning
                  value={selectedSubAreaId}
                  onChange={(e) => setSelectedSubAreaId(e.target.value)}
                  required
                  disabled={!selectedAreaId}
                  style={{ ...inputStyle, fontWeight: "700", color: selectedSubAreaId ? "#111827" : "#9ca3af" }}
                >
                  <option value="">{selectedAreaId ? "Select sub area" : "First select area"}</option>
                  {activeSubAreas.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full Address</label>
              <textarea
                suppressHydrationWarning
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="House no, street, block, building..."
                required
                rows={3}
                style={{ width: "100%", resize: "none", boxSizing: "border-box", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6", outline: "none", fontSize: "15px", fontWeight: "600", color: "#111827" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Landmark</label>
              <input suppressHydrationWarning type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near temple, school, market..." style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6", outline: "none", fontSize: "15px", fontWeight: "600", color: "#111827" }} />
            </div>

            <div>
              <label style={labelStyle}>Mobile Number</label>
              <div style={fieldWrapStyle}>
                <Phone size={20} color="#9ca3af" />
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#4b5563" }}>+91</span>
                <input suppressHydrationWarning type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={fieldWrapStyle}>
                <Lock size={20} color="#9ca3af" />
                <input suppressHydrationWarning type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" required style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </button>
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: "#059669", color: "white", padding: "18px", borderRadius: "20px", border: "none", fontSize: "17px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Creating..." : "Create Account"} {!loading && <ArrowRight size={20} />}
            </button>

            {message && (
              <p style={{ textAlign: "center", fontSize: "14px", fontWeight: "700", color: message.type === "success" ? "#059669" : "#dc2626", marginTop: "5px" }}>{message.text}</p>
            )}
          </form>

          <div style={{ marginTop: "28px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#6b7280", margin: 0 }}>Already have an account?</p>
            <Link href="/login" style={{ display: "inline-block", marginTop: "10px", fontSize: "18px", fontWeight: "900", color: "#059669", textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </section>

        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "15px", fontSize: "13px", fontWeight: "700", color: "#9ca3af" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><ShieldCheck size={16} /> Secure</span>
          <span>|</span>
          <span>Fast Delivery</span>
          <span>|</span>
          <span>Premium</span>
        </div>
      </div>
    </main>
  );
}
