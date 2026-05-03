import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, mobile_number, created_at")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "Customers fetch failed", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers: data });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, mobile_number, password } = body;

    if (!full_name || !mobile_number || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile_number).trim();

    const { data: existing, error: checkError } = await supabase
      .from("customers")
      .select("id")
      .eq("mobile_number", cleanMobile)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { message: "User check failed", error: checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { message: "Mobile number already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase.from("customers").insert({
      full_name: String(full_name).trim(),
      mobile_number: cleanMobile,
      password: hashedPassword,
    });

    if (error) {
      return NextResponse.json(
        { message: "Signup failed", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Signup successful" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}