import { useEffect, useState } from "react";
import { db } from "../Config";
import { doc, onSnapshot } from "firebase/firestore";

export const useCart = (userId) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setCart([]);
      return;
    }

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        try {
          if (!docSnapshot.exists()) {
            setCart([]);
            setLoading(false);
            return;
          }

          const userData = docSnapshot.data();
          
          // التحقق من وجود السلة وهيكلتها
          if (!userData.cart || !Array.isArray(userData.cart)) {
            console.warn("Cart data is missing or not an array");
            setCart([]);
            setLoading(false);
            return;
          }

          const processedCart = userData.cart
            .filter(item => item && item.id) // تأكد من وجود العناصر الأساسية
            .map(item => ({
              id: item.id,
              name: item.name || 'Unnamed Product',
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              image: item.image || '/images/no-image.png',
              inStock: Number(item.inStock) || 0,
              ...item
            }));

          console.log("Processed cart items:", processedCart); // لأغراض التصحيح
          setCart(processedCart);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error processing cart data:", err);
          setError("Failed to process cart data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error in snapshot listener:", err);
        setError("Failed to connect to cart service");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return { 
    cartItems: cart, 
    loading, 
    error, 
    total: parseFloat(total.toFixed(2)),
    itemCount 
  };
};