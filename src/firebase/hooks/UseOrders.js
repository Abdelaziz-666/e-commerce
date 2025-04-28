import { useState, useEffect } from 'react';
import { db } from '../Config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      const ordersList = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  };

  return { orders, updateOrderStatus };
};
