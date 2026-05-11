"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Phone, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { theme, ui } from "@/lib/theme";

const SERVICES = [
  { name: "AC Service", desc: "Repair & Install", emoji: "❄️", bg: "#cffafe", text: "#155e75" },
  { name: "RO Water", desc: "Filter & Purifier", emoji: "💧", bg: "#dbeafe", text: "#1e3a8a" },
  { name: "Mobile Repair", desc: "Screen & Battery", emoji: "📱", bg: "#ede9fe", text: "#4c1d95" },
  { name: "Home Cleaning", desc: "Deep clean expert", emoji: "🧹", bg: "#fef3c7", text: "#78350f" },
];

type ServiceOptionConfig = {
  serviceName: string;
  options: string[];
};

const DEFAULT_SERVICE_OPTIONS: ServiceOptionConfig[] = [
  { serviceName: "AC Service", options: ["AC Service", "Gas Filling", "Cooling Problem", "Installation"] },
  { serviceName: "RO Water", options: ["RO Service", "Water Filter Change", "Low Water Flow", "Installation"] },
  { serviceName: "Mobile Repair", options: ["Screen Replacement", "Battery Change", "Charging Problem", "Speaker Problem"] },
  { serviceName: "Home Cleaning", options: ["Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa Cleaning"] },
];

