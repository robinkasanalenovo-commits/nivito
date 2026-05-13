"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  MapPin, ChevronDown, Bell, Search, Mic, Plus, Minus, X,
  Home as HomeIcon, Grid3x3, ShoppingCart, User, ArrowRight,
  Clock, Sparkles, LogOut, Phone, Check,
} from "lucide-react";
import { theme } from "@/lib/theme";

type Banner = { id: number; title: string; image: string; link: string; active: boolean };
type Category = { id: number; name: string; image?: string; link?: string; active: boolean };
type Variant = { id: number; weight: string; sellingPrice: number; stock: number; active: boolean };
type Product = { id: number; name: string; image: string; category: string; active: boolean; variants: Variant[] };
type NotifSettings = { title: string; message: string; active: boolean; showPopup: boolean; updatedAt: number };
type LoginUser = { id: number; full_name: string; mobile_number: string };
type CartItem = { id: number; name: string; price: number; quantity: number; image?: string };
type ProductCardProps = {
  product: Product;
  selectedVariants: Record<number, Variant>;
  setSelectedVariants: React.Dispatch<React.SetStateAction<Record<number, Variant>>>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  getCartId: (productId: number, variantId: number) => number;
  compact?: boolean;
};

const defaultNotif: NotifSettings = { title: "", message: "", active: false, showPopup: true, updatedAt: 0 };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function getCategoryLink(c: Category) {
  if (c.link?.trim()) return c.link;
  return `/category/${slugify(c.name) || `category-${c.id}`}`;
}
function getMrp(p: number) { return Math.ceil(Number(p || 0) * 1.35); }

