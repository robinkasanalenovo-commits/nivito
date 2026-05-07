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
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAreas() {
      try {
        const res = await fetch("/api/admin-data", { cache: "no-store" });
        const data = await res.json();

        const cleanAreas: AreaType[] = (data.areas || [])
          .map((area: any, index: number) => ({
            id: Number(area.id || index + 1),
            name: area.name || "",
            active: area.active ?? true,
            order: Number(area.order || index + 1),
            subAreas: Array.isArray(area.subAreas)
              ? area.subAreas.map((sub: any, subIndex: number) => ({
                  id: Number(sub.id || subIndex + 1),
                  name: sub.name || "",
                  active: sub.active ?? true,
                }))
              : [],
          }))
          .filter((area: AreaType) => area.name.trim() && area.active)
          .sort((a: AreaType, b: AreaType) => (a.order || 0) - (b.order || 0));

        setAreas(cleanAreas);
      } catch (err) {
        setAreas([]);
      } finally {
        setAreaLoading(false);
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

    if (!selectedArea) {
      setMessage("Area select करो ❌");
      return;
    }

    if (!selectedSubArea) {
      setMessage("Sub Area select करो ❌");
      return;
    }

    if (!fullAddress.trim()) {
      setMessage("Full address डालो ❌");
      return;
    }

    if (mobile.length !== 10) {
      setMessage("Mobile number 10 digits ka hona chahiye ❌");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          mobile_number: mobile,
          password: password,
          area: selectedArea.name,
          area_id: selectedArea.id,
          sub_area: selectedSubArea.name,
          sub_area_id: selectedSubArea.id,
          address: fullAddress,
          landmark: landmark,
          full_address: `${selectedArea.name}, ${selectedSubArea.name}, ${fullAddress}${
            landmark.trim() ? `, Landmark: ${landmark}` : ""
          }`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(
  "nivito_customer",
  JSON.stringify({
    name: fullName,
    full_name: fullName,
    mobile: mobile,
    mobile_number: mobile,
    phone: mobile,
    address: fullAddress,
    full_address: `${selectedArea.name}, ${selectedSubArea.name}, ${fullAddress}${
      landmark.trim() ? `, Landmark: ${landmark}` : ""
    }`,
    area: selectedArea.name,
    sub_area: selectedSubArea.name,
    landmark: landmark,
  })
);
        setMessage("Account created successfully ✅");
        setFullName("");
        setMobile("");
        setPassword("");
        setSelectedAreaId("");
        setSelectedSubAreaId("");
        setFullAddress("");
        setLandmark("");
      } else {
        setMessage(data.message || "Signup failed ❌");
      }
    } catch (err) {
      setMessage("Something went wrong ❌");
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
          borderRadius: "35px", padding: "30px 24px 60px 24px", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(5, 150, 105, 0.25)"
        }}>
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "18px", backdropFilter: "blur(8px)" }}>
              <Sparkles size={14} /> Fresh groceries & home services
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 12px 0" }}>
              Create your <br /> Nivito account
            </h1>
            <p style={{ fontSize: "14.5px", opacity: 0.9, fontWeight: "500", lineHeight: "1.5", margin: 0, maxWidth: "280px" }}>
              पहले delivery area select करें, फिर account create करें।
            </p>
          </div>
        </section>

        <section style={{
          backgroundColor: "white", borderRadius: "32px", padding: "28px 24px", marginTop: "-40px", position: "relative", zIndex: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
        }}>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Full Name</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6" }}>
                <User size={20} color="#9ca3af" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "600", color: "#111827" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Area</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6" }}>
                <MapPin size={20} color="#059669" />
                <select
                  value={selectedAreaId}
                  onChange={(e) => {
                    setSelectedAreaId(e.target.value);
                    setSelectedSubAreaId("");
                  }}
                  required
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "700", color: selectedAreaId ? "#111827" : "#9ca3af" }}
                >
                  <option value="">{areaLoading ? "Areas loading..." : "Select your area"}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Sub Area</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6" }}>
                <Home size={20} color="#059669" />
                <select
                  value={selectedSubAreaId}
                  onChange={(e) => setSelectedSubAreaId(e.target.value)}
                  required
                  disabled={!selectedAreaId}
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "700", color: selectedSubAreaId ? "#111827" : "#9ca3af" }}
                >
                  <option value="">{selectedAreaId ? "Select sub area" : "First select area"}</option>
                  {activeSubAreas.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Full Address</label>
              <textarea
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="House no, gali, block, building..."
                required
                rows={3}
                style={{ width: "100%", resize: "none", boxSizing: "border-box", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6", outline: "none", fontSize: "15px", fontWeight: "600", color: "#111827" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near temple, school, market..."
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6", outline: "none", fontSize: "15px", fontWeight: "600", color: "#111827" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Mobile Number</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6" }}>
                <Phone size={20} color="#9ca3af" />
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#4b5563" }}>+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  required
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "600", color: "#111827" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Password</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "18px", border: "1px solid #f3f4f6" }}>
                <Lock size={20} color="#9ca3af" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "15px", fontWeight: "600", color: "#111827" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: "#059669", color: "white", padding: "18px", borderRadius: "20px", border: "none", fontSize: "17px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
              }}>
              {loading ? "Creating..." : "Create Account"} {!loading && <ArrowRight size={20} />}
            </button>

            {message && (
              <p style={{ textAlign: "center", fontSize: "14px", fontWeight: "700", color: message.includes("✅") ? "#059669" : "#dc2626", marginTop: "5px" }}>{message}</p>
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
          <span>•</span>
          <span>Fast Delivery</span>
          <span>•</span>
          <span>Premium</span>
        </div>
      </div>
    </main>
  );
}
