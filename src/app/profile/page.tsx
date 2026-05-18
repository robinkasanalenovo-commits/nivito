"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, CSSProperties } from "react";
import { useCart } from "@/context/CartContext";
import { appConfig } from "@/lib/appConfig";

type OrderItem = { id: number; name: string; quantity: number; total: number };
type Order = {
  id: number;
  orderId: string;
  items?: OrderItem[];
  grandTotal: number;
  orderStatus: string;
  createdAt: string;
};
type LoginUserType = {
  id?: number;
  full_name?: string;
  name?: string;
  mobile_number?: string;
  mobile?: string;
  phone?: string;
  area?: string;
  sub_area?: string;
  subArea?: string;
  address?: string;
  landmark?: string;
  full_address?: string;
  created_at?: string;
};
type CouponType = {
  id: number;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  label: string;
  active: boolean;
};
type SavedAddress = {
  id: number; title: string; name: string; mobile: string;
  address: string; city: string; pincode: string; landmark: string; isDefault: boolean;
};
type ModalType =
  | "orders" | "addresses" | "refer" | "support"
  | "privacy" | "settings" | "coupons" | "rewards" | "premium" | null;

const defaultAddress: SavedAddress = {
  id: 1, title: "Home", name: "Customer", mobile: "",
  address: "", city: appConfig.defaultCity, pincode: appConfig.defaultPincode,
  landmark: "", isDefault: true,
};

function getCustomerName(user: LoginUserType | null) {
  return user?.full_name || user?.name || "Customer";
}

function getCustomerMobile(user: LoginUserType | null) {
  return user?.mobile_number || user?.mobile || user?.phone || "";
}

function getCustomerAddress(user: LoginUserType | null): SavedAddress | null {
  if (!user) return null;

  const area = user.area || "";
  const subArea = user.sub_area || user.subArea || "";
  const address = user.address || "";
  const landmark = user.landmark || "";
  const fullAddress =
    user.full_address ||
    [area, subArea, address, landmark ? `Landmark: ${landmark}` : ""]
      .filter((v) => v && String(v).trim())
      .join(", ");

  if (!fullAddress.trim() && !address.trim()) return null;

  return {
    id: 1,
    title: "Home",
    name: getCustomerName(user),
    mobile: getCustomerMobile(user),
    address: address || fullAddress,
    city: [area, subArea].filter(Boolean).join(", ") || appConfig.defaultCity,
    pincode: appConfig.defaultPincode,
    landmark,
    isDefault: true,
  };
}

function isPlaceholderAddress(address: SavedAddress) {
  const addressText = `${address.address || ""} ${address.city || ""} ${address.pincode || ""}`.toLowerCase();
  return (
    !address.address?.trim() ||
    (
      (
        addressText.includes("sector 56") ||
        addressText === `${appConfig.defaultCity} ${appConfig.defaultPincode}`.toLowerCase()
      ) &&
      addressText.includes("noida") &&
      (!address.landmark?.trim() || address.landmark === defaultAddress.landmark)
    )
  );
}

function mergeAddresses(savedAddresses: SavedAddress[], customerAddress: SavedAddress | null) {
  if (!customerAddress) return savedAddresses.length > 0 ? savedAddresses : [defaultAddress];

  const usableSaved = savedAddresses
    .filter((address) => !isPlaceholderAddress(address))
    .map((address, index) => ({ ...address, isDefault: false, id: address.id || Date.now() + index }));

  return [
    { ...customerAddress, isDefault: true },
    ...usableSaved.filter((address) => {
      const sameMobile = address.mobile && address.mobile === customerAddress.mobile;
      const sameAddress = address.address.trim().toLowerCase() === customerAddress.address.trim().toLowerCase();
      return !(sameMobile && sameAddress);
    }),
  ];
}

