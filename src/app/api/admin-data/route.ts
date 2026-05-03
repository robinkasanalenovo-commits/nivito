import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "admin-data.json");

const defaultNotificationSettings = {
  title: "",
  message: "",
  active: false,
  showPopup: true,
  updatedAt: 0,
};

async function getData() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const file = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(file);

    return {
      banners: parsed.banners || [],
      categories: parsed.categories || [],
      products: parsed.products || [],
      orders: parsed.orders || [],
      customers: parsed.customers || [],
      referrals: parsed.referrals || [],
      notificationSettings:
        parsed.notificationSettings || defaultNotificationSettings,
    };
  } catch {
    const defaultData = {
      banners: [],
      categories: [],
      products: [],
      orders: [],
      customers: [],
      referrals: [],
      notificationSettings: defaultNotificationSettings,
    };

    await fs.writeFile(dataFile, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

async function saveData(data: any) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
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
}