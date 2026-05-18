import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  try {
    const order = await req.json();

    if (!order?.customerMobile || !order?.address || !Array.isArray(order?.items)) {
      return NextResponse.json(
        { success: false, message: "Order details incomplete hain" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admin_data")
      .select("data")
      .eq("id", 1)
      .single();

    if (error) throw error;

    const oldData = data?.data || {};
    const currentOrders = Array.isArray(oldData.orders) ? oldData.orders : [];
    const newOrder = {
      ...order,
      id: order.id || Date.now(),
      orderId: order.orderId || `NIV-${Date.now()}`,
      paymentStatus: order.paymentStatus || "Pending",
      orderStatus: order.orderStatus || "Placed",
      createdAt: order.createdAt || new Date().toISOString(),
    };

    const { error: saveError } = await supabase.from("admin_data").upsert({
      id: 1,
      data: { ...oldData, orders: [newOrder, ...currentOrders] },
      updated_at: new Date().toISOString(),
    });

    if (saveError) throw saveError;

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Order save nahi hua" },
      { status: 500 }
    );
  }
}
