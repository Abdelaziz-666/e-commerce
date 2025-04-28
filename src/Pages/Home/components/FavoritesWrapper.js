import React, { useEffect, useState } from 'react';
import { getProducts } from '../../../firebase/services/Product-service';
import Favorites from '../../Favorites';

const FavoritesWrapper = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts); // تأكد من أن المنتجات تتضمن id فريد
  }, []);

  return <Favorites products={products} />;
};

export default FavoritesWrapper;
