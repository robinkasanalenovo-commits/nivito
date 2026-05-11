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

type ServiceRequestType = {
  id: number;
  requestId: string;
  serviceName: string;
  problemType?: string;
  customerName: string;
  customerMobile: string;
  address: string;
  notes: string;
  status: string;
  createdAt: string;
};

type ServiceOptionConfigType = {
  serviceName: string;
  options: string[];
};

type CustomerType = {
  id: number;
  full_name: string;
  mobile_number: string;
  area?: string;
  sub_area?: string;
  address?: string;
  landmark?: string;
  full_address?: string;
  created_at?: string;
};

type NotificationSettingsType = {
  title: string;
  message: string;
  active: boolean;
  showPopup: boolean;
  updatedAt: number;
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

type RawAdminSubAreaType = Partial<SubAreaType>;

type RawAdminAreaType = Partial<Omit<AreaType, "subAreas">> & {
  subAreas?: RawAdminSubAreaType[];
};

type RawAdminProductType = Partial<ProductType> & {
  sellingPrice?: number | string;
  weight?: string;
  stock?: number | string;
  variants?: ProductVariantType[];
};

type UnitType = "weight" | "pcs";
type AutoVariantKey = "100g" | "250g" | "500g" | "1kg" | "2kg" | "5kg" | "1pc" | "2pc" | "3pc"| "4pc" | "5pc" | "6pc"| "7pc" | "8pc" | "9pc"| "10pc" | "11pc" | "12pc";
type PriceMode = "auto" | "manual";

const tabs = ["Dashboard", "Areas", "Categories", "Products", "Orders", "Service Requests", "Customers", "Settings"];

const defaultServiceOptions: ServiceOptionConfigType[] = [
  { serviceName: "AC Service", options: ["AC Service", "Gas Filling", "Cooling Problem", "Installation"] },
  { serviceName: "RO Water", options: ["RO Service", "Water Filter Change", "Low Water Flow", "Installation"] },
  { serviceName: "Mobile Repair", options: ["Screen Replacement", "Battery Change", "Charging Problem", "Speaker Problem"] },
  { serviceName: "Home Cleaning", options: ["Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa Cleaning"] },
];

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

const defaultCoupons: CouponType[] = [];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestType[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOptionConfigType[]>(defaultServiceOptions);
  const [coupons, setCoupons] = useState<CouponType[]>(defaultCoupons);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "flat" as "flat" | "percent",
    value: "",
    minOrder: "",
    maxDiscount: "",
    label: "",
    active: true,
  });
  const [serviceOptionForm, setServiceOptionForm] = useState({
    serviceName: defaultServiceOptions[0].serviceName,
    option: "",
  });
  const [customers, setCustomers] = useState<CustomerType[]>([]);
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

  const [areaForm, setAreaForm] = useState({
    name: "",
    active: true,
    order: 1,
  });

  const [subAreaForms, setSubAreaForms] = useState<
    Record<number, { name: string; active: boolean }>
  >({});

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
  const [editProductForms, setEditProductForms] = useState<
    Record<number, { name: string; image: string; category: string; active: boolean }>
  >({});
  const [editVariantForms, setEditVariantForms] = useState<
    Record<number, Record<number, { weight: string; sellingPrice: string; stock: string; active: boolean }>>
  >({});

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [openProductId, setOpenProductId] = useState<number | null>(null);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const normalizeAreas = (items: RawAdminAreaType[]): AreaType[] => {
    return (items || [])
      .map((item, index) => ({
        id: Number(item.id || Date.now() + index),
        name: item.name || "",
        active: item.active ?? true,
        order: Number(item.order || index + 1),
        subAreas: Array.isArray(item.subAreas)
          ? item.subAreas.map((sub, subIndex) => ({
              id: Number(sub.id || Date.now() + index + subIndex + 100),
              name: sub.name || "",
              active: sub.active ?? true,
            }))
          : [],
      }))
      .filter((item) => item.name.trim())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const normalizeProducts = (items: RawAdminProductType[]): ProductType[] => {
    return (items || []).map((item) => {
      if (Array.isArray(item.variants)) {
        return {
          id: Number(item.id || Date.now()),
          name: item.name || "",
          image: item.image || "",
          category: item.category || "General",
          active: item.active ?? true,
          variants: item.variants || [],
        };
      }

      return {
        id: Number(item.id || Date.now()),
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
    setAreas(normalizeAreas(data.areas || []));
    setProducts(normalizeProducts(data.products || []));
    setOrders(data.orders || []);
    setServiceRequests(data.serviceRequests || []);
    setServiceOptions(
      Array.isArray(data.serviceOptions) && data.serviceOptions.length > 0
        ? data.serviceOptions
        : defaultServiceOptions
    );
    setCoupons(Array.isArray(data.coupons) ? data.coupons : defaultCoupons);
    const customerRes = await fetch("/api/customers", {
  cache: "no-store",
});

const customerData = await customerRes.json();

setCustomers(customerData.customers || []);
    setNotificationForm({
      ...defaultNotificationSettings,
      ...(data.notificationSettings || {}),
    });
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveData = async (newData: {
    banners: BannerType[];
    categories: CategoryType[];
    products: ProductType[];
    areas?: AreaType[];
    orders?: OrderType[];
    serviceRequests?: ServiceRequestType[];
    serviceOptions?: ServiceOptionConfigType[];
    coupons?: CouponType[];
    notificationSettings?: NotificationSettingsType;
  }) => {
    await fetch("/api/admin-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newData,
        areas: newData.areas ?? areas,
        orders: newData.orders ?? orders,
        serviceRequests: newData.serviceRequests ?? serviceRequests,
        serviceOptions: newData.serviceOptions ?? serviceOptions,
        coupons: newData.coupons ?? coupons,
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
      areas,
      orders,
      notificationSettings: updatedNotification,
    }),
  });

  setNotificationForm(updatedNotification);

  alert("Notification save हो गई ✅");
};

  const addArea = async () => {
    if (!areaForm.name.trim()) {
      alert("Please enter an area name.");
      return;
    }

    const newArea: AreaType = {
      id: Date.now(),
      name: areaForm.name.trim(),
      active: areaForm.active,
      order: Number(areaForm.order || areas.length + 1),
      subAreas: [],
    };

    await saveData({
      banners,
      categories,
      areas: [...areas, newArea],
      products,
    });

    setAreaForm({ name: "", active: true, order: areas.length + 2 });
    alert("Area saved successfully.");
  };

  const addSubArea = async (areaId: number) => {
    const form = subAreaForms[areaId] || { name: "", active: true };

    if (!form.name.trim()) {
      alert("Please enter a sub area name.");
      return;
    }

    const newSubArea: SubAreaType = {
      id: Date.now(),
      name: form.name.trim(),
      active: form.active,
    };

    await saveData({
      banners,
      categories,
      areas: areas.map((area) =>
        area.id === areaId
          ? { ...area, subAreas: [...(area.subAreas || []), newSubArea] }
          : area
      ),
      products,
    });

    setSubAreaForms({
      ...subAreaForms,
      [areaId]: { name: "", active: true },
    });

    alert("Sub area saved successfully.");
  };

  const toggleArea = async (id: number) => {
    await saveData({
      banners,
      categories,
      areas: areas.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
      products,
    });
  };

  const toggleSubArea = async (areaId: number, subAreaId: number) => {
    await saveData({
      banners,
      categories,
      areas: areas.map((area) =>
        area.id === areaId
          ? {
              ...area,
              subAreas: (area.subAreas || []).map((sub) =>
                sub.id === subAreaId ? { ...sub, active: !sub.active } : sub
              ),
            }
          : area
      ),
      products,
    });
  };

  const deleteArea = async (id: number) => {
    if (!confirm("Delete this area?")) return;

    const filtered = areas.filter((item) => item.id !== id);
    const reordered = filtered
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item, index) => ({ ...item, order: index + 1 }));

    await saveData({
      banners,
      categories,
      areas: reordered,
      products,
    });
  };

  const deleteSubArea = async (areaId: number, subAreaId: number) => {
    if (!confirm("Delete this sub area?")) return;

    await saveData({
      banners,
      categories,
      areas: areas.map((area) =>
        area.id === areaId
          ? {
              ...area,
              subAreas: (area.subAreas || []).filter((sub) => sub.id !== subAreaId),
            }
          : area
      ),
      products,
    });
  };

  const moveAreaUp = async (id: number) => {
    const sorted = [...areas].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const updated = [...sorted];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    await saveData({
      banners,
      categories,
      areas: updated.map((item, i) => ({ ...item, order: i + 1 })),
      products,
    });
  };

  const moveAreaDown = async (id: number) => {
    const sorted = [...areas].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1 || index >= sorted.length - 1) return;

    const updated = [...sorted];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];

    await saveData({
      banners,
      categories,
      areas: updated.map((item, i) => ({ ...item, order: i + 1 })),
      products,
    });
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

  const moveProductUp = async (id: number) => {
    const index = products.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const updated = [...products];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    await saveData({
      banners,
      categories,
      products: updated,
    });
  };

  const moveProductDown = async (id: number) => {
    const index = products.findIndex((item) => item.id === id);
    if (index === -1 || index >= products.length - 1) return;

    const updated = [...products];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];

    await saveData({
      banners,
      categories,
      products: updated,
    });
  };

  const saveProductEdits = async (product: ProductType) => {
    const form =
      editProductForms[product.id] || {
        name: product.name,
        image: product.image,
        category: product.category,
        active: product.active,
      };

    if (!form.name.trim()) {
      alert("Product name daalo");
      return;
    }

    const updatedProducts = products.map((item) =>
      item.id === product.id
        ? {
            ...item,
            name: form.name.trim(),
            image: form.image.trim(),
            category: form.category || "General",
            active: form.active,
          }
        : item
    );

    await saveData({
      banners,
      categories,
      products: updatedProducts,
    });

    setEditProductForms((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });

    alert("Product update ho gaya");
  };

  const saveVariantEdits = async (productId: number, variant: ProductVariantType) => {
    const form =
      editVariantForms[productId]?.[variant.id] || {
        weight: variant.weight,
        sellingPrice: String(variant.sellingPrice || 0),
        stock: String(variant.stock || 0),
        active: variant.active,
      };

    if (!form.weight.trim()) {
      alert("Quantity/weight daalo");
      return;
    }

    if (Number(form.sellingPrice || 0) <= 0) {
      alert("Selling price 0 se zyada hona chahiye");
      return;
    }

    await saveData({
      banners,
      categories,
      products: products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.map((item) =>
                item.id === variant.id
                  ? {
                      ...item,
                      weight: form.weight.trim(),
                      sellingPrice: Number(form.sellingPrice || 0),
                      stock: Number(form.stock || 0),
                      active: form.active,
                    }
                  : item
              ),
            }
          : product
      ),
    });

    setEditVariantForms((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        next[productId] = { ...next[productId] };
        delete next[productId][variant.id];
      }
      return next;
    });

    alert("Variant update ho gaya");
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
  const updateServiceRequestStatus = async (requestId: number, status: string) => {
    const updatedRequests = serviceRequests.map((request) =>
      request.id === requestId ? { ...request, status } : request
    );

    await saveData({
      banners,
      categories,
      products,
      serviceRequests: updatedRequests,
    });
  };

  const deleteServiceRequest = async (requestId: number) => {
    if (!confirm("Service request delete karni hai?")) return;

    await saveData({
      banners,
      categories,
      products,
      serviceRequests: serviceRequests.filter((request) => request.id !== requestId),
    });
  };

  const addServiceOption = async () => {
    const option = serviceOptionForm.option.trim();
    if (!option) return;

    const updatedOptions = serviceOptions.map((service) => {
      if (service.serviceName !== serviceOptionForm.serviceName) return service;
      if (service.options.some((item) => item.toLowerCase() === option.toLowerCase())) return service;
      return { ...service, options: [...service.options, option] };
    });

    await saveData({
      banners,
      categories,
      products,
      serviceOptions: updatedOptions,
    });

    setServiceOptionForm((prev) => ({ ...prev, option: "" }));
  };

  const deleteServiceOption = async (serviceName: string, option: string) => {
    const updatedOptions = serviceOptions.map((service) =>
      service.serviceName === serviceName
        ? { ...service, options: service.options.filter((item) => item !== option) }
        : service
    );

    await saveData({
      banners,
      categories,
      products,
      serviceOptions: updatedOptions,
    });
  };

  const addCoupon = async () => {
    const code = couponForm.code.trim().toUpperCase();
    const value = Number(couponForm.value || 0);
    const minOrder = Number(couponForm.minOrder || 0);
    const maxDiscount = Number(couponForm.maxDiscount || 0);

    if (!code) {
      alert("Coupon code daalo");
      return;
    }

    if (value <= 0) {
      alert("Discount value 0 se zyada hona chahiye");
      return;
    }

    if (coupons.some((coupon) => coupon.code.toUpperCase() === code)) {
      alert("Yeh coupon code already hai");
      return;
    }

    const newCoupon: CouponType = {
      id: Date.now(),
      code,
      type: couponForm.type,
      value,
      minOrder,
      maxDiscount,
      label:
        couponForm.label.trim() ||
        (couponForm.type === "flat"
          ? `Rs ${value} off`
          : `${value}% off${maxDiscount > 0 ? ` max Rs ${maxDiscount}` : ""}`),
      active: couponForm.active,
    };

    await saveData({
      banners,
      categories,
      products,
      coupons: [newCoupon, ...coupons],
    });

    setCouponForm({
      code: "",
      type: "flat",
      value: "",
      minOrder: "",
      maxDiscount: "",
      label: "",
      active: true,
    });

    alert("Coupon save ho gaya");
  };

  const toggleCoupon = async (couponId: number) => {
    await saveData({
      banners,
      categories,
      products,
      coupons: coupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon
      ),
    });
  };

  const deleteCoupon = async (couponId: number) => {
    if (!confirm("Coupon delete karna hai?")) return;

    await saveData({
      banners,
      categories,
      products,
      coupons: coupons.filter((coupon) => coupon.id !== couponId),
    });
  };

  const getInvoiceNumber = (order: OrderType) => {
  return `INV-${String(order.id).slice(-6)}`;
};

