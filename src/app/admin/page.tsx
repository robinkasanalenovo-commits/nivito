"use client";

import { useEffect, useState } from "react";

type BannerType = {
  id: number;
  title: string;
  image: string;
  link: string;
  active: boolean;
};

type CategoryType = {
  id: number;
  name: string;
  image: string;
  link: string;
  active: boolean;
  order: number;
};

type ProductVariantType = {
  id: number;
  weight: string;
  sellingPrice: number;
  stock: number;
  active: boolean;
};

type ProductType = {
  id: number;
  name: string;
  image: string;
  category: string;
  active: boolean;
  variants: ProductVariantType[];
};
type OrderItemType = {
  id: number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
};

type OrderType = {
  id: number;
  orderId: string;
  customerName: string;
  customerMobile: string;
  address: string;
  items: OrderItemType[];
  itemTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

type NotificationSettingsType = {
  title: string;
  message: string;
  active: boolean;
  showPopup: boolean;
  updatedAt: number;
};

type UnitType = "weight" | "pcs";
type AutoVariantKey = "100g" | "250g" | "500g" | "1kg" | "2kg" | "5kg" | "1pc" | "2pc" | "3pc"| "4pc" | "5pc" | "6pc"| "7pc" | "8pc" | "9pc"| "10pc" | "11pc" | "12pc";
type PriceMode = "auto" | "manual";

const tabs = ["Dashboard", "Categories", "Products", "Orders", "Customers", "Settings"];

const weightOptions = ["100g", "250g", "500g", "1kg", "2kg", "5kg", "10kg", "1pc", "2pc", "3pc", "4pc", "5pc", "6pc", "7pc", "8pc", "9pc", "10pc", "11pc", "12pc"];

const autoVariantOptions: {
  key: AutoVariantKey;
  label: string;
  multiplier: number;
  unitType: UnitType;
}[] = [
  { key: "100g", label: "100g", multiplier: 0.1, unitType: "weight" },
  { key: "250g", label: "250g", multiplier: 0.25, unitType: "weight" },
  { key: "500g", label: "500g", multiplier: 0.5, unitType: "weight" },
  { key: "1kg", label: "1kg", multiplier: 1, unitType: "weight" },
  { key: "2kg", label: "2kg", multiplier: 2, unitType: "weight" },
  { key: "5kg", label: "5kg", multiplier: 5, unitType: "weight" },
  { key: "1pc", label: "1pc", multiplier: 1, unitType: "pcs" },
  { key: "2pc", label: "2pc", multiplier: 2, unitType: "pcs" },
  { key: "4pc", label: "4pc", multiplier: 4, unitType: "pcs" },
];

const defaultNotificationSettings: NotificationSettingsType = {
  title: "",
  message: "",
  active: true,
  showPopup: true,
  updatedAt: 0,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [notificationForm, setNotificationForm] = useState<NotificationSettingsType>(
    defaultNotificationSettings
  );

  const [bannerForm, setBannerForm] = useState({
    title: "",
    image: "",
    link: "",
    active: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: "",
    link: "",
    active: true,
    order: 1,
  });

  const [productForm, setProductForm] = useState({
  name: "",
  image: "",
  category: "",
  basePrice: "",
  stock: "",
  active: true,
  unitType: "weight" as UnitType,
  priceMode: "auto" as PriceMode,
  variants: {
    "100g": false,
    "250g": true,
    "500g": true,
    "1kg": true,
    "2kg": false,
    "5kg": false,
    "1pc": true,
    "2pc": false,
    "4pc": false,
  } as Record<AutoVariantKey, boolean>,
  variantPrices: {
    "100g": "",
    "250g": "",
    "500g": "",
    "1kg": "",
    "2kg": "",
    "5kg": "",
    "1pc": "",
    "2pc": "",
    "4pc": "",
  } as Record<AutoVariantKey, string>,
});

  const [variantForms, setVariantForms] = useState<
    Record<number, { weight: string; sellingPrice: string; stock: string; active: boolean }>
  >({});

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [openProductId, setOpenProductId] = useState<number | null>(null);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const normalizeProducts = (items: any[]): ProductType[] => {
    return (items || []).map((item) => {
      if (Array.isArray(item.variants)) {
        return {
          id: item.id,
          name: item.name || "",
          image: item.image || "",
          category: item.category || "General",
          active: item.active ?? true,
          variants: item.variants || [],
        };
      }

      return {
        id: item.id,
        name: item.name || "",
        image: item.image || "",
        category: item.category || "General",
        active: item.active ?? true,
        variants: item.sellingPrice
          ? [
              {
                id: Date.now() + Number(item.id || 0),
                weight: item.weight || "1kg",
                sellingPrice: Number(item.sellingPrice || 0),
                stock: Number(item.stock || 0),
                active: true,
              },
            ]
          : [],
      };
    });
  };

  const loadData = async () => {
    const res = await fetch("/api/admin-data", { cache: "no-store" });
    const data = await res.json();
    setBanners(data.banners || []);
    setCategories(data.categories || []);
    setProducts(normalizeProducts(data.products || []));
    setOrders(data.orders || []);
    setNotificationForm({
      ...defaultNotificationSettings,
      ...(data.notificationSettings || {}),
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (newData: {
    banners: BannerType[];
    categories: CategoryType[];
    products: ProductType[];
    orders?: OrderType[];
    notificationSettings?: NotificationSettingsType;
  }) => {
    await fetch("/api/admin-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newData,
        orders: newData.orders ?? orders,
        notificationSettings:
          newData.notificationSettings || notificationForm || defaultNotificationSettings,
      }),
    });

    loadData();
  };

 const saveNotificationSettings = async () => {
  const updatedNotification: NotificationSettingsType = {
    ...notificationForm,
    title: notificationForm.title.trim(),
    message: notificationForm.message.trim(),
    updatedAt: Date.now(),
    active: notificationForm.active,
    showPopup: notificationForm.showPopup,
  };

  // 🔥 Direct API call (force save)
  await fetch("/api/admin-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      banners,
      categories,
      products,
      orders,
      notificationSettings: updatedNotification,
    }),
  });

  setNotificationForm(updatedNotification);

  alert("Notification save हो गई ✅");
};

  const addBanner = async () => {
    if (!bannerForm.image.trim()) {
      alert("Banner image URL डालो");
      return;
    }

    const newBanner: BannerType = {
      id: Date.now(),
      title: bannerForm.title || "Banner",
      image: bannerForm.image,
      link: bannerForm.link || "#",
      active: bannerForm.active,
    };

    await saveData({
      banners: [...banners, newBanner],
      categories,
      products,
    });

    setBannerForm({
      title: "",
      image: "",
      link: "",
      active: true,
    });

    alert("Banner save हो गया ✅");
  };

  const addCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Category name डालो");
      return;
    }

    const slug = categoryForm.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newCategory: CategoryType = {
      id: Date.now(),
      name: categoryForm.name,
      image: categoryForm.image,
      link: categoryForm.link || `/category/${slug}`,
      active: categoryForm.active,
      order: Number(categoryForm.order || categories.length + 1),
    };

    await saveData({
      banners,
      categories: [...categories, newCategory],
      products,
    });

    setCategoryForm({
      name: "",
      image: "",
      link: "",
      active: true,
      order: categories.length + 2,
    });

    alert("Category save हो गई ✅");
  };

  const addProduct = async () => {
    if (!productForm.name.trim()) {
      alert("Product name डालो");
      return;
    }

    if (!productForm.basePrice.trim()) {
      alert(productForm.unitType === "pcs" ? "Base Price डालो, जैसे 1pc Nariyal ₹50" : "Base Price डालो, जैसे 1kg Bhindi ₹30");
      return;
    }

    const basePrice = Number(productForm.basePrice || 0);

    if (basePrice <= 0) {
      alert("Base Price 0 से ज्यादा होना चाहिए");
      return;
    }

    const selectedVariants = autoVariantOptions.filter(
      (item) => item.unitType === productForm.unitType && productForm.variants[item.key]
    );

    if (selectedVariants.length === 0) {
      alert("कम से कम 1 variant select करो");
      return;
    }

    const baseTime = Date.now();

    const autoVariants: ProductVariantType[] = selectedVariants.map((item, index) => {
      const autoPrice = Math.round(basePrice * item.multiplier);
      const manualPrice = Number(productForm.variantPrices[item.key] || 0);

      return {
        id: baseTime + index,
        weight: item.label,
        sellingPrice:
          productForm.priceMode === "manual" && manualPrice > 0
            ? manualPrice
            : autoPrice,
        stock: Number(productForm.stock || 0),
        active: true,
      };
    });

    const newProduct: ProductType = {
      id: Date.now(),
      name: productForm.name,
      image: productForm.image,
      category: productForm.category || "General",
      active: productForm.active,
      variants: autoVariants,
    };

    await saveData({
      banners,
      categories,
      products: [newProduct, ...products],
    });

    setProductForm({
      name: "",
      image: "",
      category: "",
      basePrice: "",
      stock: "",
      active: true,
      unitType: "weight" as UnitType,
      priceMode: "auto" as PriceMode,
         variants: {
  "100g": false,
  "250g": true,
  "500g": true,
  "1kg": true,
  "2kg": false,
  "5kg": false,
  "1pc": false,
  "2pc": false,
  "3pc": false,
  "4pc": false,
  "5pc": false,
  "6pc": false,
  "7pc": false,
  "8pc": false,
  "9pc": false,
  "10pc": false,
  "11pc": false,
  "12pc": false,

      },
      variantPrices: {
         "100g": "",
  "250g": "",
  "500g": "",
  "1kg": "",
  "2kg": "",
  "5kg": "",
  "1pc": "",
  "2pc": "",
  "3pc": "",
  "4pc": "",
  "5pc": "",
  "6pc": "",
  "7pc": "",
  "8pc": "",
  "9pc": "",
  "10pc": "",
  "11pc": "",
  "12pc": "",






      },
    });

    alert("Product save हो गया ✅ variants auto बन गए");
  };

  const addVariant = async (productId: number) => {
    const form = variantForms[productId] || {
      weight: "1kg",
      sellingPrice: "",
      stock: "",
      active: true,
    };

    if (!form.sellingPrice.trim()) {
      alert("Variant selling price डालो");
      return;
    }

    const newVariant: ProductVariantType = {
      id: Date.now(),
      weight: form.weight || "1kg",
      sellingPrice: Number(form.sellingPrice || 0),
      stock: Number(form.stock || 0),
      active: form.active,
    };

    await saveData({
      banners,
      categories,
      products: products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: [...(product.variants || []), newVariant],
            }
          : product
      ),
    });

    setVariantForms({
      ...variantForms,
      [productId]: {
        weight: "1kg",
        sellingPrice: "",
        stock: "",
        active: true,
      },
    });

    alert("Variant save हो गया ✅");
  };

  const deleteBanner = async (id: number) => {
    if (!confirm("Banner delete करना है?")) return;

    await saveData({
      banners: banners.filter((item) => item.id !== id),
      categories,
      products,
    });
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Category delete करनी है?")) return;

    const filtered = categories.filter((item) => item.id !== id);
    const reordered = filtered
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));

    await saveData({
      banners,
      categories: reordered,
      products,
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Product delete करना है?")) return;

    await saveData({
      banners,
      categories,
      products: products.filter((item) => item.id !== id),
    });
  };

  const deleteVariant = async (productId: number, variantId: number) => {
    if (!confirm("Variant delete करना है?")) return;

    await saveData({
      banners,
      categories,
      products: products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.filter((variant) => variant.id !== variantId),
            }
          : product
      ),
    });
  };

  const toggleBanner = async (id: number) => {
    await saveData({
      banners: banners.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
      categories,
      products,
    });
  };

  const toggleCategory = async (id: number) => {
    await saveData({
      banners,
      categories: categories.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
      products,
    });
  };

  const toggleProduct = async (id: number) => {
    await saveData({
      banners,
      categories,
      products: products.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    });
  };

  const toggleVariant = async (productId: number, variantId: number) => {
    await saveData({
      banners,
      categories,
      products: products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId
                  ? { ...variant, active: !variant.active }
                  : variant
              ),
            }
          : product
      ),
    });
  };

  const moveCategoryUp = async (id: number) => {
    const sorted = [...categories].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    const index = sorted.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const updated = [...sorted];
    [updated[index - 1], updated[index]] = [
      updated[index],
      updated[index - 1],
    ];

    const reordered = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    await saveData({
      banners,
      categories: reordered,
      products,
    });
  };

  const moveCategoryDown = async (id: number) => {
    const sorted = [...categories].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1 || index >= sorted.length - 1) return;

    const updated = [...sorted];
    [updated[index], updated[index + 1]] = [
      updated[index + 1],
      updated[index],
    ];

    const reordered = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    await saveData({
      banners,
      categories: reordered,
      products,
    });
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, orderStatus: status } : order
    );

    await saveData({
      banners,
      categories,
      products,
      orders: updatedOrders,
    });
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Order delete करना है?")) return;

    await saveData({
      banners,
      categories,
      products,
      orders: orders.filter((order) => order.id !== orderId),
    });
  };

  const previewBasePrice = Number(productForm.basePrice || 0);

  return (
   <main className="min-h-screen bg-[#f7faf7] text-[#111827]">
      <header className="bg-gradient-to-r from-[#1263ff] to-[#5b22d6] px-4 py-5 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-white/90">Nivito Management</p>
          </div>

<button className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm active:scale-95 transition-all">            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <section className="rounded-[24px] bg-white/70 p-3 shadow-sm ring-1 ring-black/5">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-2 py-2 text-[11px] font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                  tab === "Settings" ? "col-span-4 mx-auto w-[120px]" : ""
                } ${
                  activeTab === tab
                    ? "bg-white text-[#111827] shadow-md"
                    : "text-gray-500 hover:bg-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "Dashboard" && (
          <section className="mt-4 rounded-[24px] bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold text-gray-900">
              Welcome to Admin Panel
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              ऊपर से Categories, Products, Orders, Customers या Settings select करके manage करें।
            </p>
          </section>
        )}

        {activeTab === "Categories" && (
          <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold">Shop by Category Manage</h2>

            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <input
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Category Name"
                className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />

              <input
                value={categoryForm.image}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, image: e.target.value })
                }
                placeholder="Category Image URL"
                className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />

              <input
                value={categoryForm.link}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, link: e.target.value })
                }
                placeholder="/vegetables"
                className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />

              <input
                type="number"
                value={categoryForm.order}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    order: Number(e.target.value),
                  })
                }
                placeholder="Order"
                className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={addCategory}
              className="mt-4 w-full rounded-xl bg-green-600 py-3 text-base font-bold text-white shadow-md transition active:scale-95 md:w-auto md:px-8"
            >
              Save Category
            </button>

            <div className="mt-4 grid gap-3">
              {[...categories]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((item, index, array) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-3 md:flex-1">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">
                        {index + 1}
                      </div>

                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-extrabold">{item.name}</h3>
                        <p className="truncate text-xs text-gray-500">
                          {item.link}
                        </p>
                        <p className="text-xs text-gray-500">
                          Position: {index + 1} ·{" "}
                          {item.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 md:flex md:flex-shrink-0">
                      <button
                        onClick={() => moveCategoryUp(item.id)}
                        disabled={index === 0}
                        className={`rounded-full px-3 py-2 text-xs font-bold ${
                          index === 0
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        ↑ Up
                      </button>

                      <button
                        onClick={() => moveCategoryDown(item.id)}
                        disabled={index === array.length - 1}
                        className={`rounded-full px-3 py-2 text-xs font-bold ${
                          index === array.length - 1
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        ↓ Down
                      </button>

                      <button
                        onClick={() => toggleCategory(item.id)}
                        className="rounded-full bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                      >
                        {item.active ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => deleteCategory(item.id)}
                        className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === "Products" && (
          <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Products Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                  100+ products को आसानी से manage करने के लिए compact list view.
                </p>
              </div>

              <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                {products.length} Products
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <h3 className="text-base font-extrabold">Add New Product</h3>
              <p className="mt-1 text-xs font-semibold text-gray-500">
  1kg base price डालो — 250g, 500g, 1kg, 2kg, 5kg auto sync होंगे। Manual mode में हर variant का अलग price भी डाल सकते हो।
</p>

{/* 🔥 UNIT SELECT (IMPORTANT) */}
<div className="mt-4 flex gap-2">
  <button
    type="button"
    onClick={() => setProductForm({ ...productForm, unitType: "weight" })}
    className={`rounded-xl px-4 py-2 text-xs font-extrabold ${
      productForm.unitType === "weight"
        ? "bg-green-600 text-white"
        : "bg-white text-gray-700 ring-1 ring-gray-200"
    }`}
  >
    Weight
  </button>

  <button
    type="button"
    onClick={() => setProductForm({ ...productForm, unitType: "pcs" })}
    className={`rounded-xl px-4 py-2 text-xs font-extrabold ${
      productForm.unitType === "pcs"
        ? "bg-blue-600 text-white"
        : "bg-white text-gray-700 ring-1 ring-gray-200"
    }`}
  >
    PCS
  </button>
</div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="Product Name"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  value={productForm.image}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image: e.target.value })
                  }
                  placeholder="Product Image URL"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                />

                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option value="">Select Category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  <option value="General">General</option>
                </select>

                <input
                  type="number"
                  value={productForm.basePrice}
                  onChange={(e) =>
                    setProductForm({ ...productForm, basePrice: e.target.value })
                  }
                  placeholder={productForm.unitType === "pcs" ? "Base Price 1pc" : "Base Price 1kg"}
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                  placeholder="Stock Qty"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                />

                <div className="rounded-2xl border border-gray-300 bg-white p-3 md:col-span-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-gray-700">
                        Variants Select करें
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-gray-500">
                        {productForm.unitType === "pcs" ? "Auto mode में 1pc price से 2pc/4pc sync होगा।" : "Auto mode में 1kg price से सब sync होगा।"} Manual mode में हर variant का अलग price डाल सकते हो।
                      </p>
                    </div>

                    <div className="flex rounded-full bg-gray-100 p-1 text-xs font-extrabold ring-1 ring-black/5">
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, priceMode: "auto" })}
                        className={`rounded-full px-4 py-2 transition ${
                          productForm.priceMode === "auto"
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Auto Price
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, priceMode: "manual" })}
                        className={`rounded-full px-4 py-2 transition ${
                          productForm.priceMode === "manual"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Manual Price
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {autoVariantOptions.filter((item) => item.unitType === productForm.unitType).map((item) => {
                      const autoPrice = previewBasePrice
                        ? Math.round(previewBasePrice * item.multiplier)
                        : 0;
                      const selected = productForm.variants[item.key];

                      return (
                        <div
                          key={item.key}
                          className={`rounded-2xl p-3 ring-1 transition ${
                            selected
                              ? "bg-green-50 ring-green-200"
                              : "bg-gray-50 ring-gray-200"
                          }`}
                        >
                          <label className="flex cursor-pointer items-center justify-between gap-2">
                            <span className="text-sm font-extrabold text-gray-900">
                              {item.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setProductForm({
                                  ...productForm,
                                  variants: {
                                    ...productForm.variants,
                                    [item.key]: !productForm.variants[item.key],
                                  },
                                })
                              }
                            />
                          </label>

                          {productForm.priceMode === "manual" ? (
                            <input
                              type="number"
                              value={productForm.variantPrices[item.key]}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  variantPrices: {
                                    ...productForm.variantPrices,
                                    [item.key]: e.target.value,
                                  },
                                })
                              }
                              placeholder={autoPrice > 0 ? `₹${autoPrice}` : "Price"}
                              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600 disabled:bg-gray-100"
                              disabled={!selected}
                            />
                          ) : (
                            <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-green-700 ring-1 ring-green-100">
                              {autoPrice > 0 ? `₹${autoPrice}` : "₹0"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={addProduct}
                  className="rounded-2xl bg-green-600 px-4 py-3 font-extrabold text-white shadow-md transition active:scale-95 md:col-span-1"
                >
                  Save Product
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product..."
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-600"
              >
                <option value="All">All Categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
                <option value="General">General</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              {products.length === 0 && (
                <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500 ring-1 ring-black/5">
                  अभी कोई product add नहीं है।
                </div>
              )}

              {products
                .filter((product) =>
                  product.name
                    .toLowerCase()
                    .includes(productSearch.toLowerCase().trim())
                )
                .filter((product) =>
                  productCategoryFilter === "All"
                    ? true
                    : product.category === productCategoryFilter
                )
                .map((product) => {
                  const isOpen = openProductId === product.id;
                  const mainVariant = product.variants?.[0];
                  const form = variantForms[product.id] || {
                    weight: "1kg",
                    sellingPrice: "",
                    stock: "",
                    active: true,
                  };

                  return (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
                    >
                      <div className="flex items-center gap-3 p-3 md:p-4">
                        <div
  style={{
    width: 56,
    height: 56,
    minWidth: 56,
    maxWidth: 56,
    minHeight: 56,
    maxHeight: 56,
    borderRadius: 14,
    background: "#ffffff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    flexShrink: 0,
  }}
>
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      style={{
        width: 44,
        height: 44,
        maxWidth: 44,
        maxHeight: 44,
        objectFit: "contain",
        display: "block",
      }}
    />
  ) : (
    <span style={{ fontSize: 20 }}>🛒</span>
  )}
</div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-extrabold leading-5 text-gray-900 md:text-base">
                              {product.name}
                            </h3>

                            {product.variants?.length > 0 && (
                              <button
                                onClick={() =>
                                  setOpenProductId(isOpen ? null : product.id)
                                }
                                className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600"
                              >
                                Sizes
                              </button>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-[11px] font-semibold text-gray-500 md:text-xs">
                            {product.category} · {product.active ? "Active" : "Hidden"}
                          </p>

                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="text-sm font-extrabold text-blue-600">
                              ₹{mainVariant?.sellingPrice || 0}
                            </p>
                            <p className="text-[11px] font-semibold text-gray-500 md:text-xs">
                              {mainVariant?.weight || "No size"}
                            </p>
                            <p className="text-[11px] font-semibold text-gray-400 md:text-xs">
                              Stock: {mainVariant?.stock ?? 0}
                            </p>
                          </div>

                          <p className="mt-0.5 text-[11px] text-gray-400 md:text-xs">
                            Variants: {product.variants?.length || 0}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-1.5">
                          <button
                            onClick={() => setOpenProductId(isOpen ? null : product.id)}
className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-100 text-2xl font-black text-blue-700 no-underline"                          >
                            ▤
                          </button>

                          <button
                            onClick={() => toggleProduct(product.id)}
className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-black no-underline active:scale-95 md:h-9 md:w-9 ${                              product.active
                                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                : "border-green-300 bg-green-50 text-green-700"
                            }`}
                            title={product.active ? "Hide" : "Show"}
                          >
                            {product.active ? "👁" : "✓"}
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex h-8 w-8 items-center justify-center  bg-red-50 text-xs font-black text-red-600 active:scale-95 md:h-9 md:w-9"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="border-t border-gray-100 bg-gray-50 p-3 md:p-4">
                          <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-200">
                            <h4 className="text-sm font-extrabold">
                              Manual Variant Add करें
                            </h4>

                            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                              <select
                                value={form.weight}
                                onChange={(e) =>
                                  setVariantForms({
                                    ...variantForms,
                                    [product.id]: {
                                      ...form,
                                      weight: e.target.value,
                                    },
                                  })
                                }
                                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                              >
                                {weightOptions.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                value={form.sellingPrice}
                                onChange={(e) =>
                                  setVariantForms({
                                    ...variantForms,
                                    [product.id]: {
                                      ...form,
                                      sellingPrice: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Selling Price"
                                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                              />

                              <input
                                type="number"
                                value={form.stock}
                                onChange={(e) =>
                                  setVariantForms({
                                    ...variantForms,
                                    [product.id]: {
                                      ...form,
                                      stock: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Stock Qty"
                                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                              />

                              <button
                                type="button"
                                onClick={() => addVariant(product.id)}
                                className="flex min-h-[46px] items-center justify-center rounded-xl px-5 py-2 text-sm font-extrabold shadow-md transition-all hover:shadow-lg active:scale-95"
                                style={{
                                  backgroundColor: "#2563eb",
                                  color: "#ffffff",
                                  border: "1px solid #1d4ed8",
                                  opacity: 1,
                                }}
                              >
                                Add Variant
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2">
                            {(product.variants || []).length === 0 && (
                              <div className="rounded-xl bg-white p-3 text-sm text-gray-500 ring-1 ring-gray-200">
                                अभी इस product में कोई variant नहीं है।
                              </div>
                            )}

                            {(product.variants || []).map((variant) => {
                              const isOutOfStock = variant.stock <= 0;

                              return (
                                <div
                                  key={variant.id}
                                  className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-gray-200"
                                >
                                  <div>
                                    <h4 className="text-sm font-extrabold">
                                      {variant.weight} · ₹{variant.sellingPrice}
                                    </h4>
                                    <p className="text-xs font-semibold text-gray-500">
                                      Stock: {variant.stock} ·{" "}
                                      {variant.active ? "Active" : "Hidden"}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`hidden rounded-full px-3 py-2 text-center text-xs font-bold md:inline-block ${
                                        isOutOfStock
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {isOutOfStock ? "Out" : "In Stock"}
                                    </span>

                                    <button
                                      onClick={() =>
                                        toggleVariant(product.id, variant.id)
                                      }
                                      className="rounded-full bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                                    >
                                      {variant.active ? "Hide" : "Show"}
                                    </button>

                                    <button
                                      onClick={() =>
                                        deleteVariant(product.id, variant.id)
                                      }
                                      className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {activeTab === "Settings" && (
          <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold">Settings</h2>

            <div className="mt-6 rounded-[22px] bg-green-50 p-4 ring-1 ring-green-100">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Bell Notification Manage</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    यहाँ जो message लिखोगे, customer को website के bell icon में दिखेगा।
                  </p>
                </div>

                <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-black/5">
                  <input
                    type="checkbox"
                    checked={notificationForm.active}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Notification Title, जैसे Today Fresh Offers"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                />

                <label className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={notificationForm.showPopup}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        showPopup: e.target.checked,
                      })
                    }
                  />
                  Customer को popup भी दिखाना है
                </label>
              </div>

              <textarea
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    message: e.target.value,
                  })
                }
                placeholder="Customer के लिए message लिखो... जैसे: आज सब्जियों पर special offer है, जल्दी order करें।"
                rows={5}
                className="mt-3 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
              />

              <button
                type="button"
                onClick={saveNotificationSettings}
                className="mt-4 w-full rounded-xl bg-green-600 py-3 text-base font-extrabold text-white shadow-md transition active:scale-95 md:w-auto md:px-8"
              >
                Save Bell Notification
              </button>
            </div>

            <div className="mt-6 rounded-[22px] bg-gray-50 p-4 ring-1 ring-black/5">
              <h3 className="text-lg font-extrabold">Poster / Banner Manage</h3>
              <p className="mt-1 text-sm text-gray-500">
                Home page के poster/banner यहीं से manage होंगे।
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={bannerForm.title}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, title: e.target.value })
                  }
                  placeholder="Banner Title"
                  className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  value={bannerForm.image}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, image: e.target.value })
                  }
                  placeholder="Banner Image URL"
                  className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  value={bannerForm.link}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, link: e.target.value })
                  }
                  placeholder="Banner Link"
                  className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                📏 Recommended: 1600 × 500 px (3:1 ratio) — clear & wide banners work best
              </p>

              <button
                onClick={addBanner}
                className="mt-4 w-full rounded-xl bg-green-600 py-3 text-base font-bold text-white shadow-md transition active:scale-95 md:w-auto md:px-8"
              >
                Save Banner
              </button>

              <div className="mt-4 grid gap-3">
                {banners.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5"
                  >
                    <img
                      src={item.image}
                      className="h-20 w-32 rounded-xl object-cover"
                      alt={item.title}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-extrabold">{item.title}</h3>
                      <p className="truncate text-xs text-gray-500">
                        {item.link}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.active ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBanner(item.id)}
                      className="rounded-full bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-700"
                    >
                      {item.active ? "Hide" : "Show"}
                    </button>

                    <button
                      onClick={() => deleteBanner(item.id)}
                      className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Orders" && (
          <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Orders Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Customer के सारे orders यहाँ दिखेंगे।
                </p>
              </div>

              <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700">
                {orders.length} Orders
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {orders.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
                  अभी कोई order नहीं आया।
                </div>
              ) : (
                orders.map((order) => {
                  const isOpen = openOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-gray-200 transition active:scale-[0.99]"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold text-gray-900">
                            👤 {order.customerName || "Customer"}
                          </h3>

                          <p className="mt-1 truncate text-xs font-bold text-gray-500">
                            #{order.orderId}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black text-green-700">
                            ₹{order.grandTotal}
                          </p>

                          <p className="mt-1 rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">
                            {order.orderStatus || "Placed"}
                          </p>

                          <p className="mt-1 text-xl font-black text-gray-400">
                            {isOpen ? "⌃" : "⌄"}
                          </p>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-gray-200">
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-bold text-gray-700">
                              📞 {order.customerMobile || "No mobile"}
                            </p>

                            <p className="text-sm font-semibold text-gray-500">
                              📍 {order.address || "No address"}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  updateOrderStatus(order.id, e.target.value)
                                }
                                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-extrabold outline-none"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="rounded-xl bg-red-100 px-3 py-2 text-xs font-extrabold text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2">
                            {(order.items || []).map((item) => (
                              <div
                                key={`${order.id}-${item.id}-${item.name}`}
                                className="flex items-center gap-2 rounded-xl bg-gray-50 p-2 ring-1 ring-gray-100"
                              >
                                <div
  style={{
    width: 42,
    height: 42,
    minWidth: 42,
    maxWidth: 42,
    minHeight: 42,
    maxHeight: 42,
    borderRadius: 10,
    background: "#ffffff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
  }}
>
  {item.image ? (
    <img
      src={item.image}
      alt={item.name}
      style={{
        width: 34,
        height: 34,
        maxWidth: 34,
        maxHeight: 34,
        objectFit: "contain",
        display: "block",
      }}
    />
  ) : (
    <span style={{ fontSize: 18 }}>🛒</span>
  )}
</div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-extrabold text-gray-900">
                                    {item.name}
                                  </p>

                                  <p className="text-xs font-bold text-gray-500">
                                    ₹{item.price} × {item.quantity}
                                  </p>
                                </div>

                                <p className="shrink-0 text-right text-sm font-extrabold text-gray-900">
                                  ₹{item.total}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center justify-between rounded-2xl bg-green-50 p-3">
                            <span className="text-sm font-extrabold text-gray-700">
                              Payment: {order.paymentStatus || "Pending"}
                            </span>

                            <span className="text-lg font-black text-green-700">
                              ₹{order.grandTotal}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {activeTab === "Customers" && (
          <section className="mt-4 rounded-[24px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold">Customers</h2>
            <p className="mt-2 text-sm text-gray-500">
              यह section next step में बनाएँगे।
            </p>
          </section>
        )}
      </div>
    </main>
  );
}