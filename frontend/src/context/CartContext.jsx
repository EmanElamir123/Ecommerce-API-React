import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cartItems";

/**
 * عربة التسوق بتتخزن بالكامل في المتصفح (localStorage) لحد ما المستخدم
 * يعمل Checkout، وقتها بنبعت البيانات دي للـ API عشان ننشئ الطلب فعليًا.
 * كل عنصر في العربة شكله: { product, quantity }
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const maxQty = product.stock ?? 99;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, maxQty) }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock ?? 99)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    [items]
  );

  const value = { items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart لازم يتستخدم جوه CartProvider");
  return ctx;
}
