import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Nivito - Fresh Groceries & Home Services",
  description: "Order fresh fruits, vegetables, dairy & book trusted home services (AC, RO, Mobile Repair, Cleaning) at your doorstep. Call 9873513566.",
  keywords: "grocery delivery, home services, AC service, RO water, fresh vegetables, Nivito, Noida",
  openGraph: {
    title: "Nivito - Fresh Groceries & Home Services",
    description: "Fresh daily essentials + trusted home services delivered fast.",
    url: "https://nivito.in",
    siteName: "Nivito",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}