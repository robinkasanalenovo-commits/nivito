import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://nivito.in"),
  title: {
    default: "Nivito - Fresh Groceries & Home Services",
    template: "%s | Nivito",
  },
  description:
    "Order fresh fruits, vegetables, dairy products and trusted home services in Noida.",
  keywords: [
    "Nivito",
    "grocery delivery Noida",
    "fresh vegetables",
    "fresh fruits",
    "dairy products",
    "AC service",
    "RO service",
    "mobile repair",
    "home cleaning",
  ],
  openGraph: {
    title: "Nivito - Fresh Groceries & Home Services",
    description: "Fresh groceries and trusted home services at your doorstep.",
    url: "/",
    siteName: "Nivito",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
