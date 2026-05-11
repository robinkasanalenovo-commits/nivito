"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft, Search, ShoppingCart, Plus, Minus, X,
  SlidersHorizontal, Flame, Sparkles, Package, ChevronRight,
  TrendingUp, Filter,
} from "lucide-react";
import { theme, ui } from "@/lib/theme";

type ProductVariant = {
  id: number;
  weight: string;
  sellingPrice: number;
  stock: number;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  image: string;
  category: string;
  active: boolean;
  variants: ProductVariant[];
};

type Category = {
  id: number;
  name: string;
  image?: string;
  link?: string;
  active: boolean;
};

type AdminDataResponse = {
  products?: Product[];
  categories?: Category[];
};

type SortKey = "popular" | "price_low" | "price_high" | "discount";

const SERVICE_CATEGORIES = [
  { name: "AC Service", desc: "Repair & Install", emoji: "❄️", href: "/services?service=ac-service", bg: "#cffafe", text: "#155e75" },
  { name: "RO Water", desc: "Filter & Purifier", emoji: "💧", href: "/services?service=ro-water", bg: "#dbeafe", text: "#1e3a8a" },
  { name: "Mobile Repair", desc: "Screen & Battery", emoji: "📱", href: "/services?service=mobile-repair", bg: "#ede9fe", text: "#4c1d95" },
  { name: "Home Cleaning", desc: "Deep clean expert", emoji: "🧹", href: "/services?service=home-cleaning", bg: "#fef3c7", text: "#78350f" },
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function normalizeSlug(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join("/");
  return String(value || "");
}
function getCategoryLinkSlug(category: Category) {
  const link = category.link || "";
  const parts = link.split("/").filter(Boolean);
  return parts[parts.length - 1] || slugify(category.name);
}
function getCategoryHref(category: Category) {
  return category.link?.trim() || `/category/${getCategoryLinkSlug(category)}`;
}
function isSameCategory(productCategory: string, currentSlug: string, categories: Category[]) {
  const productCategorySlug = slugify(productCategory || "General");
  if (productCategorySlug === currentSlug) return true;
  const matchedCategory = categories.find((cat) => {
    const catNameSlug = slugify(cat.name);
    const catLinkSlug = getCategoryLinkSlug(cat);
    return catNameSlug === currentSlug || catLinkSlug === currentSlug;
  });
  if (!matchedCategory) return false;
  return slugify(matchedCategory.name) === productCategorySlug;
}
function getMrp(price: number) {
  return Math.ceil(Number(price || 0) * 1.35);
}
function getDiscount(price: number) {
  const mrp = getMrp(price);
  if (!mrp) return 0;
  return Math.round(((mrp - Number(price || 0)) / mrp) * 100);
}

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = useMemo(
    () => normalizeSlug(params?.slug).toLowerCase().trim(),
    [params]
  );

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("Products");
  const [selectedVariants, setSelectedVariants] = useState<Record<number, ProductVariant>>({});
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const isCategoryOverview = slug === "all";

  useEffect(() => {
    const loadProducts = async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        const res = await fetch(`${window.location.origin}/api/admin-data`, { cache: "no-store" });
        if (!res.ok) throw new Error("Admin data API failed");
        const data: AdminDataResponse = await res.json();

        const activeCategories = (data.categories || []).filter((c) => c.active);
        setCategories(activeCategories);
        const matchedCategory = activeCategories.find(
          (c) => slugify(c.name) === slug || getCategoryLinkSlug(c) === slug
        );
        setCategoryName(
          isCategoryOverview
            ? "All Categories"
            : matchedCategory?.name ||
                slug.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()) ||
                "Products"
        );

        const filtered = (data.products || [])
          .filter((p) => p.active)
          .map((p) => ({
            ...p,
            image: p.image || "",
            category: p.category || "General",
            variants: (p.variants || []).filter((v) => v.active),
          }))
          .filter((p) => p.variants.length > 0)
          .filter((p) => isCategoryOverview || isSameCategory(p.category, slug, activeCategories));

        setProducts(filtered);
        const defaults: Record<number, ProductVariant> = {};
        filtered.forEach((p) => { defaults[p.id] = p.variants[0]; });
        setSelectedVariants(defaults);
      } catch (e) {
        console.log("Category products load error:", e);
        setProducts([]);
        setSelectedVariants({});
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    const refreshProducts = () => loadProducts(false);
    const t = window.setInterval(refreshProducts, 3000);
    window.addEventListener("focus", refreshProducts);
    window.addEventListener("pageshow", refreshProducts);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", refreshProducts);
      window.removeEventListener("pageshow", refreshProducts);
    };
  }, [isCategoryOverview, slug]);

  const visibleProducts = useMemo(() => {
    let result = [...products];
    const q = searchText.toLowerCase().trim();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));

    if (inStockOnly) {
      result = result.filter((p) => {
        const v = selectedVariants[p.id] || p.variants[0];
        return v && v.stock > 0;
      });
    }

    if (sortKey === "price_low") {
      result.sort((a, b) => {
        const pa = (selectedVariants[a.id] || a.variants[0])?.sellingPrice || 0;
        const pb = (selectedVariants[b.id] || b.variants[0])?.sellingPrice || 0;
        return pa - pb;
      });
    } else if (sortKey === "price_high") {
      result.sort((a, b) => {
        const pa = (selectedVariants[a.id] || a.variants[0])?.sellingPrice || 0;
        const pb = (selectedVariants[b.id] || b.variants[0])?.sellingPrice || 0;
        return pb - pa;
      });
    } else if (sortKey === "discount") {
      result.sort((a, b) => {
        const pa = (selectedVariants[a.id] || a.variants[0])?.sellingPrice || 0;
        const pb = (selectedVariants[b.id] || b.variants[0])?.sellingPrice || 0;
        return getDiscount(pb) - getDiscount(pa);
      });
    }
    return result;
  }, [products, searchText, selectedVariants, sortKey, inStockOnly]);

  const cartCount = useMemo(
    () => cart.reduce((t, i) => t + i.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((t, i) => t + i.price * i.quantity, 0),
    [cart]
  );

  const getCartId = (productId: number, variantId: number) =>
    productId * 1000000 + (variantId % 1000000);

  return (
    <main style={ui.page}>
      <div style={{ ...ui.phone, paddingInline: 14, paddingBottom: cartCount > 0 ? 140 : 24, gap: 12 }}>

        {/* ════════ STICKY HEADER ════════ */}
        <div style={{
          position: "sticky", top: 8, zIndex: 50,
          background: theme.primary.gradientDark,
          borderRadius: 24, padding: "14px 14px 16px",
          boxShadow: theme.primary.shadowLg, color: "#fff",
          margin: "0 -2px",
        }}>
          {/* TOP ROW */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(10px)", textDecoration: "none", color: "#fff",
              flexShrink: 0,
            }}>
              <ArrowLeft size={18} />
            </Link>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, letterSpacing: 1, textTransform: "uppercase" }}>
                Category
              </div>
              <h1 style={{
                fontSize: 19, fontWeight: 900, margin: 0, letterSpacing: -0.5,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{categoryName}</h1>
            </div>

            <Link href="/cart" style={{
              position: "relative", width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(10px)", textDecoration: "none", color: "#fff",
              flexShrink: 0,
            }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 20, height: 20, padding: "0 5px",
                  background: theme.accent[400], color: theme.gray[900],
                  fontSize: 10, fontWeight: 900, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #064e3b",
                }}>{cartCount}</span>
              )}
            </Link>
          </div>

          {!isCategoryOverview && (
            <div style={{
              marginTop: 12,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}>
              <Search size={16} color={theme.gray[500]} />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder='Search "tomato", "milk"...'
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", fontSize: 13, fontWeight: 600,
                  color: theme.gray[900],
                }}
              />
              {searchText && (
                <button onClick={() => setSearchText("")}
                  style={{
                    border: "none", background: theme.gray[100],
                    width: 22, height: 22, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: theme.gray[500],
                  }}>
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ════════ BREADCRUMB + COUNT ════════ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0, padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, fontSize: 11, color: theme.gray[600], fontWeight: 700 }}>
            <Link href="/" style={{ color: theme.gray[600], textDecoration: "none" }}>Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: theme.primary[600], minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{categoryName}</span>
          </div>
          <div style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, color: theme.gray[700], whiteSpace: "nowrap" }}>
            <Package size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
            {isCategoryOverview ? `${SERVICE_CATEGORIES.length + categories.length} categories` : `${visibleProducts.length} items`}
          </div>
        </div>

        {isCategoryOverview ? (
          <CategoryOverview categories={categories} />
        ) : (
          <>
        {/* ════════ FILTERS BAR ════════ */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          padding: "2px 4px", scrollbarWidth: "none",
        }}>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              padding: "8px 14px", borderRadius: 999,
              background: showFilters ? theme.primary.gradient : "#fff",
              color: showFilters ? "#fff" : theme.gray[700],
              border: `1.5px solid ${showFilters ? theme.primary[600] : theme.gray[200]}`,
              fontSize: 12, fontWeight: 800, cursor: "pointer",
              boxShadow: theme.shadow.sm,
            }}>
            <SlidersHorizontal size={13} />
            Sort & Filter
          </button>

          <FilterChip active={inStockOnly} onClick={() => setInStockOnly(!inStockOnly)}
            icon={<Sparkles size={12} />} label="In Stock" />
          <FilterChip active={sortKey === "discount"} onClick={() => setSortKey(sortKey === "discount" ? "popular" : "discount")}
            icon={<Flame size={12} />} label="Top Discount" />
          <FilterChip active={sortKey === "price_low"} onClick={() => setSortKey(sortKey === "price_low" ? "popular" : "price_low")}
            icon={<TrendingUp size={12} style={{ transform: "rotate(180deg)" }} />} label="Price: Low" />
          <FilterChip active={sortKey === "price_high"} onClick={() => setSortKey(sortKey === "price_high" ? "popular" : "price_high")}
            icon={<TrendingUp size={12} />} label="Price: High" />
        </div>

        {/* ════════ SORT MENU (expandable) ════════ */}
        {showFilters && (
          <div style={{ ...ui.card, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: theme.gray[500], textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              <Filter size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} /> Sort By
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { k: "popular" as SortKey, label: "🔥 Popular" },
                { k: "price_low" as SortKey, label: "💰 Price: Low to High" },
                { k: "price_high" as SortKey, label: "💎 Price: High to Low" },
                { k: "discount" as SortKey, label: "🎁 Highest Discount" },
              ].map((opt) => (
                <button key={opt.k} onClick={() => setSortKey(opt.k)}
                  style={{
                    padding: "10px 12px", borderRadius: 10,
                    border: sortKey === opt.k ? `2px solid ${theme.primary[600]}` : `1px solid ${theme.gray[200]}`,
                    background: sortKey === opt.k ? theme.primary[50] : "#fff",
                    color: sortKey === opt.k ? theme.primary[700] : theme.gray[700],
                    fontWeight: 700, fontSize: 13, textAlign: "left", cursor: "pointer",
                  }}>{opt.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ════════ PRODUCTS GRID ════════ */}
        {loading ? (
          <SkeletonGrid />
        ) : visibleProducts.length === 0 ? (
          <EmptyState searchText={searchText} categoryName={categoryName} />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}>
            {visibleProducts.map((product, idx) => {
              const selectedVariant = selectedVariants[product.id] || product.variants[0];
              if (!selectedVariant) return null;

              const cartId = getCartId(product.id, selectedVariant.id);
              const cartItem = cart.find((i) => i.id === cartId);
              const qty = cartItem?.quantity ?? 0;
              const price = Number(selectedVariant.sellingPrice || 0);
              const mrp = getMrp(price);
              const discount = getDiscount(price);
              const isOutOfStock = selectedVariant.stock <= 0;
              const isLowStock = !isOutOfStock && selectedVariant.stock <= 5;
              const isBestseller = idx < 2 && !isOutOfStock;

              return (
                <div key={product.id} style={{
                  ...ui.card, padding: 8, position: "relative",
                  transition: "all 0.2s ease",
                  display: "flex", flexDirection: "column",
                }}>
                  {/* TOP-LEFT BADGES */}
                  <div style={{
                    position: "absolute", top: 8, left: 8, zIndex: 5,
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    {isOutOfStock ? (
                      <span style={{
                        background: theme.danger[600], color: "#fff",
                        padding: "3px 8px", borderRadius: 6,
                        fontSize: 9, fontWeight: 900, letterSpacing: 0.5,
                      }}>OUT OF STOCK</span>
                    ) : discount > 0 ? (
                      <span style={{
                        background: theme.primary.gradient, color: "#fff",
                        padding: "3px 8px", borderRadius: 6,
                        fontSize: 9, fontWeight: 900, letterSpacing: 0.5,
                        boxShadow: "0 2px 6px rgba(16,185,129,0.4)",
                      }}>{discount}% OFF</span>
                    ) : null}
                    {isBestseller && (
                      <span style={{
                        background: theme.accent.gradient, color: "#fff",
                        padding: "3px 8px", borderRadius: 6,
                        fontSize: 9, fontWeight: 900, letterSpacing: 0.5,
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <Flame size={9} /> HOT
                      </span>
                    )}
                  </div>

                  {/* TOP-RIGHT BADGE */}
                  {isLowStock && (
                    <div style={{
                      position: "absolute", top: 8, right: 8, zIndex: 5,
                      background: "#fff7ed", color: "#c2410c",
                      padding: "3px 7px", borderRadius: 6,
                      fontSize: 9, fontWeight: 900, border: "1px solid #fed7aa",
                    }}>
                      Only {selectedVariant.stock} left
                    </div>
                  )}

                  {/* IMAGE */}
                  <div style={{
                    aspectRatio: "1/1", borderRadius: 12,
                    background: `linear-gradient(135deg, ${theme.accent[50]}, #fff)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative",
                    border: `1px solid ${theme.gray[100]}`,
                  }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        style={{
                          width: "100%", height: "100%", objectFit: "contain", padding: 8,
                          opacity: isOutOfStock ? 0.4 : 1,
                          filter: isOutOfStock ? "grayscale(100%)" : "none",
                        }} />
                    ) : <span style={{ fontSize: 48 }}>🛒</span>}

                    {isOutOfStock && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "repeating-linear-gradient(45deg, rgba(220,38,38,0.05) 0 10px, rgba(220,38,38,0.1) 10px 20px)",
                      }} />
                    )}
                  </div>

                  {/* NAME */}
                  <h3 style={{
                    fontSize: 12.5, fontWeight: 800, color: theme.gray[900],
                    margin: "8px 0 0", lineHeight: 1.3, minHeight: 32,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>{product.name}</h3>

                  {/* VARIANT PILLS */}
                  {product.variants.length > 1 ? (
                    <div style={{
                      display: "flex", gap: 4, marginTop: 6,
                      overflowX: "auto", scrollbarWidth: "none",
                    }}>
                      {product.variants.map((v) => {
                        const active = v.id === selectedVariant.id;
                        return (
                          <button key={v.id}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: v })}
                            style={{
                              flexShrink: 0,
                              padding: "4px 8px", borderRadius: 6,
                              border: active ? `1.5px solid ${theme.primary[600]}` : `1px solid ${theme.gray[200]}`,
                              background: active ? theme.primary[50] : "#fff",
                              color: active ? theme.primary[700] : theme.gray[600],
                              fontSize: 10, fontWeight: 800, cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}>
                            {v.weight}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: 6, fontSize: 10, fontWeight: 700,
                      color: theme.gray[500],
                    }}>{selectedVariant.weight}</div>
                  )}

                  {/* PRICE + ACTION */}
                  <div style={{
                    marginTop: "auto", paddingTop: 8,
                    display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6,
                  }}>
                    <div>
                      {discount > 0 && (
                        <div style={{
                          fontSize: 10, color: theme.gray[400],
                          textDecoration: "line-through", fontWeight: 600, lineHeight: 1,
                        }}>₹{mrp}</div>
                      )}
                      <div style={{
                        fontSize: 16, fontWeight: 900, color: theme.gray[900], lineHeight: 1.2,
                      }}>₹{price}</div>
                    </div>

                    {isOutOfStock ? (
                      <button disabled style={{
                        padding: "7px 12px", borderRadius: 8,
                        background: theme.gray[100], color: theme.gray[400],
                        fontSize: 11, fontWeight: 800, border: "none",
                        cursor: "not-allowed",
                      }}>OUT</button>
                    ) : qty === 0 ? (
                      <button onClick={() => addToCart({
                        id: cartId,
                        name: `${product.name} - ${selectedVariant.weight}`,
                        price, image: product.image,
                      })}
                        style={{
                          padding: "7px 14px", borderRadius: 8,
                          background: theme.primary.gradient, color: "#fff",
                          fontSize: 11, fontWeight: 900, border: "none",
                          cursor: "pointer", boxShadow: theme.primary.shadow,
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                        <Plus size={12} /> ADD
                      </button>
                    ) : (
                      <div style={{
                        display: "flex", alignItems: "center",
                        background: theme.primary.gradient,
                        borderRadius: 8, overflow: "hidden",
                        boxShadow: theme.primary.shadow,
                      }}>
                        <button onClick={() => decreaseQty(cartId)}
                          style={{
                            width: 26, height: 28, border: "none", background: "transparent",
                            color: "#fff", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}><Minus size={12} /></button>
                        <span style={{
                          color: "#fff", fontWeight: 900, fontSize: 12,
                          minWidth: 20, textAlign: "center",
                        }}>{qty}</span>
                        <button onClick={() => increaseQty(cartId)}
                          style={{
                            width: 26, height: 28, border: "none", background: "transparent",
                            color: "#fff", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}><Plus size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {/* ════════ FLOATING CART BAR ════════ */}
      {cartCount > 0 && (
        <div style={{
          position: "fixed",
bottom: "calc(34px + env(safe-area-inset-bottom))",
left: 0,
right: 0,

          boxSizing: "border-box",
          padding: "0 14px", zIndex: 100,
          animation: "slideUp 0.3s ease",
        }}>
          <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", boxSizing: "border-box" }}>
            <Link href="/cart" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: theme.primary.gradient, color: "#fff",
              padding: "12px 18px", borderRadius: 16,
              boxShadow: "0 16px 40px rgba(5,150,105,0.45)",
              textDecoration: "none",
              minWidth: 0,
              boxSizing: "border-box",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <ShoppingCart size={18} />
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    minWidth: 18, height: 18, padding: "0 4px",
                    background: theme.accent[400], color: theme.gray[900],
                    fontSize: 10, fontWeight: 900, borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #047857",
                  }}>{cartCount}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>₹{cartTotal}</div>
                  <div style={{ fontSize: 10, opacity: 0.9, fontWeight: 600 }}>
                    {cartCount} {cartCount === 1 ? "item" : "items"} added
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontWeight: 900, fontSize: 13 }}>
                View Cart <ChevronRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}

// ═══════════ SUB COMPONENTS ═══════════

function CategoryOverview({ categories }: { categories: Category[] }) {
  const groceryPalette = [
    { bg: "#d1fae5", text: "#064e3b", emoji: "🥬" },
    { bg: "#fee2e2", text: "#7f1d1d", emoji: "🍎" },
    { bg: "#dbeafe", text: "#1e3a8a", emoji: "🥛" },
    { bg: "#fef3c7", text: "#78350f", emoji: "🛒" },
  ];

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      <div style={{
        background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
        border: "1px solid #dbeafe",
        borderRadius: 18,
        padding: 14,
        boxShadow: theme.shadow.sm,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0, marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#1e3a8a", margin: 0 }}>🔧 Home Services</h2>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", margin: "3px 0 0" }}>Quick help for home needs</p>
          </div>
          <span style={{
            flexShrink: 0,
            fontSize: 9,
            fontWeight: 900,
            color: "#fff",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            padding: "4px 9px",
            borderRadius: 999,
          }}>SERVICES</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {SERVICE_CATEGORIES.map((service) => (
            <Link key={service.name} href={service.href} style={{
              minHeight: 74,
              minWidth: 0,
              boxSizing: "border-box",
              overflow: "hidden",
              borderRadius: 14,
              padding: 10,
              background: service.bg,
              color: service.text,
              textDecoration: "none",
              display: "flex",
              gap: 8,
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.8)",
            }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}>{service.emoji}</span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 12, lineHeight: 1.15, overflowWrap: "anywhere" }}>{service.name}</strong>
                <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, lineHeight: 1.15, opacity: 0.78, marginTop: 2, overflowWrap: "anywhere" }}>{service.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #ecfdf5, #fffbeb)",
        border: "1px solid #d1fae5",
        borderRadius: 18,
        padding: 14,
        boxShadow: theme.shadow.sm,
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0, marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#064e3b", margin: 0 }}>🛒 Shop Groceries</h2>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#047857", margin: "3px 0 0" }}>Fresh daily essentials</p>
          </div>
          <span style={{
            flexShrink: 0,
            fontSize: 9,
            fontWeight: 900,
            color: "#fff",
            background: theme.primary.gradient,
            padding: "4px 9px",
            borderRadius: 999,
          }}>{categories.length} TYPES</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {categories.map((category, idx) => {
            const c = groceryPalette[idx % groceryPalette.length];
            return (
              <Link key={category.id} href={getCategoryHref(category)} style={{
                minHeight: 118,
                minWidth: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                borderRadius: 14,
                padding: "8px 6px",
                background: c.bg,
                color: c.text,
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.8)",
              }}>
                <span style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.72)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  fontSize: 30,
                }}>
                  {category.image ? (
                    <img src={category.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : c.emoji}
                </span>
                <strong style={{
                  fontSize: 11,
                  lineHeight: 1.15,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>{category.name}</strong>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
        padding: "8px 12px", borderRadius: 999,
        background: active ? theme.primary[600] : "#fff",
        color: active ? "#fff" : theme.gray[700],
        border: `1.5px solid ${active ? theme.primary[600] : theme.gray[200]}`,
        fontSize: 11, fontWeight: 800, cursor: "pointer",
        boxShadow: theme.shadow.sm, whiteSpace: "nowrap",
      }}>
      {icon} {label}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ ...ui.card, padding: 8 }}>
          <div style={{
            aspectRatio: "1/1", background: theme.gray[100],
            borderRadius: 12, animation: "pulse 1.5s infinite",
          }} />
          <div style={{
            height: 12, marginTop: 8, background: theme.gray[100],
            borderRadius: 4, animation: "pulse 1.5s infinite",
          }} />
          <div style={{
            height: 10, marginTop: 6, width: "60%", background: theme.gray[100],
            borderRadius: 4, animation: "pulse 1.5s infinite",
          }} />
          <div style={{
            height: 28, marginTop: 10, background: theme.gray[100],
            borderRadius: 8, animation: "pulse 1.5s infinite",
          }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searchText, categoryName }: { searchText: string; categoryName: string }) {
  return (
    <div style={{
      ...ui.card, padding: "50px 24px", textAlign: "center", marginTop: 20,
    }}>
      <div style={{
        width: 90, height: 90, margin: "0 auto 16px",
        borderRadius: "50%", background: theme.accent.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 30px rgba(245,158,11,0.3)",
      }}>
        <Package size={42} color="#fff" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 6px", color: theme.gray[900] }}>
        {searchText ? "Kuch nahi mila 😔" : "Coming soon!"}
      </h3>
      <p style={{ fontSize: 13, color: theme.gray[500], margin: "0 0 18px", fontWeight: 600 }}>
        {searchText
          ? `"${searchText}" ke liye products available nahi hain`
          : `${categoryName} mein abhi koi product nahi hai`}
      </p>
      <Link href="/" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 18px", borderRadius: 12,
        background: theme.primary.gradient, color: "#fff",
        textDecoration: "none", fontSize: 13, fontWeight: 800,
        boxShadow: theme.primary.shadow,
      }}>
        <Sparkles size={14} /> Browse Home
      </Link>
    </div>
  );
}