// ═══════════════ MAIN PAGE ═══════════════
export default function HomePage() {
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [notif, setNotif] = useState<NotifSettings>(defaultNotif);
  const [search, setSearch] = useState("");
  const [showLocBox, setShowLocBox] = useState(false);
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [location, setLocation] = useState("Sector 56, Noida");
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [activePill, setActivePill] = useState("all");
  const [selectedVariants, setSelectedVariants] = useState<Record<number, Variant>>({});

  useEffect(() => {
    const u = window.localStorage.getItem("nivito_user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (u) { try { setLoginUser(JSON.parse(u)); } catch {} }
    const l = window.localStorage.getItem("nivito_location");
    if (l) setLocation(l);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin-data", { cache: "no-store" });
        const data = await res.json();
        setBanners((data.banners || []).filter((b: Banner) => b.active));
        setAdminCategories((data.categories || []).filter((c: Category) => c.active));
        const prods = (data.products || [])
          .filter((p: Product) => p.active)
          .map((p: Product) => ({ ...p, image: p.image || "", category: p.category || "General",
            variants: (p.variants || []).filter((v) => v.active) }))
          .filter((p: Product) => p.variants.length > 0);
        setAdminProducts(prods);
        const d: Record<number, Variant> = {};
        prods.forEach((p: Product) => { d[p.id] = p.variants[0]; });
        setSelectedVariants(d);
        setNotif({ ...defaultNotif, ...(data.notificationSettings || {}) });
      } catch (e) { console.log(e); }
    };
    load();
    const t = window.setInterval(load, 3000);
    window.addEventListener("focus", load);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", load);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIdx((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);
  const getCartId = (pid: number, vid: number) => pid * 1000000 + (vid % 1000000);

  const categoryPills = useMemo(() => [
    { key: "all", label: "All", emoji: "✨" },
    ...adminCategories.map((c) => ({ key: slugify(c.name), label: c.name, emoji: "🛍️" })),
  ], [adminCategories]);

  const filteredProducts = useMemo(() => {
    let r = adminProducts;
    if (activePill !== "all") r = r.filter((p) => slugify(p.category) === activePill);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(q));
    }
    return r;
  }, [adminProducts, activePill, search]);

  const sections = useMemo(() => {
    return adminCategories.map((cat) => ({
      category: cat,
      products: adminProducts.filter((p) => slugify(p.category || "General") === slugify(cat.name)).slice(0, 8),
    })).filter((s) => s.products.length > 0);
  }, [adminCategories, adminProducts]);

  const saveLocation = (l: string) => {
    setLocation(l);
    window.localStorage.setItem("nivito_location", l);
    setShowLocBox(false);
  };
  const handleLogout = () => {
    window.localStorage.removeItem("nivito_user");
    setLoginUser(null);
    window.location.href = "/login";
  };

  // ═══════════════ RENDER ═══════════════
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      paddingBottom: 90,
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 430,
        padding: "10px 12px 0",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}>

        {/* HEADER */}
        <div style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
          borderRadius: 22, padding: "14px 14px 16px",
          color: "#fff", boxShadow: "0 16px 36px rgba(5,150,105,0.3)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -30, top: -30,
            width: 110, height: 110, borderRadius: "50%",
            background: "rgba(251,191,36,0.12)", pointerEvents: "none",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, position: "relative" }}>
            <button onClick={() => setShowLocBox(true)} style={{
              flex: 1, minWidth: 0, textAlign: "left",
              background: "transparent", border: "none", color: "#fff", padding: 0, cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 800 }}>
                <MapPin size={14} color="#fcd34d" />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{location}</span>
                <ChevronDown size={12} />
              </div>
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3, fontWeight: 600 }}>Delivering to 201301</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                <Clock size={10} /> 9:30–11:30 AM | 5–7:30 PM
              </div>
            </button>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {loginUser ? (
                <button onClick={handleLogout} style={iconBtnStyle}><LogOut size={14} /></button>
              ) : (
                <Link href="/login" style={{ ...iconBtnStyle, textDecoration: "none" }}><User size={14} /></Link>
              )}
              <button onClick={() => setShowNotifBox(true)} style={iconBtnStyle}>
                <Bell size={14} />
                {notif.active && (
                  <span style={{
                    position: "absolute", top: 6, right: 7,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#dc2626", border: "2px solid #064e3b",
                  }} />
                )}
              </button>
            </div>
          </div>

          <div style={{
            marginTop: 12, background: "#fff",
            borderRadius: 12, padding: "9px 12px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
          }}>
            <Search size={15} color="#6b7280" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder='Search "milk", "tomato"...'
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 13, fontWeight: 600, color: "#111827",
                background: "transparent", minWidth: 0, width: "100%",
              }} />
            {search ? (
              <button onClick={() => setSearch("")} style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#f3f4f6", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <X size={11} color="#6b7280" />
              </button>
            ) : (
              <Mic size={15} color="#059669" />
            )}
          </div>
        </div>

        {/* BANNER */}
        {banners.length > 0 ? (
          <Link href={banners[bannerIdx]?.link || "#"} style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              boxShadow: theme.shadow.md, position: "relative",
              width: "100%", height: 130, background: "#10b981",
            }}>
              {banners[bannerIdx]?.image && (
                <img src={banners[bannerIdx].image} alt={banners[bannerIdx].title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
              {banners.length > 1 && (
                <div style={{
                  position: "absolute", bottom: 8, left: "50%",
                  transform: "translateX(-50%)", display: "flex", gap: 4,
                }}>
                  {banners.map((_, i) => (
                    <div key={i} style={{
                      width: i === bannerIdx ? 16 : 6, height: 5,
                      borderRadius: 999,
                      background: i === bannerIdx ? "#fff" : "rgba(255,255,255,0.5)",
                    }} />
                  ))}
                </div>
              )}
            </div>
          </Link>
        ) : (
          <DefaultHero />
        )}

        {/* CATEGORY PILLS */}
        <HScroll>
          {categoryPills.map((p) => {
            const a = activePill === p.key;
            return (
              <button key={p.key} onClick={() => setActivePill(p.key)} style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px", borderRadius: 999,
                background: a ? "linear-gradient(135deg, #10b981, #059669)" : "#fff",
                color: a ? "#fff" : "#374151",
                border: `1.5px solid ${a ? "#059669" : "#e5e7eb"}`,
                fontSize: 11.5, fontWeight: 800,
                whiteSpace: "nowrap", cursor: "pointer",
                boxShadow: a ? "0 4px 10px rgba(16,185,129,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <span>{p.emoji}</span> {p.label}
              </button>
            );
          })}
        </HScroll>

      {/* ════════ SHOP GROCERIES — 3 col BIG color tiles ════════ */}
{adminCategories.length > 0 && (
  <div style={{
    background: "linear-gradient(135deg, #ecfdf5 0%, #fffbeb 100%)",
    borderRadius: 18, padding: "14px 12px",
    border: "1.5px solid #d1fae5",
    boxShadow: "0 4px 14px rgba(5,150,105,0.08)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div>
        <h3 style={{
          fontSize: 16, fontWeight: 900, color: "#064e3b",
          margin: 0, display: "flex", alignItems: "center", gap: 6,
        }}>
          🛒 Shop Groceries
        </h3>
        <p style={{ fontSize: 11, color: "#047857", margin: "3px 0 0", fontWeight: 700 }}>
          Fresh daily essentials • Tap to explore
        </p>
      </div>
      <span style={{
        fontSize: 9, fontWeight: 900, color: "#fff",
        background: "linear-gradient(135deg, #10b981, #059669)",
        padding: "4px 9px", borderRadius: 999,
        boxShadow: "0 3px 8px rgba(16,185,129,0.35)",
      }}>{adminCategories.length} TYPES</span>
    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 10,
    }}>
      {adminCategories.map((cat, idx) => {
        const palette = [
          { bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", border: "#10b981", emoji: "🥬", text: "#064e3b" },
          { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", border: "#ef4444", emoji: "🍎", text: "#7f1d1d" },
          { bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)", border: "#3b82f6", emoji: "🥛", text: "#1e3a8a" },
          { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "#f59e0b", emoji: "🛒", text: "#78350f" },
          { bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)", border: "#8b5cf6", emoji: "🌶️", text: "#4c1d95" },
          { bg: "linear-gradient(135deg, #ffedd5, #fed7aa)", border: "#f97316", emoji: "🥖", text: "#7c2d12" },
        ];
        const c = palette[idx % palette.length];
        return (
          <Link key={cat.id} href={getCategoryLink(cat)} style={{
            textDecoration: "none", color: c.text,
            display: "flex", flexDirection: "column",
            background: c.bg,
            borderRadius: 16, padding: "10px 6px 8px",
            border: `2px solid ${c.border}30`,
            boxShadow: `0 4px 12px ${c.border}25`,
            position: "relative",
            overflow: "hidden",
            minHeight: 130,
          }}>
            {/* Big emoji badge top-right */}
            <div style={{
              position: "absolute", top: 6, right: 6,
              fontSize: 18, opacity: 0.55, zIndex: 1,
            }}>{c.emoji}</div>
            {/* Category image — large */}
            <div style={{
              width: "100%", aspectRatio: "1/1",
              borderRadius: 12,
              background: "rgba(255,255,255,0.7)",
              overflow: "hidden",
              border: `2px solid #fff`,
              boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 7,
            }}>
              {cat.image ? (
                <>
                  <span style={{ fontSize: 36 }}>{c.emoji}</span>
                <img src={cat.image} alt={cat.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </>
              ) : <span style={{ fontSize: 36 }}>{c.emoji}</span>}
            </div>
            {/* Name */}
            <div style={{
              fontSize: 11.5, fontWeight: 900, lineHeight: 1.15,
              textAlign: "center",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>{cat.name}</div>
            {/* Subtle "Shop →" hint */}
            <div style={{
              fontSize: 9, fontWeight: 800, opacity: 0.7,
              textAlign: "center", marginTop: 2,
            }}>Shop →</div>
          </Link>
        );
      })}
    </div>
  </div>
)}

        {/* SEARCH RESULTS or SECTIONS */}
        {search.trim() || activePill !== "all" ? (
          <div>
            <SectionHeader title={search.trim() ? `Results (${filteredProducts.length})` : "Products"} />
            {filteredProducts.length === 0 ? (
              <EmptyCard text="Kuch nahi mila 😔" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p}
                    selectedVariants={selectedVariants} setSelectedVariants={setSelectedVariants}
                    cart={cart} addToCart={addToCart} increaseQty={increaseQty} decreaseQty={decreaseQty}
                    getCartId={getCartId} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {adminProducts.length > 0 && (
              <div>
                <SectionHeader title="🔥 Popular Picks" link="/category/all" />
                <HScroll>
                  {adminProducts.slice(0, 10).map((p) => (
                    <div key={p.id} style={{ flexShrink: 0, width: 138 }}>
                      <ProductCard product={p}
                        selectedVariants={selectedVariants} setSelectedVariants={setSelectedVariants}
                        cart={cart} addToCart={addToCart} increaseQty={increaseQty} decreaseQty={decreaseQty}
                        getCartId={getCartId} compact />
                    </div>
                  ))}
                </HScroll>
              </div>
            )}


{/* ════════ HOME SERVICES — 2 col BIG premium cards ════════ */}
<div style={{
  background: "linear-gradient(135deg, #eff6ff 0%, #fef3c7 100%)",
  borderRadius: 18, padding: "14px 12px",
  border: "1.5px solid #dbeafe",
  boxShadow: "0 4px 14px rgba(37,99,235,0.08)",
}}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <div>
      <h3 style={{
        fontSize: 16, fontWeight: 900, color: "#1e3a8a",
        margin: 0, display: "flex", alignItems: "center", gap: 6,
      }}>
        🔧 Home Services
      </h3>
      <p style={{ fontSize: 11, color: "#1d4ed8", margin: "3px 0 0", fontWeight: 700 }}>
        Trusted experts at your doorstep
      </p>
    </div>
    <span style={{
      fontSize: 9, fontWeight: 900, color: "#fff",
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      padding: "4px 9px", borderRadius: 999,
      boxShadow: "0 3px 8px rgba(59,130,246,0.35)",
    }}>VERIFIED</span>
  </div>
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  }}>
    {[
      {
        name: "AC Service", desc: "Repair & Install",
        emoji: "❄️", bg: "linear-gradient(135deg, #cffafe, #a5f3fc)",
        border: "#06b6d4", text: "#155e75", slug: "ac-service",
      },
      {
        name: "RO Water", desc: "Filter & Purifier",
        emoji: "💧", bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        border: "#3b82f6", text: "#1e3a8a", slug: "ro-water",
      },
      {
        name: "Mobile Repair", desc: "Screen & Battery",
        emoji: "📱", bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
        border: "#8b5cf6", text: "#4c1d95", slug: "mobile-repair",
      },
      {
        name: "Home Cleaning", desc: "Deep clean expert",
        emoji: "🧹", bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
        border: "#f59e0b", text: "#78350f", slug: "home-cleaning",
      },
    ].map((s) => (
      <Link key={s.slug} href={`/services?service=${s.slug}`} style={{
        textDecoration: "none", color: s.text,
        background: s.bg,
        borderRadius: 14, padding: "10px 10px 9px",
        border: `2px solid ${s.border}30`,
        boxShadow: `0 4px 12px ${s.border}25`,
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        minHeight: 92,
      }}>
        {/* Floating large emoji */}
        <div style={{
          position: "absolute", top: -10, right: -10,
          fontSize: 70, opacity: 0.18, lineHeight: 1,
          transform: "rotate(-15deg)",
        }}>{s.emoji}</div>
        {/* Foreground content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(255,255,255,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, marginBottom: 6,
            boxShadow: `0 3px 8px ${s.border}30`,
          }}>{s.emoji}</div>
          <div style={{
            fontSize: 12, fontWeight: 900, lineHeight: 1.15,
            marginBottom: 2,
          }}>{s.name}</div>
          <div style={{
            fontSize: 9.5, fontWeight: 700, opacity: 0.75,
            marginBottom: 6,
          }}>{s.desc}</div>
          <div style={{
            fontSize: 10, fontWeight: 900,
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "3px 8px", borderRadius: 999,
            background: "rgba(255,255,255,0.8)",
            color: s.border,
          }}>
            Book Now →
          </div>
        </div>
      </Link>
    ))}
  </div>
  <Link href="/services" style={{
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 12, padding: "9px 0",
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff", textDecoration: "none",
    fontSize: 12, fontWeight: 900,
    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
  }}>
    View all services <ArrowRight size={13} />
  </Link>
</div>

            {sections.map(({ category, products }) => (
              <div key={category.id}>
                <SectionHeader title={category.name} link={getCategoryLink(category)} />
                <HScroll>
                  {products.map((p) => (
                    <div key={p.id} style={{ flexShrink: 0, width: 138 }}>
                      <ProductCard product={p}
                        selectedVariants={selectedVariants} setSelectedVariants={setSelectedVariants}
                        cart={cart} addToCart={addToCart} increaseQty={increaseQty} decreaseQty={decreaseQty}
                        getCartId={getCartId} compact />
                    </div>
                  ))}
                </HScroll>
              </div>
            ))}
          </>
        )}

        {/* CONTACT */}
        <div style={{
          background: "linear-gradient(135deg, #fffbeb, #fff)",
          borderRadius: 14, padding: 12, marginTop: 4,
          display: "flex", alignItems: "center", gap: 10,
          border: "1px solid #fef3c7",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Phone size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}>Need help?</div>
            <a href="tel:9873513566" style={{
              fontSize: 13, fontWeight: 900, color: "#047857", textDecoration: "none",
            }}>📞 9873513566</a>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav cartCount={cartCount} active="home" />

      {showLocBox && (
        <Modal title="Choose Location" onClose={() => setShowLocBox(false)}>
          {["Sector 56, Noida", "Sector 62, Noida", "Sector 18, Noida", "Greater Noida", "Indirapuram"].map((l) => (
            <button key={l} onClick={() => saveLocation(l)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "12px 14px", borderRadius: 12,
              background: location === l ? "#ecfdf5" : "#fff",
              border: location === l ? "2px solid #059669" : "1px solid #e5e7eb",
              cursor: "pointer", marginBottom: 6, textAlign: "left",
            }}>
              <MapPin size={16} color="#059669" />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{l}</span>
              {location === l && <Check size={16} color="#059669" />}
            </button>
          ))}
        </Modal>
      )}

      {showNotifBox && notif.active && (
        <Modal title={notif.title || "Notification"} onClose={() => setShowNotifBox(false)}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", lineHeight: 1.6, margin: 0 }}>
            {notif.message || "New update available"}
          </p>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════ STYLES ═══════════════
const iconBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%",
  background: "rgba(255,255,255,0.2)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0, position: "relative",
  border: "none", backdropFilter: "blur(10px)",
};

// ═══════════════ HSCROLL — bleeds to phone-frame edge safely ═══════════════
function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: "calc(100% + 24px)",
      marginLeft: -12, marginRight: -12,
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
    }}>
      <div style={{
        display: "flex", gap: 8,
        padding: "2px 12px 6px",
        width: "max-content",
      }}>
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <h3 style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: 0 }}>{title}</h3>
      {link && (
        <Link href={link} style={{
          fontSize: 11, fontWeight: 800, color: "#059669",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
        }}>View all <ArrowRight size={11} /></Link>
      )}
    </div>
  );
}

function DefaultHero() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #047857, #10b981)",
      borderRadius: 16, padding: 14, color: "#fff",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 12px 28px rgba(5,150,105,0.3)",
      position: "relative", overflow: "hidden", minHeight: 92,
    }}>
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 9, fontWeight: 800, padding: "3px 8px",
          background: "rgba(255,255,255,0.25)", borderRadius: 999,
        }}>
          <Sparkles size={9} /> 100% FRESH
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 900, margin: "6px 0 2px", lineHeight: 1.1 }}>
          Fresh Fruits &<br /><span style={{ color: "#fcd34d" }}>Vegetables</span>
        </h2>
        <p style={{ fontSize: 10, opacity: 0.9, margin: "0 0 8px", fontWeight: 600 }}>
          Delivered fresh, fast, daily.
        </p>
        <Link href="/category/vegetables" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "5px 10px", borderRadius: 999,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#fff",
          textDecoration: "none", fontSize: 10.5, fontWeight: 900,
          boxShadow: "0 4px 10px rgba(245,158,11,0.4)",
        }}>
          Shop Now <ArrowRight size={10} />
        </Link>
      </div>
      <div style={{ fontSize: 56, flexShrink: 0 }}>🥬</div>
    </div>
  );
}

