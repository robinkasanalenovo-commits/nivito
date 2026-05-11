import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultNotificationSettings = {
  title: "",
  message: "",
  active: false,
  showPopup: true,
  updatedAt: 0,
};

const defaultServiceOptions = [
  {
    serviceName: "AC Service",
    options: ["AC Service", "Gas Filling", "Cooling Problem", "Installation"],
  },
  {
    serviceName: "RO Water",
    options: ["RO Service", "Water Filter Change", "Low Water Flow", "Installation"],
  },
  {
    serviceName: "Mobile Repair",
    options: ["Screen Replacement", "Battery Change", "Charging Problem", "Speaker Problem"],
  },
  {
    serviceName: "Home Cleaning",
    options: ["Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa Cleaning"],
  },
];

const defaultCoupons: any[] = [];

const defaultCategories = [
  { id: 1, name: "Vegetables", image: "", link: "/category/vegetables", active: true, order: 1 },
  { id: 2, name: "Fruits", image: "", link: "/category/fruits", active: true, order: 2 },
  { id: 3, name: "Dairy", image: "", link: "/category/dairy", active: true, order: 3 },
  { id: 4, name: "Grocery", image: "", link: "/category/grocery", active: true, order: 4 },
];

const defaultAreas = [
  {
    id: 1,
    name: "Loni",
    active: true,
    minOrder: 0,
    subAreas: [
      { id: 101, name: "Balram Nagar", active: true, minOrder: 0 },
      { id: 102, name: "Indrapuri", active: true, minOrder: 0 },
    ],
  },
];

const defaultData = {
  banners: [],
  categories: defaultCategories,
  products: [],
  orders: [],
  serviceRequests: [],
  serviceOptions: defaultServiceOptions,
  coupons: defaultCoupons,
  customers: [],
  referrals: [],
  areas: defaultAreas,
  notificationSettings: defaultNotificationSettings,
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

function normalizeData(data: any) {
  return {
    banners: data?.banners || [],
    categories:
      Array.isArray(data?.categories) && data.categories.length > 0
        ? data.categories
        : defaultCategories,
    products: data?.products || [],
    orders: data?.orders || [],
    serviceRequests: data?.serviceRequests || [],
    serviceOptions:
      Array.isArray(data?.serviceOptions) && data.serviceOptions.length > 0
        ? data.serviceOptions
        : defaultServiceOptions,
    coupons: Array.isArray(data?.coupons) ? data.coupons : defaultCoupons,
    customers: data?.customers || [],
    referrals: data?.referrals || [],
    areas:
      Array.isArray(data?.areas) && data.areas.length > 0
        ? data.areas.map((area: any, index: number) => ({
            ...area,
            order: Number(area.order || index + 1),
            minOrder: Number(area.minOrder || 0),
            subAreas: Array.isArray(area.subAreas)
              ? area.subAreas.map((sub: any) => ({
                  ...sub,
                  minOrder: Number(sub.minOrder || 0),
                }))
              : [],
          }))
        : defaultAreas,
    notificationSettings:
      data?.notificationSettings || defaultNotificationSettings,
  };
}

async function getData() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("admin_data")
    .select("data")
    .eq("id", 1)
    .single();

  if (error || !data) {
    await supabase.from("admin_data").upsert({
      id: 1,
      data: defaultData,
      updated_at: new Date().toISOString(),
    });

    return defaultData;
  }

  const normalized = normalizeData(data.data);

  if (
    !Array.isArray(data.data?.categories) ||
    data.data.categories.length === 0 ||
    !Array.isArray(data.data?.areas)
  ) {
    await saveData(normalized);
  }

  return normalized;
}

async function saveData(newData: any) {
  const supabase = getSupabase();

  const { error } = await supabase.from("admin_data").upsert({
    id: 1,
    data: normalizeData(newData),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function GET() {
  try {
    const data = await getData();

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const oldData = await getData();

    const data = {
      banners: body.banners ?? oldData.banners,
      categories: body.categories ?? oldData.categories,
      products: body.products ?? oldData.products,
      orders: body.orders ?? oldData.orders,
      serviceRequests: body.serviceRequests ?? oldData.serviceRequests,
      serviceOptions: body.serviceOptions ?? oldData.serviceOptions,
      coupons: body.coupons ?? oldData.coupons,
      customers: body.customers ?? oldData.customers,
      referrals: body.referrals ?? oldData.referrals,
      areas: body.areas ?? oldData.areas,
      notificationSettings:
        body.notificationSettings ??
        oldData.notificationSettings ??
        defaultNotificationSettings,
    };

    await saveData(data);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save data" },
      { status: 500 }
    );
  }
}
