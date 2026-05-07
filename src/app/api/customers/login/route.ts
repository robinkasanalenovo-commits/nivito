import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile_number, password } = body;

    if (!mobile_number || !password) {
      return NextResponse.json(
        { message: "Mobile number aur password required hai" },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile_number).trim();

    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { message: "Mobile number 10 digits ka hona chahiye" },
        { status: 400 }
      );
    }

   const { data: customer, error } = await supabase
  .from("customers")
  .select("id, full_name, mobile_number, password, area, sub_area, address, landmark, full_address, created_at")
  .eq("mobile_number", cleanMobile)
  .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: "Login check failed", error: error.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { message: "Mobile number registered nahi hai" },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Password galat hai" },
        { status: 401 }
      );
    }

   const safeCustomer = {
  id: customer.id,
  full_name: customer.full_name,
  mobile_number: customer.mobile_number,
  area: customer.area || "",
  sub_area: customer.sub_area || "",
  address: customer.address || "",
  landmark: customer.landmark || "",
  full_address: customer.full_address || [
    customer.area,
    customer.sub_area,
    customer.address,
    customer.landmark ? `Landmark: ${customer.landmark}` : "",
  ].filter((v) => v && String(v).trim()).join(", "),
  created_at: customer.created_at,
};

    return NextResponse.json({
      message: "Login successful",
      customer: safeCustomer,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}