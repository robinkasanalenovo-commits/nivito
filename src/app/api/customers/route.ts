import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      full_name,
      mobile_number,
      password,
      area,
      sub_area,
      subArea,
      address,
      landmark,
    } = body;

    const finalSubArea = sub_area || subArea || "";

    if (!full_name || !mobile_number || !password) {
      return NextResponse.json(
        { message: "Name, mobile, password required" },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile_number).trim();

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const { error } = await supabase.from("customers").insert({
  full_name: String(full_name).trim(),
  mobile_number: cleanMobile,
  password: hashedPassword,
  area: area || "",
  sub_area: finalSubArea,
  address: address || "",
  landmark: landmark || "",
  full_address: body.full_address || "",
  created_at: new Date().toISOString(),
});

    if (error) {
      return NextResponse.json(
        { message: "Signup failed", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Signup successful ✅" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Server error", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "Customers fetch failed", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Server error", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
