import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile")?.trim();

    if (!mobile || mobile.length !== 10) {
      return NextResponse.json({ orders: [] });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admin_data")
      .select("data")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Orders fetch failed", orders: [] },
        { status: 500 }
      );
    }

    const orders = Array.isArray(data?.data?.orders) ? data.data.orders : [];
    const customerOrders = orders
      .filter((order: any) => String(order.customerMobile || "").trim() === mobile)
      .slice(0, 20);

    return NextResponse.json(
      { orders: customerOrders },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { message: "Orders fetch failed", orders: [] },
      { status: 500 }
    );
  }
}
