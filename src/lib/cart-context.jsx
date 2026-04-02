"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "tox_cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCartItems(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  function addToCart(product, quantity) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          reference: product.reference,
          name: product.name,
          pricePerPack: product.pricePerPack,
          quantityPerPack: product.quantityPerPack,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(id, quantity) {
    const q = Math.max(1, quantity);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: q } : item)),
    );
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
