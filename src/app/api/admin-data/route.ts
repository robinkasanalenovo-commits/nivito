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

const defaultData = {
  banners: [],
  categories: [],
  products: [],
  orders: [],
  customers: [],
  referrals: [],
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
    categories: data?.categories || [],
    products: data?.products || [],
    orders: data?.orders || [],
    customers: data?.customers || [],
    referrals: data?.referrals || [],
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

  return normalizeData(data.data);
}

async function saveData(newData: any) {
  const supabase = getSupabase();

  const { error } = await supabase.from("admin_data").upsert({
    id: 1,
    data: normalizeData(newData),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

export async function GET() {
  try {
    const data = await getData();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load data",
      },
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
      customers: body.customers ?? oldData.customers,
      referrals: body.referrals ?? oldData.referrals,
      notificationSettings:
        body.notificationSettings ??
        oldData.notificationSettings ??
        defaultNotificationSettings,
    };

    await saveData(data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to save data",
      },
      { status: 500 }
    );
  }
}