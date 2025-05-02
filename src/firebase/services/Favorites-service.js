import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../Config';


const useFavorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        if (!user) {
          setFavorites([]);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setFavorites(snap.data().favorites || []);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const toggleFavorite = async (product) => {
    if (!user || !product) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const isFav = isFavorite(product.id);

      if (isFav) {
        const favoriteToRemove = favorites.find(fav => fav.id === product.id);
        await updateDoc(userRef, {
          favorites: arrayRemove(favoriteToRemove),
        });
        setFavorites(favorites.filter(fav => fav.id !== product.id));
      } else {
        const { id, name, price, mainImage } = product;
        if (id && name && price !== undefined) {
          const newFavorite = { 
            id, 
            name, 
            price, 
            mainImage: mainImage || '/images/no-image.png',
            // Add any other necessary fields
          };
          await updateDoc(userRef, {
            favorites: arrayUnion(newFavorite),
          });
          setFavorites([...favorites, newFavorite]);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error toggling favorite:", err);
    }
  };

  return { favorites, toggleFavorite, isFavorite, loading, error };
};

export default useFavorites;

export const addToFavorites = async (userId, product) => {
    const userRef = doc(db, 'users', userId);
    const newFavorite = {
      id: product.id || Date.now(),  
      name: product.name,
      price: product.price,
      mainImage: product.mainImage || '/images/no-image.png'
    };

    await updateDoc(userRef, {
      favorites: arrayUnion(newFavorite)
    });
    console.log('Added to favorites:', product);
};

export const removeFromFavorites = async (userId, productId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const favoriteToRemove = userData.favorites?.find(fav => fav.id === productId);

      if (favoriteToRemove) {
        await updateDoc(userRef, {
          favorites: arrayRemove(favoriteToRemove)
        });
        console.log('Removed from favorites:', favoriteToRemove); // سجل تجريبي
      }
    }
};

export const checkFavoriteStatus = async (userId, productId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.favorites?.some(fav => fav.id === productId) || false;
    }
    return false;
};

export const getFavoriteProducts = async (userId, allProducts) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const favoriteIds = snap.data().favorites || [];
    return allProducts.filter(product => favoriteIds.includes(product.id));
  }
  return [];
};