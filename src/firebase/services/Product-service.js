import { collection, deleteDoc, doc, getDocs, addDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "../Config";

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addProduct = async (product) => {
  const docRef = await addDoc(collection(db, "products"), product);
  console.log('Product added:', { id: docRef.id, ...product }); // سجل تجريبي
  return { id: docRef.id, ...product }; 
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, "products", id));
  console.log('Product deleted:', id); 
};

export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const getProductsByCategory = async (category, excludeId = null) => {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category)
    );
    const snapshot = await getDocs(q);
    const products = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id !== excludeId) {
        products.push({ id: doc.id, ...data });
      }
    });
    return products;
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
};