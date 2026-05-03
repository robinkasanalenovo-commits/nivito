"use client";

import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function DairyPage() {
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const dairyItems = products.filter((item) => item.category === "dairy");
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#fff7ed] pb-24">
      <div className="p-4">
        <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-md">
          <h1 className="text-xl font-bold">Dairy</h1>
          <p className="text-xs mt-1">Fresh milk and dairy items</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4">
          {dairyItems.map((item) => {
            const cartItem = cart.find((x) => x.id === item.id);
            const qty = cartItem?.quantity ?? 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 shadow-md border border-orange-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {item.name}
                    </p>

                    <p className="text-xs mt-1 font-bold text-orange-600">
                      ₹{item.price}
                    </p>

                    <p className="text-[11px] text-gray-500 mt-1">
                      Added: {qty}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {qty === 0 ? (
                      <button
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                          })
                        }
                        className="w-[72px] h-9 bg-orange-500 text-white text-xs font-bold rounded-lg"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-orange-50 px-1 py-1 rounded-lg border border-orange-200">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="w-7 h-7 rounded bg-orange-100 text-orange-700 font-bold text-sm"
                        >
                          -
                        </button>

                        <span className="min-w-[20px] text-center text-xs font-bold text-orange-700">
                          {qty}
                        </span>

                        <button
                          onClick={() => increaseQty(item.id)}
                          className="w-7 h-7 rounded bg-orange-500 text-white font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-orange-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 text-center py-3 text-xs font-semibold text-gray-700">
          <Link href="/" className="flex flex-col items-center">
            <div className="text-lg">🏠</div>
            <p>Home</p>
          </Link>

          <Link
            href="/dairy"
            className="flex flex-col items-center text-orange-600"
          >
            <div className="text-lg">📂</div>
            <p>Category</p>
          </Link>

          <Link href="/cart" className="flex flex-col items-center relative">
            <div className="text-lg">🛒</div>

            {cartCount > 0 && (
              <span className="absolute -top-1 right-5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}

            <p>Cart</p>
          </Link>

          <Link href="#" className="flex flex-col items-center">
            <div className="text-lg">👤</div>
            <p>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}