function readStoredCustomer() {
  const savedUsers = [
    localStorage.getItem("nivito_user"),
    localStorage.getItem("nivito_customer"),
  ].filter(Boolean);

  for (const saved of savedUsers) {
    try {
      const user = JSON.parse(saved as string) as LoginUserType;
      if (getCustomerAddress(user)) return user;
    } catch {}
  }

  for (const saved of savedUsers) {
    try {
      return JSON.parse(saved as string) as LoginUserType;
    } catch {}
  }

  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { cart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<CouponType[]>([]);
  const [referralCode, setReferralCode] = useState("NIVITO-000000");
  const [loginUser, setLoginUser] = useState<LoginUserType | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notificationOn, setNotificationOn] = useState(true);
  const [addressForm, setAddressForm] = useState<SavedAddress>(defaultAddress);
  const [copied, setCopied] = useState(false);

  const defaultSavedAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0] || defaultAddress,
    [addresses]
  );
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  useEffect(() => {
    const loadUser = () => {
      setLoginUser(readStoredCustomer());
    };
    loadUser();
    window.addEventListener("focus", loadUser);
    window.addEventListener("pageshow", loadUser);
    return () => {
      window.removeEventListener("focus", loadUser);
      window.removeEventListener("pageshow", loadUser);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("nivito_referral");
    if (saved) setReferralCode(saved);
    else {
      const code = "NIVITO-" + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem("nivito_referral", code);
      setReferralCode(code);
    }
  }, []);

  useEffect(() => {
    const savedCustomer = readStoredCustomer();
    let customerAddress: SavedAddress | null = null;

    if (savedCustomer) {
      customerAddress = getCustomerAddress(savedCustomer);
    }

    const savedAddresses = localStorage.getItem("nivito_addresses");
    if (savedAddresses) {
      try {
        const parsed = JSON.parse(savedAddresses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = mergeAddresses(parsed, customerAddress);
          setAddresses(merged);
          setAddressForm(merged.find((a: SavedAddress) => a.isDefault) || merged[0]);
          localStorage.setItem("nivito_addresses", JSON.stringify(merged));
          return;
        }
      } catch { localStorage.removeItem("nivito_addresses"); }
    }

    const initialAddresses = mergeAddresses([], customerAddress);
    setAddresses(initialAddresses);
    setAddressForm(initialAddresses[0]);
    localStorage.setItem("nivito_addresses", JSON.stringify(initialAddresses));
  }, []);

  useEffect(() => {
    const n = localStorage.getItem("nivito_notifications");
    if (n) setNotificationOn(n === "on");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const user = readStoredCustomer();
        const mobile = getCustomerMobile(user);
        const [ordersRes, adminRes] = await Promise.all([
          mobile ? fetch(`/api/customer-orders?mobile=${encodeURIComponent(mobile)}`, { cache: "no-store" }) : null,
          fetch("/api/admin-data", { cache: "no-store" }),
        ]);
        const adminData = await adminRes.json();

        if (ordersRes?.ok) {
          const orderData = await ordersRes.json();
          setOrders((orderData.orders || []).slice(0, 8));
          setOrdersError("");
        } else {
          setOrders([]);
          setOrdersError(mobile ? "Orders load nahi hue. Dobara try karein." : "");
        }

        setAvailableCoupons(
          Array.isArray(adminData.coupons)
            ? adminData.coupons.filter((coupon: CouponType) => coupon.active)
            : []
        );
      } catch {
        setOrders([]);
        setOrdersError("Profile data load nahi hua. Dobara try karein.");
        setAvailableCoupons([]);
      }
    };
    load();
  }, []);

  const openAddressModal = () => {
    setAddressForm(defaultSavedAddress);
    setActiveModal("addresses");
  };

  const saveAddress = () => {
    const clean: SavedAddress = {
      ...addressForm,
      title: addressForm.title.trim() || "Home",
      name: addressForm.name.trim() || getCustomerName(loginUser),
      mobile: addressForm.mobile.trim() || getCustomerMobile(loginUser),
      address: addressForm.address.trim(),
      city: addressForm.city.trim() || appConfig.defaultCity,
      pincode: addressForm.pincode.trim() || appConfig.defaultPincode,
      landmark: addressForm.landmark.trim(),
      isDefault: true,
    };
    if (!clean.address) {
      alert("Address daalna zaroori hai");
      return;
    }
    const updated = mergeAddresses(addresses, { ...clean, id: clean.id || Date.now() });
    setAddresses(updated);
    localStorage.setItem("nivito_addresses", JSON.stringify(updated));
    setActiveModal(null);
  };

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { alert("Code copy nahi hua"); }
  };

  const shareReferral = async () => {
    const text = `Nivito pe fresh grocery order karo. Mera referral code use karo: ${referralCode}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Nivito Refer & Earn", text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    alert("Referral message copied ✅");
  };

  const handleLogin = () => router.push("/login");
  const handleLogout = () => {
    window.localStorage.removeItem("nivito_user");
    window.localStorage.removeItem("nivito_customer");
    setLoginUser(null);
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Account delete page par jana hai? Is action se data remove ho sakta hai.")) {
      router.push("/delete-account");
    }
  };

  const callSupport = () => { window.location.href = `tel:+${appConfig.supportPhoneIntl}`; };
  const whatsappSupport = () => {
    window.open(`https://wa.me/${appConfig.supportPhoneIntl}?text=${encodeURIComponent("Hello Nivito, mujhe help chahiye.")}`, "_blank");
  };

  const toggleNotification = async () => {
    if (!notificationOn && typeof Notification !== "undefined" && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        alert("Browser notification permission off hai");
        return;
      }
    }
    const next = !notificationOn;
    setNotificationOn(next);
    localStorage.setItem("nivito_notifications", next ? "on" : "off");
  };

  const getModalTitle = (m: ModalType): string => ({
    orders: "My Orders", addresses: "Saved Address", refer: "Refer & Earn",
    support: "Customer Support", privacy: "Privacy Policy", settings: "Settings",
    coupons: "Coupons", rewards: "Rewards", premium: "Nivito Premium",
  } as Record<string, string>)[m as string] || "";

  return (
    <main style={styles.main}>
      <div style={styles.phone}>
        {/* Header */}
        <section style={styles.header}>
          <div style={styles.headerGlowOne} />
          <div style={styles.headerGlowTwo} />
          <div style={styles.headerTop}>
            <Link href="/" style={styles.backBtn}>‹</Link>
            <h1 style={styles.title}>My Profile</h1>
            <button onClick={() => setActiveModal("settings")} style={styles.bellBtn}>
              🔔<span style={styles.redDot} />
            </button>
          </div>
        </section>

        {/* User Card */}
        <section style={styles.loginWrap}>
          <div style={styles.loginCard}>
            <div style={styles.avatarBox}>
              <div style={styles.avatar}>
                {loginUser ? getCustomerName(loginUser).charAt(0).toUpperCase() : "👤"}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={styles.hello}>
                {loginUser ? `Hello, ${getCustomerName(loginUser)} 👋` : "Hello, Customer 👋"}
              </h2>
              <p style={styles.subText}>
                {loginUser ? `Mobile: +91 ${getCustomerMobile(loginUser)}` : "Login to access orders & offers"}
              </p>
            </div>
            <button onClick={loginUser ? handleLogout : handleLogin} style={styles.loginBtn}>
              {loginUser ? "Logout" : "Login"} ›
            </button>
          </div>
        </section>

        {/* Stats — 3 columns */}
        <section style={styles.statsCard}>
          <button onClick={() => setActiveModal("orders")} style={styles.statButton}>
            <StatBox icon="🛍️" value={orders.length} label="Orders" border />
          </button>
          <button onClick={() => setActiveModal("rewards")} style={styles.statButton}>
            <StatBox icon="🎁" value={0} label="Rewards" border />
          </button>
          <button onClick={() => setActiveModal("coupons")} style={styles.statButton}>
            <StatBox icon="🏷️" value={availableCoupons.length} label="Coupons" />
          </button>
        </section>

        {/* Menu */}
        <section style={styles.menuCard}>
          <MenuItem icon="📦" title="My Orders" onClick={() => setActiveModal("orders")} />
          <MenuItem icon="🏠" title="Saved Address" onClick={openAddressModal} />
          <MenuItem icon="🎁" title="Refer & Earn" badge="Earn" onClick={() => setActiveModal("refer")} />
          <MenuItem icon="🎧" title="Customer Support" onClick={() => setActiveModal("support")} />
          <MenuItem icon="🛡️" title="Privacy Policy" onClick={() => router.push("/privacy")} />
          <MenuItem icon="⚙️" title="Settings" onClick={() => setActiveModal("settings")} />
          <MenuItem icon="❌" title="Delete Account" onClick={handleDeleteAccount} />
        </section>

        {/* Refer Card */}
        <section style={styles.referCard}>
          <div style={styles.referTop}>
            <div style={styles.giftBox}>🎁</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={styles.referTitle}>Refer & Earn 🎉</p>
              <p style={styles.referSub}>Doston ko invite karo aur rewards paao</p>
            </div>
          </div>
          <div style={styles.codeRow}>
            <p style={styles.codeBox}>{referralCode}</p>
            <button onClick={copyReferral} style={styles.copyBtn}>
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={shareReferral} style={styles.shareBtn}>Share</button>
          </div>
        </section>

        {/* Premium */}
        <section style={styles.premiumCard}>
          <div style={styles.crownBox}>👑</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.premiumTitle}>Nivito Premium</p>
            <p style={styles.premiumSub}>Free delivery & priority support</p>
          </div>
          <button onClick={() => setActiveModal("premium")} style={styles.exploreBtn}>
            Explore
          </button>
        </section>

        {/* Logout / Login */}
        <section style={styles.logoutCard}>
          {loginUser ? (
            <button onClick={handleLogout} style={styles.logoutBtn}>↪ Logout</button>
          ) : (
            <button onClick={handleLogin} style={{ ...styles.logoutBtn, color: "#08743d" }}>
              Login to your account
            </button>
          )}
        </section>

        {/* Bottom Nav */}
        <nav style={styles.bottomNav}>
          <BottomNavItem href="/" icon="🏠" label="Home" />
          <BottomNavItem href="/category/all" icon="▦" label="Categories" />
          <BottomNavItem href="/cart" icon="🛒" label="Cart" badge={cartCount > 0 ? String(cartCount) : undefined} />
          <BottomNavItem href="/profile" icon="👤" label="Profile" active />
        </nav>

        {/* Modal */}
        {activeModal && (
          <Modal title={getModalTitle(activeModal)} onClose={() => setActiveModal(null)}>
            {activeModal === "orders" && (
              <div>
                {orders.length === 0 ? (
                  <div style={styles.modalEmpty}>
                    <div style={{ fontSize: 42 }}>🛍️</div>
                    <h3 style={styles.modalEmptyTitle}>{ordersError ? "Orders load nahi hue" : "Koi order nahi mila"}</h3>
                    <p style={styles.modalText}>{ordersError || "Jab aap order karenge, yahan dikhega."}</p>
                    <Link href="/" style={styles.primaryLink}>Start Shopping</Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {orders.map((o) => (
                      <div key={o.id} style={styles.modalOrderCard}>
                        <div>
                          <p style={styles.orderId}>#{o.orderId}</p>
                          <p style={styles.orderInfo}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={styles.orderTotal}>₹{o.grandTotal}</p>
                          <span style={styles.orderStatus}>{o.orderStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeModal === "addresses" && (
              <div style={{ display: "grid", gap: 10 }}>
                <Field label="Title" value={addressForm.title} onChange={(v) => setAddressForm({ ...addressForm, title: v })} placeholder="Home / Office" />
                <Field label="Name" value={addressForm.name} onChange={(v) => setAddressForm({ ...addressForm, name: v })} />
                <Field label="Mobile" value={addressForm.mobile} onChange={(v) => setAddressForm({ ...addressForm, mobile: v })} />
                <Field label="Address" value={addressForm.address} onChange={(v) => setAddressForm({ ...addressForm, address: v })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="City" value={addressForm.city} onChange={(v) => setAddressForm({ ...addressForm, city: v })} />
                  <Field label="Pincode" value={addressForm.pincode} onChange={(v) => setAddressForm({ ...addressForm, pincode: v })} />
                </div>
                <Field label="Landmark" value={addressForm.landmark} onChange={(v) => setAddressForm({ ...addressForm, landmark: v })} />
                <button onClick={saveAddress} style={styles.saveBtn}>📍 Save Address</button>
              </div>
            )}

            {activeModal === "refer" && (
              <div style={{ textAlign: "center", display: "grid", gap: 12 }}>
                <div style={{ fontSize: 48 }}>🎁</div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Invite & Earn ₹50 per friend</p>
                <p style={styles.modalText}>Apna code share karo, dost order kare to ₹50 wallet mein</p>
                <div style={styles.referCodeBig}>{referralCode}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copyReferral} style={styles.outlineBtn}>{copied ? "Copied" : "Copy Code"}</button>
                  <button onClick={shareReferral} style={styles.pinkBtn}>Share</button>
                </div>
              </div>
            )}

            {activeModal === "support" && (
              <div style={{ display: "grid", gap: 10 }}>
                <p style={{ ...styles.modalText, textAlign: "center" }}>Hum 24/7 available hain</p>
                <button onClick={callSupport} style={styles.greenBtn}>📞 Call: {appConfig.supportPhone}</button>
                <button onClick={whatsappSupport} style={styles.whatsappBtn}>💬 WhatsApp Chat</button>
              </div>
            )}

            {activeModal === "coupons" && (
              <div style={{ display: "grid", gap: 10 }}>
                {availableCoupons.length === 0 ? (
                  <div style={styles.modalEmpty}>
                    <div style={{ fontSize: 42 }}>???</div>
                    <h3 style={styles.modalEmptyTitle}>Abhi koi coupon nahi hai</h3>
                    <p style={styles.modalText}>Naye offers aayenge to yahan dikhenge.</p>
                  </div>
                ) : (
                  availableCoupons.map((coupon) => (
                    <div key={coupon.id} style={styles.couponCard}>
                      <div>
                        <p style={styles.couponCode}>{coupon.code}</p>
                        <p style={styles.couponLabel}>{coupon.label}</p>
                        <p style={styles.couponMeta}>
                          Min order Rs {coupon.minOrder || 0}
                          {coupon.maxDiscount ? ` | Max Rs ${coupon.maxDiscount}` : ""}
                        </p>
                      </div>
                      <Link href="/cart" style={styles.useCouponBtn}>
                        Use
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeModal === "settings" && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={styles.settingsRow}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Notifications</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Order updates & offers</p>
                  </div>
                  <button
                    onClick={toggleNotification}
                    style={{ ...styles.toggleBtn, background: notificationOn ? "#10b981" : "#d1d5db" }}
                  >
                    <span style={{ ...styles.toggleKnob, transform: notificationOn ? "translateX(20px)" : "translateX(0)" }} />
                  </button>
                </div>
                <button onClick={() => router.push("/privacy")} style={styles.outlineBtn}>Privacy Policy</button>
                <button onClick={() => router.push("/delete-account")} style={styles.dangerBtn}>🗑 Delete Account</button>
              </div>
            )}

            {(activeModal === "rewards" || activeModal === "premium" || activeModal === "privacy") && (
              <div style={styles.modalEmpty}>
                <div style={{ fontSize: 42 }}>
                  {activeModal === "premium" ? "Premium" : "Rewards"}
                </div>
                <h3 style={styles.modalEmptyTitle}>
                  {activeModal === "premium" ? "Premium aane wala hai!" : "Jaldi aa raha hai"}
                </h3>
                <p style={styles.modalText}>Yeh feature jald hi available hoga.</p>
              </div>
            )}
          </Modal>
        )}
      </div>
    </main>
  );
}

/* ───────── Sub-components ───────── */

function StatBox({ icon, value, label, border }: { icon: string; value: number; label: string; border?: boolean }) {
  return (
    <div style={{ ...styles.statBox, borderRight: border ? "1px solid #e5e7eb" : "none" }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function MenuItem({ icon, title, badge, onClick }: { icon: string; title: string; badge?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.menuRow}>
      <div style={styles.menuIcon}>{icon}</div>
      <span style={styles.menuTitle}>{title}</span>
      {badge && <span style={styles.menuBadge}>{badge}</span>}
      <span style={styles.menuArrow}>›</span>
    </button>
  );
}

function BottomNavItem({ href, icon, label, active, badge }: { href: string; icon: string; label: string; active?: boolean; badge?: string }) {
  return (
    <Link href={href} style={{ ...styles.navItem, color: active ? "#10b981" : "#6b7280" }}>
      <div style={{ position: "relative", fontSize: 20 }}>
        {icon}
        {badge && <span style={styles.navBadge}>{badge}</span>}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </Link>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} style={styles.modalClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={styles.fieldLabel}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.fieldInput}
      />
    </div>
  );
}

/* ───────── Styles ───────── */

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fef3c7 0%, #fed7aa 50%, #fef3c7 100%)",
    padding: "16px 0 100px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    width: "100%",
    maxWidth: "100vw",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    minWidth: 0,
    margin: "0 auto",
    padding: "0 16px",
    boxSizing: "border-box",
    display: "grid",
    gap: 14,
    position: "relative",
    overflowX: "hidden",
  },
  header: { position: "relative", minWidth: 0, paddingTop: 4, overflow: "hidden" },
  headerGlowOne: { position: "absolute", width: 80, height: 80, background: "rgba(16,185,129,0.15)", borderRadius: "50%", top: -20, left: -20, filter: "blur(30px)" },
  headerGlowTwo: { position: "absolute", width: 80, height: 80, background: "rgba(236,72,153,0.15)", borderRadius: "50%", top: -20, right: -20, filter: "blur(30px)" },
  headerTop: { display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) 40px", alignItems: "center", gap: 8, position: "relative", zIndex: 2 },
  backBtn: {
    width: 36, height: 36, borderRadius: "50%", background: "#fff",
    border: "1px solid #e5e7eb", display: "flex", alignItems: "center",
    justifyContent: "center", textDecoration: "none", color: "#111", fontSize: 20, fontWeight: 700,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  title: { fontSize: 18, fontWeight: 800, margin: 0, color: "#111", textAlign: "center", minWidth: 0 },
  bellBtn: {
    width: 36, height: 36, borderRadius: "50%", background: "#fff",
    border: "1px solid #e5e7eb", position: "relative", cursor: "pointer", fontSize: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  redDot: { position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#ef4444", borderRadius: "50%" },

  loginWrap: {},
  loginCard: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderRadius: 18, padding: 14, color: "#fff",
    display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", alignItems: "center", gap: 10,
    boxShadow: "0 8px 20px rgba(16,185,129,0.25)",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  avatarBox: {},
  avatar: {
    width: 52, height: 52, borderRadius: "50%",
    background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700,
  },
  hello: { fontSize: 15, fontWeight: 700, lineHeight: 1.2, margin: 0, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subText: { fontSize: 12, lineHeight: 1.35, margin: "2px 0 0", color: "rgba(255,255,255,0.9)", overflowWrap: "anywhere" },
  loginBtn: {
    background: "#fff", color: "#059669", border: "none",
    padding: "8px 11px", borderRadius: 8, fontWeight: 700, fontSize: 12,
    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
  },

  statsCard: {
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", overflow: "hidden",
    minWidth: 0,
    boxSizing: "border-box",
  },
  statButton: {
    background: "transparent", border: "none", padding: 0,
    cursor: "pointer", width: "100%", minWidth: 0,
  },
  statBox: { padding: "14px 8px", textAlign: "center" },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 800, color: "#111" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  menuCard: {
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden",
    minWidth: 0,
    boxSizing: "border-box",
  },
  menuRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", border: "none", borderBottom: "1px solid #f3f4f6",
    background: "#fff", cursor: "pointer", textAlign: "left", minWidth: 0, boxSizing: "border-box",
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10, background: "#f9fafb",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
  },
  menuTitle: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  menuBadge: {
    background: "#fce7f3", color: "#be185d",
    padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
    flexShrink: 0,
  },
  menuArrow: { color: "#9ca3af", fontSize: 18, fontWeight: 600, flexShrink: 0 },

  referCard: {
    background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    borderRadius: 16, border: "1px solid #fbcfe8", padding: 14,
    display: "grid", gap: 10,
  },
  referTop: { display: "flex", alignItems: "center", gap: 12 },
  giftBox: {
    width: 44, height: 44, borderRadius: 12, background: "#fbcfe8",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
  },
  referTitle: { fontWeight: 700, color: "#831843", margin: 0, fontSize: 14 },
  referSub: { fontSize: 12, color: "#9d174d", margin: "2px 0 0" },
  codeRow: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", padding: 8, borderRadius: 10, border: "1px solid #fbcfe8",
  },
  codeBox: {
    flex: 1, fontFamily: "monospace", fontSize: 13, fontWeight: 700,
    color: "#831843", margin: 0, overflow: "hidden", textOverflow: "ellipsis",
  },
  copyBtn: {
    background: "#fff", color: "#831843", border: "1px solid #fbcfe8",
    padding: "6px 12px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
  },
  shareBtn: {
    background: "#db2777", color: "#fff", border: "none",
    padding: "6px 12px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
  },

  premiumCard: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    borderRadius: 16, border: "1px solid #fcd34d",
    padding: 14, display: "flex", alignItems: "center", gap: 12,
  },
  crownBox: {
    width: 44, height: 44, borderRadius: 12, background: "#fcd34d",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
  },
  premiumTitle: { fontWeight: 700, color: "#78350f", margin: 0, fontSize: 14 },
  premiumSub: { fontSize: 12, color: "#92400e", margin: "2px 0 0" },
  exploreBtn: {
    background: "#d97706", color: "#fff", border: "none",
    padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
  },

  logoutCard: {
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 6,
  },
  logoutBtn: {
    width: "100%", padding: "10px", border: "none", background: "transparent",
    color: "#dc2626", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },

  bottomNav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    width: "100%", maxWidth: 430, margin: "0 auto",
    boxSizing: "border-box",
    background: "#fff", borderTop: "1px solid #e5e7eb",
    display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 40,
  },
  navItem: {
    flex: 1,
    minWidth: 0,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
    textDecoration: "none", padding: "4px 6px", fontSize: 10,
  },
  navBadge: {
    position: "absolute", top: -4, right: -8, background: "#ef4444", color: "#fff",
    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999,
  },

  /* Modal */
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
  },
  modalSheet: {
    background: "#fff", width: "100%", maxWidth: 480,
    borderRadius: "20px 20px 0 0", maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: {
    position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #e5e7eb",
    padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2,
  },
  modalTitle: { fontSize: 16, fontWeight: 800, margin: 0, color: "#111" },
  modalClose: {
    width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f3f4f6",
    fontSize: 14, cursor: "pointer", color: "#111",
  },
  modalBody: { padding: 14 },
  modalEmpty: { textAlign: "center", padding: "20px 0", display: "grid", gap: 10 },
  modalEmptyTitle: { fontSize: 15, fontWeight: 700, color: "#111", margin: 0 },
  modalText: { fontSize: 13, color: "#6b7280", margin: 0 },
  primaryLink: {
    display: "inline-block", background: "#10b981", color: "#fff",
    padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none",
  },
  modalOrderCard: {
    border: "1px solid #e5e7eb", borderRadius: 12, padding: 12,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  orderId: { fontSize: 13, fontWeight: 700, color: "#111", margin: 0 },
  orderInfo: { fontSize: 11, color: "#6b7280", margin: "2px 0 0" },
  orderTotal: { fontSize: 14, fontWeight: 800, color: "#059669", margin: 0 },
  orderStatus: {
    fontSize: 10, background: "#f3f4f6", color: "#374151",
    padding: "2px 8px", borderRadius: 999, marginTop: 4, display: "inline-block",
  },
  couponCard: {
    border: "1px solid #d1fae5",
    borderRadius: 14,
    padding: 12,
    background: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  couponCode: { margin: 0, fontSize: 16, fontWeight: 900, color: "#065f46" },
  couponLabel: { margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "#111827" },
  couponMeta: { margin: "3px 0 0", fontSize: 11, fontWeight: 600, color: "#047857" },
  useCouponBtn: {
    background: "#10b981",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 800,
    textDecoration: "none",
  },

  fieldLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 4 },
  fieldInput: {
    width: "100%", height: 36, padding: "0 10px", borderRadius: 8,
    border: "1px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box",
  },
  saveBtn: {
    width: "100%", padding: "10px", background: "#10b981", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4,
  },
  outlineBtn: {
    flex: 1, width: "100%", padding: "10px", background: "#fff",
    border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
  pinkBtn: {
    flex: 1, padding: "10px", background: "#db2777", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
  },
  greenBtn: {
    width: "100%", padding: "10px", background: "#10b981", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
  whatsappBtn: {
    width: "100%", padding: "10px", background: "#16a34a", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
  dangerBtn: {
    width: "100%", padding: "10px", background: "#fff", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
  },
  referCodeBig: {
    background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: 10,
    padding: 12, fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: "#831843",
  },
  settingsRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: 12, border: "1px solid #e5e7eb", borderRadius: 10,
  },
  toggleBtn: {
    position: "relative", width: 44, height: 24, border: "none",
    borderRadius: 999, cursor: "pointer", padding: 0, transition: "background 0.2s",
  },
  toggleKnob: {
    position: "absolute", top: 2, left: 2, width: 20, height: 20,
    background: "#fff", borderRadius: "50%", transition: "transform 0.2s",
  },
};
