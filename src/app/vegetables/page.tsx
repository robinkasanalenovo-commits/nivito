"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

type ProductVariant = {
  id: number;
  weight: string;
  sellingPrice: number;
  stock: number;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  image: string;
  category: string;
  active: boolean;
  variants: ProductVariant[];
};

type AdminDataResponse = {
  products?: Product[];
};

export default function VegetablesPage() {
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, ProductVariant>
  >({});

  useEffect(() => {
    const loadProducts = async () => {
      const res = await fetch("/api/admin-data", { cache: "no-store" });
      const data: AdminDataResponse = await res.json();

      const vegProducts = (data.products || [])
        .filter((product) => product.category === "vegetables")
        .filter((product) => product.active)
        .map((product) => ({
          ...product,
          variants: (product.variants || []).filter(
            (variant) => variant.active
          ),
        }))
        .filter((product) => product.variants.length > 0);

      setProducts(vegProducts);

      const defaultVariants: Record<number, ProductVariant> = {};
      vegProducts.forEach((product) => {
        defaultVariants[product.id] = product.variants[0];
      });

      setSelectedVariants(defaultVariants);
    };

    loadProducts();
  }, []);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getCartId = (productId: number, variantId: number) => {
    return productId * 1000000 + (variantId % 1000000);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] pb-24">
      <div className="sticky top-0 z-10 bg-[#f7f4ee] px-3 pb-2 pt-3">
        <div className="rounded-3xl bg-orange-500 px-4 py-4 text-white shadow-md">
          <h1 className="text-2xl font-extrabold">Vegetables</h1>
          <p className="mt-1 text-sm text-orange-50">
            Fresh daily vegetables
          </p>
        </div>
      </div>

      <div className="px-3 pb-3">
        {products.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center text-sm font-semibold text-gray-500 shadow-sm">
            अभी कोई product available नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const selectedVariant =
                selectedVariants[product.id] || product.variants[0];

              const cartId = getCartId(product.id, selectedVariant.id);

              const cartItem = cart.find((item) => item.id === cartId);
              const qty = cartItem?.quantity ?? 0;

              return (
                <div
                  key={product.id}
                  className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
                >
                  <div className="px-3 pt-3">
                    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#fff7ed]">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-5xl">🥦</span>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3 pt-3">
                    <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-5 text-gray-900">
                      {product.name}
                    </h3>

                    <select
                      value={selectedVariant.id}
                      onChange={(e) => {
                        const variant = product.variants.find(
                          (item) => item.id === Number(e.target.value)
                        );

                        if (!variant) return;

                        setSelectedVariants({
                          ...selectedVariants,
                          [product.id]: variant,
                        });
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                    >
                      {product.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.weight} ₹{variant.sellingPrice}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-extrabold text-gray-900">
                          ₹{selectedVariant.sellingPrice}
                        </p>

                        {selectedVariant.stock <= 0 ? (
                          <p className="text-[11px] font-bold text-red-500">
                            Out of stock
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-green-600">
                            In stock
                          </p>
                        )}
                      </div>

                      {selectedVariant.stock <= 0 ? (
                        <button
                          disabled
                          className="h-10 min-w-[82px] rounded-xl bg-gray-200 px-4 text-sm font-bold text-gray-500"
                        >
                          OUT
                        </button>
                      ) : qty === 0 ? (
                        <button
                          onClick={() =>
                            addToCart({
                              id: cartId,
                              name: `${product.name} - ${selectedVariant.weight}`,
                              price: selectedVariant.sellingPrice,
                            })
                          }
                          className="h-10 min-w-[82px] rounded-xl bg-green-500 px-4 text-sm font-bold text-white shadow-sm active:scale-95"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex h-10 items-center gap-2 rounded-xl bg-green-500 px-2 text-white shadow-sm">
                          <button
                            onClick={() => decreaseQty(cartId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-base font-bold"
                          >
                            -
                          </button>

                          <span className="min-w-[16px] text-center text-sm font-bold">
                            {qty}
                          </span>

                          <button
                            onClick={() => increaseQty(cartId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-base font-bold"
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
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t border-orange-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 py-3 text-center text-xs font-semibold text-gray-700">
          <Link href="/" className="flex flex-col items-center">
            <div className="text-lg">🏠</div>
            <p>Home</p>
          </Link>

          <Link
            href="/vegetables"
            className="flex flex-col items-center text-orange-600"
          >
            <div className="text-lg">📂</div>
            <p>Category</p>
          </Link>

          <Link href="/cart" className="relative flex flex-col items-center">
            <div className="text-lg">🛒</div>

            {cartCount > 0 && (
              <span className="absolute right-5 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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