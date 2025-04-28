import { runTransaction, collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../Config';

export const createOrder = async (orderData) => {
  const userId = orderData.userId;

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const counterRef = doc(db, 'counters', 'orders');
    const orderId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let newId = 1;
      if (counterDoc.exists()) {
        newId = counterDoc.data().count + 1;
      }
      transaction.set(counterRef, { count: newId });
      return newId;
    });

    const order = {
      orderId, 
      userId,
      fullName: orderData.fullName,
      address: orderData.address,
      phoneNumber1: orderData.phoneNumber1,
      phoneNumber2: orderData.phoneNumber2 || '',
      totalPrice: orderData.totalPrice,
      paymentMethod: orderData.paymentMethod,
      items: orderData.items || [],
      createdAt: Timestamp.fromDate(new Date()),
      status: 'pending' 
    };

    const orderRef = doc(db, 'orders', orderId.toString());
    await setDoc(orderRef, order);

    console.log('Order created successfully with ID:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const approveOrder = async (orderId) => {
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId.toString());
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const order = orderDoc.data();

      transaction.update(orderRef, { status: 'approved' });

      for (const item of order.items) {
        const productRef = doc(db, 'products', item.id);
        const productDoc = await transaction.get(productRef);

        if (productDoc.exists()) {
          const currentStock = productDoc.data().inStock || 0;
          const newStock = currentStock - item.quantity;

          if (newStock < 0) {
            throw new Error(`Not enough stock for product ${item.name}`);
          }

          transaction.update(productRef, { inStock: newStock });
        }
      }
    });

    console.log(`Order ${orderId} approved and stock updated`);
    return true;
  } catch (error) {
    console.error('Error approving order:', error);
    throw error;
  }
};

export const getOrdersByUserId = async (userId) => {
  try {
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(ordersQuery);
    const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return orders;
  } catch (err) {
    throw new Error('Error fetching orders: ' + err.message);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
    });
    return 'Order status updated successfully';
  } catch (err) {
    throw new Error('Error updating order status: ' + err.message);
  }
};
