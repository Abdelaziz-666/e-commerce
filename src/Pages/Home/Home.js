import React, { useEffect, useState } from 'react';
import { Spinner, Container } from 'react-bootstrap';
import { getProducts, getCategories } from '../../firebase/services/Product-service';
import NewArrivalsSlider from './components/HomePage.js/NewArrivalsSlider';
import NewArrivals from './components/HomePage.js/NewArrivals';
import Categories from './components/HomePage.js/Categories';
import NewCollection from './components/HomePage.js/NewCollection';
import NewCollectionSlider from './components/HomePage.js/NewCollectionSlider';
import AllCollectionsText from './components/HomePage.js/AllCollectionsText';
import AllCollections from './components/HomePage.js/AllCollections';
import Sidebar from '../../components2/Sidebar';
import Favorites from '../Favorites';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(fetchedProducts || []);
        setCategories(fetchedCategories || []);
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="home-page">
      <NewArrivals />
      <NewArrivalsSlider products={products.filter(p => p?.section === 'hero')} />
      <Categories 
        categories={categories} 
       
      />
      <NewCollection />
      <NewCollectionSlider products={products.filter(p => p?.isOnSale)} />
      <AllCollectionsText />
      <AllCollections title="all products" products={products} />
      <Sidebar products = {products} />

   </div>
  );
};

export default Home;