function ProductCard({ product, selectedVariants, setSelectedVariants, cart, addToCart, increaseQty, decreaseQty, getCartId, compact }: ProductCardProps) {
  const v = selectedVariants[product.id] || product.variants[0];
  if (!v) return null;
  const cartId = getCartId(product.id, v.id);
  const item = cart.find((i) => i.id === cartId);
  const qty = item?.quantity ?? 0;
  const price = Number(v.sellingPrice || 0);
  const mrp = getMrp(price);
  const discount = Math.round(((mrp - price) / mrp) * 100);
  const isOOS = v.stock <= 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: 7,
      border: "1px solid #f3f4f6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      position: "relative", display: "flex", flexDirection: "column",
      width: "100%", height: "100%",
    }}>
      {!isOOS && discount > 0 && (
        <div style={{
          position: "absolute", top: 6, left: 6, zIndex: 2,
          background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
          padding: "2px 6px", borderRadius: 4,
          fontSize: 8.5, fontWeight: 900,
        }}>{discount}% OFF</div>
      )}
      {isOOS && (
        <div style={{
          position: "absolute", top: 6, left: 6, zIndex: 2,
          background: "#dc2626", color: "#fff",
          padding: "2px 6px", borderRadius: 4, fontSize: 8.5, fontWeight: 900,
        }}>OUT</div>
      )}

      <div style={{
        aspectRatio: "1/1", borderRadius: 9,
        background: "linear-gradient(135deg, #fffbeb, #fff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5, opacity: isOOS ? 0.5 : 1 }} />
        ) : <span style={{ fontSize: 28 }}>🛒</span>}
      </div>

      <h4 style={{
        fontSize: 11.5, fontWeight: 800, color: "#111827",
        margin: "6px 0 1px", lineHeight: 1.25, minHeight: compact ? 14 : 28,
        display: "-webkit-box", WebkitLineClamp: compact ? 1 : 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{product.name}</h4>
      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 700, marginBottom: 3 }}>{v.weight}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
        <span style={{ fontSize: 9.5, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>₹{mrp}</span>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>₹{price}</span>
      </div>

      {product.variants.length > 1 && (
        <div style={{ display: "flex", gap: 3, marginBottom: 5, overflowX: "auto", scrollbarWidth: "none" }}>
          {product.variants.slice(0, 3).map((vr: Variant) => {
            const a = vr.id === v.id;
            return (
              <button key={vr.id} onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: vr })}
                style={{
                  flexShrink: 0, padding: "2px 5px", borderRadius: 4,
                  border: a ? "1.5px solid #059669" : "1px solid #e5e7eb",
                  background: a ? "#ecfdf5" : "#fff",
                  color: a ? "#047857" : "#6b7280",
                  fontSize: 8.5, fontWeight: 800, cursor: "pointer",
                }}>{vr.weight}</button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        {isOOS ? (
          <button disabled style={{
            width: "100%", padding: "6px 0", borderRadius: 7,
            background: "#f3f4f6", color: "#9ca3af",
            fontSize: 10.5, fontWeight: 800, cursor: "not-allowed",
          }}>OUT OF STOCK</button>
        ) : qty === 0 ? (
          <button onClick={() => addToCart({
            id: cartId, name: `${product.name} - ${v.weight}`,
            price, image: product.image,
          })}
            style={{
              width: "100%", padding: "6px 0", borderRadius: 7,
              background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
              fontSize: 10.5, fontWeight: 900, cursor: "pointer",
              boxShadow: "0 4px 10px rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
            }}>
            <Plus size={11} /> ADD
          </button>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: 7,
          }}>
            <button onClick={() => decreaseQty(cartId)} style={qtyBtnStyle}><Minus size={11} /></button>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 11 }}>{qty}</span>
            <button onClick={() => increaseQty(cartId)} style={qtyBtnStyle}><Plus size={11} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 26, height: 26, color: "#fff", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "none",
};

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 30,
      textAlign: "center", border: "1px solid #f3f4f6",
    }}>
      <div style={{ fontSize: 32, marginBottom: 6 }}>📦</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>{text}</div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 430,
        background: "#fff", borderRadius: "24px 24px 0 0",
        padding: 18, maxHeight: "75vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BottomNav({ cartCount, active }: { cartCount: number; active: string }) {
  const items = [
    { key: "home", label: "Home", icon: HomeIcon, href: "/" },
    { key: "categories", label: "Categories", icon: Grid3x3, href: "/category/all" },
   { key: "cart", label: "Cart", icon: ShoppingCart, href: "/cart", badge: cartCount > 0 ? cartCount : undefined },
    { key: "profile", label: "Profile", icon: User, href: "/profile" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid #e5e7eb",
      padding: "8px 0 12px", zIndex: 100,
      display: "flex", justifyContent: "center",
    }}>
      <div style={{
        width: "100%", maxWidth: 430,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <Link key={it.key} href={it.href} style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              padding: "6px 0", textDecoration: "none",
              color: isActive ? "#059669" : "#6b7280",
              position: "relative",
            }}>
              {isActive && (
                <div style={{
                  position: "absolute", top: 0,
                  width: 22, height: 3, borderRadius: 999,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }} />
              )}
              <div style={{ position: "relative" }}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              {it.key === "cart" && Number(it.badge) > 0 && (
                  <span style={{
                    position: "absolute", top: -5, right: -7,
                    minWidth: 15, height: 15, padding: "0 3px",
                    background: "#dc2626", color: "#fff",
                    fontSize: 9, fontWeight: 900, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1.5px solid #fff",
                  }}>{it.badge}</span>
                )}
              </div>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 900 : 700 }}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