const getStatusIndex = (status: string) => {
  const steps = ["Placed", "Confirmed", "Packed", "Out for Delivery", "Delivered"];
  const index = steps.indexOf(status);
  return index === -1 ? 0 : index;
};

const printOrderBill = (orderId: number) => {
  const printContent = document.getElementById(`invoice-${orderId}`);
  if (!printContent) return;

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Nivito Invoice</title>
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 16px;
            background: #f8fafc;
            font-family: Arial, sans-serif;
            color: #111827;
          }

          #invoice-${orderId} {
            max-width: 980px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 28px;
            padding: 26px;
            overflow: hidden;
          }

          #invoice-${orderId} > div:first-child {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 22px;
          }

          h2 {
            margin: 0;
            color: #07852f !important;
            font-size: 34px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }

          h3 {
            margin: 0;
            color: #111827 !important;
            font-size: 30px;
            font-weight: 900;
          }

          h4 {
            margin: 0 0 10px;
            color: #6b7280 !important;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
          }

          p {
            margin: 4px 0;
            font-size: 14px;
            font-weight: 700;
            color: #4b5563;
          }

          #invoice-${orderId} > div:nth-child(2) {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 22px;
            background: #f9fafb !important;
            border-radius: 26px;
            padding: 22px;
          }

          #invoice-${orderId} > div:nth-child(2) p:first-of-type {
            font-size: 18px;
            font-weight: 900;
            color: #111827;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 22px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            border-radius: 22px;
          }

          thead {
            background: #f3f4f6 !important;
          }

          th {
            padding: 14px 16px;
            font-size: 13px;
            font-weight: 900;
            color: #6b7280 !important;
            text-transform: uppercase;
          }

          td {
            padding: 16px;
            font-size: 15px;
            font-weight: 900;
            color: #111827;
            border-top: 1px solid #eef2f7;
          }

          .invoice-product {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 260px;
          }

          .invoice-product-image {
            width: 64px;
            height: 64px;
            flex: 0 0 64px;
            border-radius: 14px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            object-fit: cover;
          }

          .invoice-product-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            flex: 0 0 64px;
            border-radius: 14px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            color: #9ca3af;
            font-size: 24px;
          }

          .invoice-product-name {
            font-size: 17px;
            line-height: 1.25;
          }

          th:nth-child(2),
          td:nth-child(2) {
            text-align: center;
          }

          th:nth-child(3),
          th:nth-child(4),
          td:nth-child(3),
          td:nth-child(4) {
            text-align: right;
          }

          #invoice-${orderId} > div:nth-last-child(2) {
            margin-top: 22px;
            background: #ecfdf3 !important;
            border-radius: 26px;
            padding: 22px;
          }

          #invoice-${orderId} > div:nth-last-child(2) > div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 900;
            color: #1f2937;
          }

          #invoice-${orderId} > div:nth-last-child(2) > div:last-child {
            margin-top: 14px;
            padding-top: 16px;
            border-top: 1px solid #bbf7d0;
            color: #07852f !important;
            font-size: 28px;
            font-weight: 900;
          }

          #invoice-${orderId} > p:last-child {
            margin-top: 24px;
            text-align: center;
            color: #9ca3af !important;
            font-size: 14px;
            font-weight: 800;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        </style>
      </head>

      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

  win.document.close();

  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
};

