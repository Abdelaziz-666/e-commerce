import { useState, useEffect } from 'react';
import { db } from '../Config';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      setProducts(productsList);
    };
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
    setProducts(products.filter(product => product.id !== id));
  };

  return { products, deleteProduct };
};