const NOTE_PLACEHOLDERS: Record<string, string> = {
  "AC Service": "Add AC details, e.g. cooling problem, gas filling, or service timing",
  "RO Water": "Add RO details, e.g. filter change, low water flow, or service timing",
  "Mobile Repair": "Add mobile issue, e.g. screen replacement, battery change, or model name",
  "Home Cleaning": "Add cleaning details, e.g. rooms, kitchen, bathroom, or preferred time",
};

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState(SERVICES[0].name);
  const [serviceOptions, setServiceOptions] = useState<ServiceOptionConfig[]>(DEFAULT_SERVICE_OPTIONS);
  const [selectedProblem, setSelectedProblem] = useState(DEFAULT_SERVICE_OPTIONS[0].options[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const currentProblemOptions =
    serviceOptions.find((service) => service.serviceName === selectedService)?.options || [];

  useEffect(() => {
    const serviceFromUrl = searchParams.get("service");
    const matchedService = SERVICES.find(
      (service) => service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === serviceFromUrl
    );

    if (matchedService) setSelectedService(matchedService.name);
  }, [searchParams]);

  useEffect(() => {
    const loadServiceOptions = async () => {
      try {
        const res = await fetch("/api/admin-data", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data.serviceOptions) && data.serviceOptions.length > 0) {
          setServiceOptions(data.serviceOptions);
        }
      } catch {}
    };

    loadServiceOptions();
  }, []);

  useEffect(() => {
    const options = serviceOptions.find((service) => service.serviceName === selectedService)?.options || [];
    if (options.length > 0 && !options.includes(selectedProblem)) {
      setSelectedProblem(options[0]);
    } else if (options.length === 0 && selectedProblem) {
      setSelectedProblem("");
    }
  }, [selectedProblem, selectedService, serviceOptions]);

  useEffect(() => {
    const savedCustomer =
      localStorage.getItem("nivito_customer") ||
      localStorage.getItem("customer") ||
      localStorage.getItem("user") ||
      localStorage.getItem("nivito_user");

    if (!savedCustomer) return;

    try {
      const user = JSON.parse(savedCustomer);
      setCustomerName(user.name || user.full_name || user.fullName || "");
      setCustomerMobile(user.mobile || user.mobile_number || user.mobileNumber || user.phone || "");
      setAddress(
        user.full_address ||
          user.fullAddress ||
          user.customerAddress ||
          user.deliveryAddress ||
          [user.address, user.area, user.sub_area || user.subArea, user.landmark]
            .filter((v) => v && String(v).trim())
            .join(", ") ||
          ""
      );
    } catch {}
  }, []);

  const submitRequest = async () => {
    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!customerMobile.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!selectedProblem.trim()) {
      setError("Please select a problem type.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin-data", { cache: "no-store" });
      const data = await res.json();

      const serviceRequest = {
        id: Date.now(),
        requestId: `SRV-${Date.now()}`,
        serviceName: selectedService,
        problemType: selectedProblem,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        address: address.trim(),
        notes: notes.trim(),
        status: "New",
        createdAt: new Date().toISOString(),
      };

      const saveRes = await fetch("/api/admin-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          serviceRequests: [serviceRequest, ...(data.serviceRequests || [])],
        }),
      });

      if (!saveRes.ok) throw new Error("Request failed");

      setSuccess("Call request sent successfully. Our team will call you soon.");
      setNotes("");
    } catch {
      setError("Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={ui.page}>
      <div style={{ ...ui.phone, gap: 14, paddingBottom: 24 }}>
        <div style={ui.topBar}>
          <Link href="/category/all" style={ui.iconBtn}><ArrowLeft size={20} /></Link>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: theme.gray[900] }}>Home Services</div>
            <div style={{ fontSize: 11, color: theme.primary[600], fontWeight: 700 }}>Request a call</div>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={{
          background: theme.primary.gradientDark,
          borderRadius: 22,
          padding: 18,
          color: "#fff",
          boxShadow: theme.primary.shadowLg,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, opacity: 0.9 }}>
            <Sparkles size={13} /> SERVICES
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 4px" }}>Book help for your home</h1>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, opacity: 0.9 }}>
            Select a service, choose the problem, and our team will call you soon.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {SERVICES.map((service) => {
            const active = selectedService === service.name;
            return (
              <button
                key={service.name}
                suppressHydrationWarning
                onClick={() => setSelectedService(service.name)}
                style={{
                  minHeight: 104,
                  borderRadius: 16,
                  padding: 12,
                  background: service.bg,
                  color: service.text,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textAlign: "left",
                  border: active ? `2px solid ${theme.primary[600]}` : "1px solid rgba(255,255,255,0.8)",
                  boxShadow: active ? theme.primary.shadow : theme.shadow.sm,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}>{service.emoji}</span>
                  {active && <CheckCircle2 size={18} color={theme.primary[700]} />}
                </div>
                <span>
                  <strong style={{ display: "block", fontSize: 13 }}>{service.name}</strong>
                  <small style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.78 }}>{service.desc}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ ...ui.card, padding: 16 }}>
          <h2 style={{ ...ui.sectionTitle, marginBottom: 12 }}>Call Request</h2>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: theme.gray[700], marginBottom: 8 }}>
                Select problem
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {currentProblemOptions.map((option) => {
                  const active = selectedProblem === option;
                  return (
                    <button
                      key={option}
                      suppressHydrationWarning
                      onClick={() => setSelectedProblem(option)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 999,
                        border: active ? `2px solid ${theme.primary[600]}` : `1px solid ${theme.gray[200]}`,
                        background: active ? theme.primary[50] : "#fff",
                        color: active ? theme.primary[700] : theme.gray[700],
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              suppressHydrationWarning
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Name"
              style={ui.fieldInput}
            />
            <input
              suppressHydrationWarning
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="Mobile number"
              inputMode="tel"
              style={ui.fieldInput}
            />
            <textarea
              suppressHydrationWarning
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address / area"
              rows={2}
              style={{ ...(ui.fieldInput as React.CSSProperties), resize: "none" }}
            />
            <textarea
              suppressHydrationWarning
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={NOTE_PLACEHOLDERS[selectedService] || "Add details about the problem"}
              rows={2}
              style={{ ...(ui.fieldInput as React.CSSProperties), resize: "none" }}
            />
          </div>

          {error && <p style={{ margin: "10px 0 0", color: theme.danger[600], fontSize: 12, fontWeight: 800 }}>{error}</p>}
          {success && <p style={{ margin: "10px 0 0", color: theme.primary[700], fontSize: 12, fontWeight: 800 }}>{success}</p>}

          <button
            suppressHydrationWarning
            onClick={submitRequest}
            disabled={submitting}
            style={{
              ...ui.btnPrimary,
              marginTop: 14,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={16} /> {submitting ? "Sending..." : "Request Call"}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesPageContent />
    </Suspense>
  );
}
