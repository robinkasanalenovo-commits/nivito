import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile")?.trim();

    if (!mobile || mobile.length !== 10) {
      return NextResponse.json(
        { message: "Mobile number required" },
        { status: 400 }
      );
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, full_name, mobile_number, area, sub_area, address, landmark, full_address, created_at")
      .eq("mobile_number", mobile)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: "Customer fetch failed", error: error.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        ...customer,
        full_address:
          customer.full_address ||
          [
            customer.area,
            customer.sub_area,
            customer.address,
            customer.landmark ? `Landmark: ${customer.landmark}` : "",
          ]
            .filter((value) => value && String(value).trim())
            .join(", "),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
