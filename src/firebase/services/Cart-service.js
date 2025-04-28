import { db } from "../Config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export const addToCart = async (userId, product) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    let cart = [];
    if (userDoc.exists()) {
      cart = userDoc.data().cart || [];
    }

    if (!product.id || product.id === "no-id" || !product.name || !product.price) {
      console.error("Error: Product data is incomplete", product);
      return;
    }

    if (product.quantity > product.inStock) {
      console.error(`Error: Not enough stock for product ${product.name}. Only ${product.inStock} available.`);
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      if (cart[existingItemIndex].quantity + 1 > product.inStock) {
        console.error(`Error: Not enough stock for product ${product.name}. Only ${product.inStock} available.`);
        return;
      }
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/images/no-image.png',
        quantity: 1,
        ...product
      });
    }

    const validCart = cart.filter(item => item.id && item.price !== undefined);

    await updateDoc(userRef, { cart: validCart });

  } catch (err) {
    console.error("Error adding to cart:", err);
    throw err;
  }
};



export const updateCartItem = async (userId, productId, newQuantity) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const cart = docSnap.data().cart || [];
      const updatedCart = cart.map(item => 
        item.id === productId && newQuantity > 0 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      await updateDoc(userRef, { cart: updatedCart });
      console.log('Updated cart:', updatedCart);
    }
  } catch (err) {
    console.error("Error updating cart item:", err);
    throw err;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const cart = docSnap.data().cart || [];
      const updatedCart = cart.filter(item => item.id !== productId);
      await updateDoc(userRef, { cart: updatedCart });
      console.log('Cart after removal:', updatedCart); // سجل تجريبي
    }
  } catch (err) {
    console.error("Error removing from cart:", err);
    throw err;
  }
};


export const clearCart = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }

    await updateDoc(userRef, {
      cart: [] // نفريغ array السلة مباشرة في مستند المستخدم
    });
    
    console.log('Cart cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};



export const getCart = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      return {
        id: cartSnap.id,
        ...cartSnap.data()
      };
    } else {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};