const openWhatsAppOrder = (order: OrderType) => {
  const text = encodeURIComponent(
    `Nivito Order Update%0AOrder: ${order.orderId}%0AName: ${order.customerName}%0ATotal: ₹${order.grandTotal}%0AStatus: ${order.orderStatus}`
  );

  window.open(`https://wa.me/91${order.customerMobile}?text=${text}`, "_blank");
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
              Select Areas, Categories, Products, Orders, Service Requests, Customers, or Settings from above to manage your store.
            </p>
          </section>
        )}


        {activeTab === "Areas" && (
          <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Manage Areas</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Customers will select an area first, then a sub area, then enter their full address during signup.
                </p>
              </div>

              <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700">
                {areas.length} Areas
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <h3 className="text-base font-extrabold">Add New Area</h3>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_auto]">
                <input
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  placeholder="Area name, for example Sector 56"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                />

                <input
                  type="number"
                  value={areaForm.order}
                  onChange={(e) =>
                    setAreaForm({ ...areaForm, order: Number(e.target.value) })
                  }
                  placeholder="Order"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                />

                <button
                  type="button"
                  onClick={addArea}
                  className="rounded-2xl bg-green-600 px-6 py-3 font-extrabold text-white shadow-md transition active:scale-95"
                >
                  Save Area
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {areas.length === 0 && (
                <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
                  No areas have been added yet. Add your first delivery area.
                </div>
              )}

              {[...areas]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((area, index, array) => {
                  const subForm = subAreaForms[area.id] || { name: "", active: true };

                  return (
                    <div
                      key={area.id}
                      className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5"
                    >
                      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-200 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-extrabold text-green-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-extrabold text-gray-900">
                              📍 {area.name}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-gray-500">
                              Sub Areas: {(area.subAreas || []).length} · {area.active ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 md:flex md:flex-shrink-0">
                          <button
                            onClick={() => moveAreaUp(area.id)}
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
                            onClick={() => moveAreaDown(area.id)}
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
                            onClick={() => toggleArea(area.id)}
                            className="rounded-full bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                          >
                            {area.active ? "Hide" : "Show"}
                          </button>

                          <button
                            onClick={() => deleteArea(area.id)}
                            className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-gray-200">
                        <h4 className="text-sm font-extrabold">Add Sub Area</h4>

                        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                          <input
                            value={subForm.name}
                            onChange={(e) =>
                              setSubAreaForms({
                                ...subAreaForms,
                                [area.id]: { ...subForm, name: e.target.value },
                              })
                            }
                            placeholder="Sub area, for example Block A"
                            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600"
                          />

                          <button
                            type="button"
                            onClick={() => addSubArea(area.id)}
                            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-extrabold text-white shadow-md transition active:scale-95"
                          >
                            Add Sub Area
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {(area.subAreas || []).length === 0 && (
                            <div className="rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-500 ring-1 ring-gray-100 md:col-span-2">
                              This area does not have any sub areas yet.
                            </div>
                          )}

                          {(area.subAreas || []).map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-gray-900">
                                  {sub.name}
                                </p>
                                <p className="text-xs font-semibold text-gray-500">
                                  {sub.active ? "Active" : "Inactive"}
                                </p>
                              </div>

                              <div className="flex shrink-0 gap-2">
                                <button
                                  onClick={() => toggleSubArea(area.id, sub.id)}
                                  className="rounded-full bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                                >
                                  {sub.active ? "Hide" : "Show"}
                                </button>

                                <button
                                  onClick={() => deleteSubArea(area.id, sub.id)}
                                  className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
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
                  const productIndex = products.findIndex((item) => item.id === product.id);
                  const editProductForm = editProductForms[product.id] || {
                    name: product.name,
                    image: product.image,
                    category: product.category,
                    active: product.active,
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

                        <div className="grid shrink-0 grid-cols-2 gap-1.5 md:flex md:flex-col">
                          <button
                            onClick={() => moveProductUp(product.id)}
                            disabled={productIndex <= 0}
                            className={`flex h-8 w-12 items-center justify-center rounded-lg text-[10px] font-black active:scale-95 ${
                              productIndex <= 0
                                ? "bg-gray-100 text-gray-400"
                                : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            }`}
                            title="Move up"
                          >
                            Up
                          </button>

                          <button
                            onClick={() => moveProductDown(product.id)}
                            disabled={productIndex === -1 || productIndex >= products.length - 1}
                            className={`flex h-8 w-12 items-center justify-center rounded-lg text-[10px] font-black active:scale-95 ${
                              productIndex === -1 || productIndex >= products.length - 1
                                ? "bg-gray-100 text-gray-400"
                                : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            }`}
                            title="Move down"
                          >
                            Down
                          </button>

                          <button
                            onClick={() => setOpenProductId(isOpen ? null : product.id)}
                            className="col-span-2 flex h-10 w-full items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-100 px-3 text-xs font-black text-blue-700 no-underline md:w-12"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleProduct(product.id)}
                            className={`flex h-8 w-12 items-center justify-center rounded-lg border text-[10px] font-black no-underline active:scale-95 ${
                              product.active
                                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                : "border-green-300 bg-green-50 text-green-700"
                            }`}
                            title={product.active ? "Hide" : "Show"}
                          >
                            {product.active ? "Hide" : "Show"}
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex h-8 w-12 items-center justify-center rounded-lg bg-red-50 text-[10px] font-black text-red-600 active:scale-95"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
{isOpen && (
  <div className="border-t border-gray-100 bg-gray-50 p-3">
    <div className="mb-3 rounded-2xl bg-white p-3 ring-1 ring-gray-200">
      <h4 className="text-sm font-extrabold text-gray-900">Edit Product Details</h4>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input
          value={editProductForm.name}
          onChange={(e) =>
            setEditProductForms({
              ...editProductForms,
              [product.id]: { ...editProductForm, name: e.target.value },
            })
          }
          placeholder="Product name"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
        />

        <input
          value={editProductForm.image}
          onChange={(e) =>
            setEditProductForms({
              ...editProductForms,
              [product.id]: { ...editProductForm, image: e.target.value },
            })
          }
          placeholder="Product image URL"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
        />

        <select
          value={editProductForm.category}
          onChange={(e) =>
            setEditProductForms({
              ...editProductForms,
              [product.id]: { ...editProductForm, category: e.target.value },
            })
          }
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
        >
          <option value="">Select Category</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
          <option value="General">General</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700">
          <input
            type="checkbox"
            checked={editProductForm.active}
            onChange={(e) =>
              setEditProductForms({
                ...editProductForms,
                [product.id]: { ...editProductForm, active: e.target.checked },
              })
            }
          />
          Active
        </label>
      </div>

      <button
        onClick={() => saveProductEdits(product)}
        className="mt-3 rounded-xl bg-green-600 px-5 py-2 text-sm font-extrabold text-white shadow-md active:scale-95"
      >
        Save Product Changes
      </button>
    </div>

    <div className="mb-3 rounded-2xl bg-white p-3 ring-1 ring-gray-200">
      <h4 className="text-sm font-extrabold text-gray-900">Add New Variant</h4>
      <p className="mt-1 text-xs font-semibold text-gray-500">
        Quantity/weight, price, aur stock add karo.
      </p>
    </div>
    <div className="grid gap-3 md:grid-cols-4">
      <select
        value={form.weight}
        onChange={(e) =>
          setVariantForms({
            ...variantForms,
            [product.id]: { ...form, weight: e.target.value },
          })
        }
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none"
      >
        {weightOptions.map((weight) => (
          <option key={weight} value={weight}>
            {weight}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={form.sellingPrice}
        onChange={(e) =>
          setVariantForms({
            ...variantForms,
            [product.id]: { ...form, sellingPrice: e.target.value },
          })
        }
        placeholder="Selling Price"
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none"
      />

      <input
        type="number"
        value={form.stock}
        onChange={(e) =>
          setVariantForms({
            ...variantForms,
            [product.id]: { ...form, stock: e.target.value },
          })
        }
        placeholder="Stock"
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none"
      />

      <button
        onClick={() => addVariant(product.id)}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-md active:scale-95"
      >
        Add Variant
      </button>
    </div>

    <div className="mt-3 grid gap-2">
      {(product.variants || []).map((variant) => {
        const editVariantForm = editVariantForms[product.id]?.[variant.id] || {
          weight: variant.weight,
          sellingPrice: String(variant.sellingPrice || 0),
          stock: String(variant.stock || 0),
          active: variant.active,
        };

        return (
          <div
            key={variant.id}
            className="rounded-xl bg-white p-3 ring-1 ring-gray-200"
          >
            <div className="grid gap-2 md:grid-cols-[1fr_120px_120px_110px_auto] md:items-center">
              <input
                value={editVariantForm.weight}
                onChange={(e) =>
                  setEditVariantForms({
                    ...editVariantForms,
                    [product.id]: {
                      ...(editVariantForms[product.id] || {}),
                      [variant.id]: { ...editVariantForm, weight: e.target.value },
                    },
                  })
                }
                placeholder="Quantity / Weight"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
              />

              <input
                type="number"
                value={editVariantForm.sellingPrice}
                onChange={(e) =>
                  setEditVariantForms({
                    ...editVariantForms,
                    [product.id]: {
                      ...(editVariantForms[product.id] || {}),
                      [variant.id]: { ...editVariantForm, sellingPrice: e.target.value },
                    },
                  })
                }
                placeholder="Price"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
              />

              <input
                type="number"
                value={editVariantForm.stock}
                onChange={(e) =>
                  setEditVariantForms({
                    ...editVariantForms,
                    [product.id]: {
                      ...(editVariantForms[product.id] || {}),
                      [variant.id]: { ...editVariantForm, stock: e.target.value },
                    },
                  })
                }
                placeholder="Stock"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-600"
              />

              <label className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={editVariantForm.active}
                  onChange={(e) =>
                    setEditVariantForms({
                      ...editVariantForms,
                      [product.id]: {
                        ...(editVariantForms[product.id] || {}),
                        [variant.id]: { ...editVariantForm, active: e.target.checked },
                      },
                    })
                  }
                />
                Active
              </label>

              <div className="grid grid-cols-3 gap-2 md:flex">
                <button
                  onClick={() => saveVariantEdits(product.id, variant)}
                  className="rounded-xl bg-green-600 px-3 py-2 text-xs font-extrabold text-white active:scale-95"
                >
                  Save
                </button>

                <button
                  onClick={() => toggleVariant(product.id, variant.id)}
                  className="rounded-xl bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700 active:scale-95"
                >
                  {variant.active ? "Hide" : "Show"}
                </button>

                <button
                  onClick={() => deleteVariant(product.id, variant.id)}
                  className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 active:scale-95"
                >
                  Delete
                </button>
              </div>
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


<div className="mt-6 rounded-[22px] bg-gray-50 p-4 ring-1 ring-black/5">
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-extrabold">Coupons Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customer cart me jo coupon apply hoga, woh yahan se control hoga.
        </p>
      </div>

      <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700">
        {coupons.length} Coupons
      </div>
    </div>

    <div className="mt-4 rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
      <h3 className="text-base font-extrabold">Add New Coupon</h3>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          value={couponForm.code}
          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
          placeholder="Coupon code, e.g. SAVE50"
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold uppercase outline-none focus:border-green-600"
        />

        <select
          value={couponForm.type}
          onChange={(e) =>
            setCouponForm({ ...couponForm, type: e.target.value as "flat" | "percent" })
          }
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-green-600"
        >
          <option value="flat">Flat Rs Discount</option>
          <option value="percent">Percent Discount</option>
        </select>

        <input
          type="number"
          value={couponForm.value}
          onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
          placeholder={couponForm.type === "flat" ? "Discount Rs" : "Discount %"}
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-green-600"
        />

        <input
          type="number"
          value={couponForm.minOrder}
          onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
          placeholder="Minimum order Rs"
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-green-600"
        />

        <input
          type="number"
          value={couponForm.maxDiscount}
          onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
          placeholder="Max discount Rs, optional"
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-green-600"
        />

        <input
          value={couponForm.label}
          onChange={(e) => setCouponForm({ ...couponForm, label: e.target.value })}
          placeholder="Customer label, optional"
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-green-600"
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm font-extrabold text-gray-700">
        <input
          type="checkbox"
          checked={couponForm.active}
          onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
          className="h-4 w-4"
        />
        Coupon active rakho
      </label>

      <button
        onClick={addCoupon}
        className="mt-4 rounded-xl px-8 py-3 text-base font-bold shadow-md transition active:scale-95"
        style={{
          background: "#16a34a",
          color: "#ffffff",
          boxShadow: "0 12px 24px rgba(22, 163, 74, 0.28)",
          minWidth: 170,
        }}
      >
        Save Coupon
      </button>
    </div>

    <div className="mt-4 grid gap-3">
      {coupons.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
          Abhi koi coupon nahi hai.
        </div>
      ) : (
        coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-gray-900">{coupon.code}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  coupon.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {coupon.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-700">{coupon.label}</p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {coupon.type === "flat" ? `Rs ${coupon.value} off` : `${coupon.value}% off`}
                {" "} | Min order Rs {coupon.minOrder || 0}
                {coupon.maxDiscount ? ` | Max Rs ${coupon.maxDiscount}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex md:flex-shrink-0">
              <button
                onClick={() => toggleCoupon(coupon.id)}
                className="rounded-full bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-700"
              >
                {coupon.active ? "Disable" : "Enable"}
              </button>

              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
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
          Invoice, payment और status सब यहीं manage होंगे।
        </p>
      </div>

      <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700">
        {orders.length} Orders
      </div>
    </div>

    <div className="mt-4 grid gap-4">
      {orders.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
          अभी कोई order नहीं आया।
        </div>
      ) : (
        orders.map((order) => {
          const isOpen = openOrderId === order.id;
          const statusSteps = ["Placed", "Confirmed", "Packed", "Out for Delivery", "Delivered"];
          const currentStep = getStatusIndex(order.orderStatus || "Placed");

          return (
            <div key={order.id} className="rounded-3xl bg-gray-50 p-3 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-gray-200 active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-extrabold text-gray-900">
                    👤 {order.customerName || "Customer"}
                  </h3>
                  <p className="mt-1 truncate text-xs font-bold text-gray-500">
                    {getInvoiceNumber(order)} · #{order.orderId}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-black text-green-700">
                    ₹{order.grandTotal || 0}
                  </p>
                  <p className="text-xs font-bold text-gray-500">
                    {order.orderStatus || "Placed"}
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-4">
                    <button
                      onClick={() => printOrderBill(order.id)}
                      className="rounded-2xl bg-blue-600 px-4 py-4 text-sm font-extrabold text-white shadow-md active:scale-95"
                    >
                      🖨 Print / PDF
                    </button>

                    <a
                      href={`tel:${order.customerMobile}`}
                      className="rounded-2xl bg-green-600 px-4 py-4 text-center text-sm font-extrabold text-white no-underline shadow-md active:scale-95"
                    >
                      📞 Call Customer
                    </a>

                    <button
                      onClick={() => openWhatsAppOrder(order)}
                      className="rounded-2xl bg-purple-100 px-4 py-4 text-sm font-extrabold text-purple-700 shadow-sm active:scale-95"
                    >
                      💬 WhatsApp
                    </button>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="rounded-2xl bg-red-100 px-4 py-4 text-sm font-extrabold text-red-700 shadow-sm active:scale-95"
                    >
                      🗑 Delete
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Order Status Timeline
                    </h3>

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {statusSteps.map((step, index) => (
                        <button
                          key={step}
                          onClick={() => updateOrderStatus(order.id, step)}
                          className={`rounded-xl px-2 py-3 text-[10px] font-extrabold ${
                            index <= currentStep
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index <= currentStep ? "✓ " : ""}
                          {step}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    id={`invoice-${order.id}`}
                    className="rounded-[28px] bg-white p-5 ring-1 ring-gray-200"
                  >
                    <div className="flex items-start justify-between border-b border-gray-200 pb-5">
                      <div>
                        <h2 className="text-3xl font-black text-green-700">NIVITO</h2>
                        <p className="text-sm font-bold text-gray-500">Fresh Groceries & Home Services</p>
                        <p className="text-sm font-bold text-gray-500">Website: nivito.in</p>
                        <p className="text-sm font-bold text-gray-500">Support: 9999878381</p>
                      </div>

                      <div className="text-right">
                        <h3 className="text-2xl font-black text-gray-900">INVOICE</h3>
                        <p className="text-sm font-bold text-gray-500">{getInvoiceNumber(order)}</p>
                        <p className="text-sm font-bold text-gray-500">Order: #{order.orderId}</p>
                        <p className="text-sm font-bold text-gray-500">
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-3xl bg-gray-50 p-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-black uppercase text-gray-500">Bill To</h4>
                        <p className="mt-1 text-lg font-black text-gray-900">{order.customerName || "Customer"}</p>
                        <p className="text-sm font-bold text-gray-600">
  {order.customerMobile || "No mobile"}
</p>

<p className="mt-1 text-sm font-semibold text-gray-500">
  {order.address && order.address.replaceAll(",", "").trim()
    ? order.address
    : "Address missing — customer से address confirm करें"}
</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-black uppercase text-gray-500">Payment / Status</h4>
                        <p className="mt-1 text-sm font-bold text-gray-700">Payment: {order.paymentStatus || "Pending"}</p>
                        <p className="text-sm font-bold text-gray-700">Status: {order.orderStatus || "Placed"}</p>
                      </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-gray-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-3 py-3">Product</th>
                            <th className="px-3 py-3 text-center">Qty</th>
                            <th className="px-3 py-3 text-right">Rate</th>
                            <th className="px-3 py-3 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(order.items || []).map((item) => (
                            <tr key={`${order.id}-${item.id}-${item.name}`} className="border-t border-gray-100">
                              <td className="px-3 py-3 font-bold text-gray-900">
                                <div className="invoice-product flex min-w-[220px] items-center gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="invoice-product-image h-16 w-16 flex-shrink-0 rounded-2xl border border-gray-200 bg-white object-cover"
                                    />
                                  ) : (
                                    <div className="invoice-product-placeholder flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-xl text-gray-400">
                                      ?
                                    </div>
                                  )}
                                  <span className="invoice-product-name text-base font-black leading-tight text-gray-900">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center font-bold">{item.quantity}</td>
                              <td className="px-3 py-3 text-right font-bold">₹{item.price}</td>
                              <td className="px-3 py-3 text-right font-extrabold">₹{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-3xl bg-green-50 p-4">
                      <div className="flex justify-between text-sm font-bold text-gray-700">
                        <span>Item Total</span>
                        <span>₹{order.itemTotal || 0}</span>
                      </div>

                      <div className="flex justify-between text-sm font-bold text-gray-700">
                        <span>Delivery Fee</span>
                        <span>₹{order.deliveryFee || 0}</span>
                      </div>

                      <div className="flex justify-between border-t border-green-200 pt-3 text-2xl font-black text-green-700">
                        <span>Grand Total</span>
                        <span>₹{order.grandTotal || 0}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-center text-xs font-bold text-gray-400">
                      Thank you for shopping with Nivito!
                    </p>
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

      {activeTab === "Service Requests" && (
  <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold">Service Requests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customers ki call requests yahan manage hongi.
        </p>
      </div>

      <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
        {serviceRequests.length} Requests
      </div>
    </div>

    <div className="mt-4 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-xs font-extrabold uppercase tracking-wide text-blue-700">
            Service
          </label>
          <select
            value={serviceOptionForm.serviceName}
            onChange={(e) => setServiceOptionForm((prev) => ({ ...prev, serviceName: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm font-bold outline-none"
          >
            {serviceOptions.map((service) => (
              <option key={service.serviceName} value={service.serviceName}>
                {service.serviceName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-[1.4]">
          <label className="text-xs font-extrabold uppercase tracking-wide text-blue-700">
            Add problem option
          </label>
          <input
            value={serviceOptionForm.option}
            onChange={(e) => setServiceOptionForm((prev) => ({ ...prev, option: e.target.value }))}
            placeholder="e.g. Gas Filling, Screen Replacement"
            className="mt-1 w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </div>
        <button
          onClick={addServiceOption}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-md active:scale-95"
        >
          Add Option
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {serviceOptions.map((service) => (
          <div key={service.serviceName} className="rounded-2xl bg-white p-3 ring-1 ring-blue-100">
            <h3 className="text-sm font-extrabold text-gray-900">{service.serviceName}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {service.options.length === 0 ? (
                <span className="text-xs font-bold text-gray-400">No options</span>
              ) : (
                service.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => deleteServiceOption(service.serviceName, option)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 active:scale-95"
                    title="Click to delete"
                  >
                    {option} ×
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 grid gap-3">
      {serviceRequests.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
          Abhi koi service request nahi aayi.
        </div>
      ) : (
        serviceRequests.map((request) => (
          <div key={request.id} className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-gray-900">
                    {request.serviceName}
                  </h3>
                  {request.problemType && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-amber-100">
                      {request.problemType}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-blue-700 ring-1 ring-blue-100">
                    {request.status || "New"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-700">
                  {request.customerName || "Customer"} · {request.customerMobile}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {request.address || "Address not provided"}
                </p>
                {request.notes && (
                  <p className="mt-2 rounded-xl bg-white p-3 text-sm font-semibold text-gray-600 ring-1 ring-black/5">
                    {request.notes}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {request.createdAt ? new Date(request.createdAt).toLocaleString("en-IN") : ""}
                </p>
              </div>

              <div className="grid min-w-[180px] gap-2">
                <a
                  href={`tel:${request.customerMobile}`}
                  className="rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-extrabold text-white no-underline shadow-md active:scale-95"
                >
                  Call Customer
                </a>
                <a
                  href={`https://wa.me/91${request.customerMobile}?text=${encodeURIComponent(`Nivito service request: ${request.serviceName}${request.problemType ? ` - ${request.problemType}` : ""}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-extrabold text-white no-underline shadow-md active:scale-95"
                >
                  WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateServiceRequestStatus(request.id, "Called")}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white active:scale-95"
                  >
                    Called
                  </button>
                  <button
                    onClick={() => updateServiceRequestStatus(request.id, "Closed")}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-extrabold text-white active:scale-95"
                  >
                    Closed
                  </button>
                </div>
                <button
                  onClick={() => deleteServiceRequest(request.id)}
                  className="rounded-xl bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600 active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
)}

      {activeTab === "Customers" && (
  <section className="mt-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold">Customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          All customers who sign up will appear here.
        </p>
      </div>

      <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
        {customers.length} Customers
      </div>
    </div>

    <div className="mt-4 grid gap-3">
      {customers.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-bold text-gray-500 ring-1 ring-black/5">
          अभी कोई customer नहीं है।
        </div>
      ) : (
        customers.map((customer) => (
          <div
            key={customer.id}
            className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-extrabold text-gray-900">
                  👤 {customer.full_name}
                </h3>

                <p className="mt-1 text-sm font-bold text-gray-600">
                  📞 {customer.mobile_number}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  📍{" "}
                  {customer.full_address ||
                    `${customer.area || ""}, ${customer.sub_area || ""}, ${customer.address || ""}`}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {customer.created_at
                    ? new Date(customer.created_at).toLocaleString("en-IN")
                    : ""}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
)}
</div>
    </main>
  );
}
