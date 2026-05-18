"use client";

import { useCart } from "@/context/CartContext";
import {
  Trash2, Truck, ArrowLeft, MapPin, Tag, Clock,
  Plus, Minus, Heart, Sparkles, ChevronRight,
  ShoppingBag, Gift, X, CheckCircle2, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { theme, ui } from "@/lib/theme";

const TIPS = [10, 20, 30, 50];

type CouponConfig = {
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  label: string;
  active?: boolean;
};

type AdminCoupon = Partial<CouponConfig> & {
  code?: string;
};

type AppliedCoupon = { code: string; discount: number; message: string };

type DeliverySubArea = {
  id: number;
  name: string;
  active?: boolean;
  minOrder?: number;
};

type DeliveryArea = {
  id: number;
  name: string;
  active?: boolean;
  minOrder?: number;
  subAreas?: DeliverySubArea[];
};

type StoredCustomer = {
  name?: string;
  full_name?: string;
  fullName?: string;
  customerName?: string;
  mobile?: string;
  mobileNumber?: string;
  mobile_number?: string;
  phone?: string;
  customerMobile?: string;
  full_address?: string;
  fullAddress?: string;
  customerAddress?: string;
  deliveryAddress?: string;
  address?: string;
  area?: string;
  sub_area?: string;
  subArea?: string;
  landmark?: string;
  customerArea?: string;
  customerSubArea?: string;
};

function readStoredCustomer() {
  const saved =
    localStorage.getItem("nivito_customer") ||
    localStorage.getItem("nivito_user") ||
    localStorage.getItem("customer") ||
    localStorage.getItem("user");

  if (!saved) return null;

  try {
    return JSON.parse(saved) as StoredCustomer;
  } catch {
    return null;
  }
}

function getCustomerAddress(user: StoredCustomer | null) {
  if (!user) return "";
  return (
    user.full_address ||
    user.fullAddress ||
    user.customerAddress ||
    user.deliveryAddress ||
    user.address ||
    [user.area, user.sub_area || user.subArea, user.landmark]
      .filter((v) => v && String(v).trim())
      .join(", ") ||
    ""
  );
}

function getItemMrp(item: { price: number; mrp?: number }) {
  return Math.max(Number(item.mrp || 0), item.price);
}

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart, clearCart } = useCart();

  const [placing, setPlacing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [tip, setTip] = useState(0);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [customerName, setCustomerName] = useState("Customer");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerArea, setCustomerArea] = useState("");
  const [customerSubArea, setCustomerSubArea] = useState("");
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  useEffect(() => {
    const user = readStoredCustomer();
    if (!user) return;

    setCustomerName(user.name || user.full_name || user.fullName || user.customerName || "Customer");
    setCustomerMobile(user.mobile || user.mobileNumber || user.mobile_number || user.phone || user.customerMobile || "");
    setCustomerAddress(getCustomerAddress(user));
    setCustomerArea(user.area || user.customerArea || "");
    setCustomerSubArea(user.sub_area || user.subArea || user.customerSubArea || "");
  }, []);

  useEffect(() => {
    const loadDeliveryAreas = async () => {
      try {
        const res = await fetch("/api/admin-data", { cache: "no-store" });
        const data = await res.json();
        setDeliveryAreas(Array.isArray(data.areas) ? data.areas : []);
      } catch {
        setDeliveryAreas([]);
      } finally {
        setLoadingAreas(false);
      }
    };

    loadDeliveryAreas();
  }, []);

  const itemTotal = useMemo(
    () => cart.reduce((t, i) => t + i.price * i.quantity, 0),
    [cart]
  );

  const mrpTotal = useMemo(
    () => cart.reduce((t, i) => t + getItemMrp(i) * i.quantity, 0),
    [cart]
  );

  const productSavings = mrpTotal - itemTotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const normalizeName = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
  const deliveryMinimum = useMemo(() => {
    const areaName = normalizeName(customerArea);
    const subAreaName = normalizeName(customerSubArea);
    const addressText = normalizeName(customerAddress);

    const matchedArea = deliveryAreas.find((area) => {
      const name = normalizeName(area.name || "");
      return name && (name === areaName || addressText.includes(name));
    });

    if (!matchedArea) return 0;

    const matchedSubArea = (matchedArea.subAreas || []).find((sub) => {
      const name = normalizeName(sub.name || "");
      return name && (name === subAreaName || addressText.includes(name));
    });

    return Number(matchedSubArea?.minOrder || matchedArea.minOrder || 0);
  }, [customerAddress, customerArea, customerSubArea, deliveryAreas]);
  const freeDeliveryThreshold = deliveryMinimum > 0 ? deliveryMinimum : 199;
  const minimumRemaining = Math.max(0, deliveryMinimum - itemTotal);
  const deliveryFee = itemTotal >= freeDeliveryThreshold ? 0 : 25;
  const handlingFee = itemTotal > 0 ? 4 : 0;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - itemTotal);
  const freeDeliveryProgress = Math.min(100, (itemTotal / freeDeliveryThreshold) * 100);
  const grandTotal = Math.max(0, itemTotal - couponDiscount + deliveryFee + handlingFee + tip);

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponError("Coupon code daalo");
      return;
    }

    setCheckingCoupon(true);
    setCouponError("");

    const applyCouponConfig = (couponCode: string, c: CouponConfig) => {
      if (c.active === false) {
        setCouponError("Yeh coupon active nahi hai");
        return;
      }

      if (itemTotal < c.minOrder) {
        setCouponError(`Min order Rs ${c.minOrder} hona chahiye`);
        return;
      }

      let discount =
        c.type === "flat" ? c.value : Math.round((itemTotal * c.value) / 100);

      if (c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount;

      setAppliedCoupon({
        code: couponCode,
        discount,
        message: `${c.label} applied! Rs ${discount} bach gaye`,
      });

      setCoupon("");
    };

    try {
      const res = await fetch("/api/admin-data", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const adminCoupons: AdminCoupon[] = Array.isArray(data.coupons) ? data.coupons : [];
        const matchedCoupon = adminCoupons.find(
          (item) => String(item.code || "").toUpperCase() === code
        );

        if (matchedCoupon) {
          applyCouponConfig(code, {
            type: matchedCoupon.type === "percent" ? "percent" : "flat",
            value: Number(matchedCoupon.value || 0),
            minOrder: Number(matchedCoupon.minOrder || 0),
            maxDiscount: Number(matchedCoupon.maxDiscount || 0) || undefined,
            label: matchedCoupon.label || code,
            active: matchedCoupon.active ?? true,
          });
          setCheckingCoupon(false);
          return;
        }

        setCouponError("Yeh coupon valid nahi hai");
        setCheckingCoupon(false);
        return;
      }
    } catch {
      setCouponError("Yeh coupon valid nahi hai");
      setCheckingCoupon(false);
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

  const savedCustomer = readStoredCustomer();

let finalCustomerName = customerName;
let finalCustomerMobile = customerMobile;
let finalCustomerAddress = customerAddress;

if (savedCustomer) {
    finalCustomerName =
      savedCustomer.name || savedCustomer.full_name || savedCustomer.fullName || "Customer";

    finalCustomerMobile =
      savedCustomer.mobile || savedCustomer.mobile_number || savedCustomer.mobileNumber || savedCustomer.phone || "";

    finalCustomerAddress = getCustomerAddress(savedCustomer);
}

if (!finalCustomerMobile) {
  alert("Mobile number missing");
  return;
}

if (!finalCustomerAddress || !finalCustomerAddress.trim() || finalCustomerAddress === "Address not provided") {
  alert("Please profile mein delivery address add karo");
  return;
}

if (deliveryMinimum > 0 && itemTotal < deliveryMinimum) {
  alert(`Is area mein minimum order Rs ${deliveryMinimum} hai. Rs ${minimumRemaining} aur add karo.`);
  return;
}

    setPlacing(true);

    try {
      const newOrder = {
        id: Date.now(),
        orderId: `NIV-${Date.now()}`,
        customerName: finalCustomerName || "Customer",
        customerMobile: finalCustomerMobile,
        address: finalCustomerAddress || customerAddress || "Address missing",
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image || "",
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
        })),
        itemTotal,
        couponCode: appliedCoupon?.code || null,
        couponDiscount,
        deliveryFee,
        handlingFee,
        tip,
        grandTotal,
        notes,
        paymentStatus: "Pending",
        orderStatus: "Placed",
        createdAt: new Date().toISOString(),
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!orderRes.ok) throw new Error("Order save failed");

      clearCart();
      alert("Order place ho gaya ✅");
    } catch {
      alert("Order save nahi hua, dobara try karo");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main style={ui.page}>
        <div style={ui.phone}>
          <div style={ui.topBar}>
            <Link href="/" style={ui.iconBtn}><ArrowLeft size={20} /></Link>
            <div style={ui.logoPill}>
              <div style={ui.logoIcon}><ShoppingBag size={14} /></div>
              <span style={ui.logoText}>NIVITO</span>
            </div>
            <div style={{ width: 40 }} />
          </div>

          <div style={{
            background: "#fff",
            borderRadius: 32,
            padding: "60px 24px",
            textAlign: "center",
            boxShadow: theme.shadow.lg,
            border: `1px solid ${theme.gray[100]}`,
            marginTop: 40,
          }}>
            <div style={{
              width: 120,
              height: 120,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: theme.accent.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 40px rgba(245,158,11,0.3)",
              animation: "bounce 2s infinite",
            }}>
              <ShoppingBag size={56} color="#fff" />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: theme.gray[900], margin: "0 0 8px" }}>
              Cart khaali hai
            </h2>

            <p style={{ fontSize: 14, color: theme.gray[500], margin: "0 0 24px" }}>
              Fresh sabziyan, fruits aur dairy add karo!
            </p>

            <Link href="/" style={{
              ...ui.btnPrimary,
              textDecoration: "none",
              display: "inline-flex",
              width: "auto",
              padding: "14px 28px",
            }}>
              <Sparkles size={16} /> Shopping shuru karo
            </Link>
          </div>
        </div>

        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`}</style>
      </main>
    );
  }

  return (
    <main style={ui.page}>
      <div
  style={{
    ...ui.phone,
   padding: "0 16px 210px",
  }}
>
        <div style={ui.topBar}>
          <Link href="/" style={ui.iconBtn}><ArrowLeft size={20} /></Link>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: theme.gray[900] }}>My Cart</div>
            <div style={{ fontSize: 11, color: theme.primary[600], fontWeight: 700 }}>
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </div>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={{
          background: theme.primary.gradientDark,
          borderRadius: 20,
          padding: "16px 18px",
          color: "#fff",
          boxShadow: theme.primary.shadowLg,
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }} />

          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Truck size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>DELIVERY IN</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>30 minutes ⚡</div>
          </div>

          <Clock size={18} style={{ opacity: 0.7 }} />
        </div>

        {freeDeliveryRemaining > 0 ? (
          <div style={{ ...ui.card, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.gray[700] }}>
                ₹{freeDeliveryRemaining} aur add karo - <span style={{ color: theme.primary[600] }}>FREE delivery!</span>
              </span>
              <Gift size={16} color={theme.primary[600]} />
            </div>

            <div style={{ height: 6, background: theme.gray[100], borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${freeDeliveryProgress}%`,
                background: theme.primary.gradient,
                borderRadius: 999,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        ) : (
          <div style={{
            background: theme.primary[50],
            border: `1px solid ${theme.primary[100]}`,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}>
            <div style={{ fontSize: 20 }}>🎉</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: theme.primary[700] }}>
              Yay! Aapko FREE delivery mil gayi
            </div>
          </div>
        )}

        {deliveryMinimum > 0 && (
          <div style={{
            background: minimumRemaining > 0 ? "#fff7ed" : theme.primary[50],
            border: `1px solid ${minimumRemaining > 0 ? "#fed7aa" : theme.primary[100]}`,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}>
            <AlertCircle size={18} color={minimumRemaining > 0 ? "#c2410c" : theme.primary[600]} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 900,
                color: minimumRemaining > 0 ? "#9a3412" : theme.primary[700],
              }}>
                Area minimum order Rs {deliveryMinimum}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.gray[600], marginTop: 2 }}>
                {minimumRemaining > 0
                  ? `Place order ke liye Rs ${minimumRemaining} aur add karo`
                  : "Minimum order complete ho gaya"}
              </div>
            </div>
          </div>
        )}

        <div style={{
          ...ui.card,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: theme.accent[100],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <MapPin size={18} color={theme.accent[600]} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: theme.gray[500],
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Delivery to
            </div>

            {loadingAreas && (
              <div style={{ fontSize: 11, color: theme.gray[500], marginTop: 2 }}>
                Loading delivery areas...
              </div>
            )}

            <div style={{
              fontSize: 13,
              fontWeight: 800,
              color: theme.gray[900],
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}>
              {customerAddress || "Profile में address add करें"}
            </div>

            <div style={{ fontSize: 11, color: theme.gray[500], marginTop: 3 }}>
              {customerMobile ? `${customerName} • ${customerMobile}` : "Profile में mobile number add करें"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {cart.map((item) => {
            const mrp = getItemMrp(item);
            const itemSaving = (mrp - item.price) * item.quantity;

            return (
              <div key={item.id} style={{ ...ui.card, padding: 12, display: "flex", gap: 12 }}>
                <div style={{
                  width: 76,
                  height: 76,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${theme.accent[50]}, ${theme.gray[50]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `1px solid ${theme.gray[100]}`,
                }}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
                    />
                  ) : (
                    <span style={{ fontSize: 32 }}>🥬</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: theme.gray[900],
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {item.name}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: theme.gray[900] }}>₹{item.price}</span>
                    {mrp > item.price && (
                      <>
                        <span style={{ fontSize: 11, color: theme.gray[400], textDecoration: "line-through" }}>₹{mrp}</span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: theme.primary[700],
                          background: theme.primary[50],
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}>
                          {Math.round(((mrp - item.price) / mrp) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      background: theme.primary.gradient,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}>
                      <button onClick={() => decreaseQty(item.id)} style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        background: "transparent",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Minus size={14} />
                      </button>

                      <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, minWidth: 24, textAlign: "center" }}>
                        {item.quantity}
                      </span>

                      <button onClick={() => increaseQty(item.id)} style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        background: "transparent",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: `1px solid ${theme.danger[200]}`,
                      background: theme.danger[50],
                      color: theme.danger[600],
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: theme.gray[900] }}>
                    ₹{item.price * item.quantity}
                  </div>

                  {itemSaving > 0 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.primary[600], marginTop: 2 }}>
                      Saved ₹{itemSaving}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {appliedCoupon ? (
          <div style={{
            background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
            border: `2px solid ${theme.primary[300]}`,
            borderRadius: 16,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: theme.primary.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CheckCircle2 size={22} color="#fff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: theme.primary[700], textTransform: "uppercase" }}>
                Coupon Applied
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: theme.primary[900] }}>
                {appliedCoupon.code}
              </div>
              <div style={{ fontSize: 11, color: theme.primary[700] }}>
                {appliedCoupon.message}
              </div>
            </div>

            <button onClick={removeCoupon} style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,0.7)",
              color: theme.danger[600],
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ ...ui.card, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Tag size={18} color={theme.accent[600]} />
              <span style={{ fontSize: 13, fontWeight: 800, color: theme.gray[900] }}>
                Coupon code lagao
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="Coupon code daalo"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: `2px solid ${couponError ? theme.danger[200] : theme.gray[100]}`,
                  borderRadius: 10,
                  outline: "none",
                  fontSize: 13,
                  fontWeight: 800,
                  color: theme.gray[900],
                  background: theme.gray[50],
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              />

              <button
                onClick={applyCoupon}
                disabled={checkingCoupon || !coupon.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: coupon.trim() ? theme.primary.gradient : theme.gray[200],
                  color: coupon.trim() ? "#fff" : theme.gray[500],
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: coupon.trim() ? "pointer" : "not-allowed",
                }}
              >
                {checkingCoupon ? "..." : "Apply"}
              </button>
            </div>

            {couponError && (
              <div style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                alignItems: "center",
                fontSize: 12,
                fontWeight: 700,
                color: theme.danger[600],
              }}>
                <AlertCircle size={14} /> {couponError}
              </div>
            )}


          </div>
        )}

        <div style={{ ...ui.card, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Heart size={16} color="#ec4899" fill="#ec4899" />
            <span style={{ fontSize: 13, fontWeight: 800, color: theme.gray[900] }}>
              Tip your delivery partner
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {TIPS.map((amt) => (
              <button key={amt} onClick={() => setTip(tip === amt ? 0 : amt)} style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: tip === amt ? `2px solid ${theme.primary[600]}` : `1px solid ${theme.gray[200]}`,
                background: tip === amt ? theme.primary[50] : "#fff",
                color: tip === amt ? theme.primary[700] : theme.gray[700],
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}>
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...ui.card, padding: 14 }}>
          <button onClick={() => setShowNotes(!showNotes)} style={{
            width: "100%",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: theme.gray[900] }}>
              Delivery instructions
            </span>

            <ChevronRight
              size={18}
              color={theme.gray[400]}
              style={{ transform: showNotes ? "rotate(90deg)" : "none", transition: "0.2s" }}
            />
          </button>

          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Bell mat bajao, baby so raha hai"
              rows={2}
              style={{
                ...(ui.fieldInput as CSSProperties),
                marginTop: 10,
                fontSize: 12,
                resize: "none",
                fontWeight: 500,
              }}
            />
          )}
        </div>

        <div style={{ ...ui.card, padding: 16 }}>
          <h3 style={{ ...ui.sectionTitle, marginBottom: 12 }}>Bill Details</h3>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            {productSavings > 0 && <Row label="Item Total (MRP)" value={`₹${mrpTotal}`} strikethrough />}
            <Row label="Item Total" value={`₹${itemTotal}`} />
            {productSavings > 0 && <Row label="Product Discount" value={`-₹${productSavings}`} good />}
            {couponDiscount > 0 && <Row label={`Coupon (${appliedCoupon?.code})`} value={`-₹${couponDiscount}`} good />}
            <Row label="Delivery Fee" value={deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`} good={deliveryFee === 0} />
            <Row label="Handling Fee" value={`₹${handlingFee}`} />
            {tip > 0 && <Row label="Delivery Tip" value={`₹${tip}`} />}

            <div style={{
              height: 1,
              background: theme.gray[100],
              margin: "4px 0",
            }} />

            <Row label="Grand Total" value={`₹${grandTotal}`} bold />
          </div>
        </div>

  <div style={{
  position: "fixed",
  left: "50%",
  bottom: "calc(72px + env(safe-area-inset-bottom))",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 430,
  padding: "0 16px",
  boxSizing: "border-box",
  background: "transparent",
  zIndex: 50,
}}>


          <button
            onClick={placeOrder}
            disabled={placing || minimumRemaining > 0}
            style={{
              ...ui.btnPrimary,
              width: "100%",
              height: 54,
              opacity: placing || minimumRemaining > 0 ? 0.7 : 1,
              cursor: placing || minimumRemaining > 0 ? "not-allowed" : "pointer",
              justifyContent: "space-between",
              padding: "0 18px",
            }}
          >
            <span>
              <b>₹{grandTotal}</b>
              <small style={{ display: "block", fontSize: 11, opacity: 0.9 }}>
                {cart.length} items
              </small>
            </span>

            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {placing ? "Placing..." : minimumRemaining > 0 ? `Add Rs ${minimumRemaining}` : "Place Order"} <ChevronRight size={20} />
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  good,
  bold,
  strikethrough,
}: {
  label: string;
  value: string;
  good?: boolean;
  bold?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: bold ? 900 : 600,
      color: bold ? "#111827" : "#4b5563",
      fontSize: bold ? 15 : 13,
    }}>
      <span>{label}</span>
      <span style={{
        color: good ? "#059669" : "#111827",
        textDecoration: strikethrough ? "line-through" : "none",
      }}>
        {value}
      </span>
    </div>
  );
}
