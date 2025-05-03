import React, { useEffect, useState } from 'react';
import { Spinner, Container } from 'react-bootstrap';
import { getProducts, getCategories } from '../../firebase/services/Product-service';
import NewArrivalsSlider from './components/HomePage.js/NewArrivalsSlider';
import Categories from './components/HomePage.js/Categories';
import NewCollection from './components/HomePage.js/NewCollection';
import NewCollectionSlider from './components/HomePage.js/NewCollectionSlider';
import AllCollectionsText from './components/HomePage.js/AllCollectionsText';
import AllCollections from './components/HomePage.js/AllCollections';
import Sidebar from '../../components2/Sidebar';
import Favorites from '../Favorites';

// ✅ استدعاء الفوتر
import Footer from './components/HomePage.js/Footer';

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
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const heroProducts = products.filter(p => 
    p?.displayLocations?.includes('hero') || 
    p?.sections?.includes('hero')
  );

  const newArrivalsProducts = products.filter(p => 
    p?.displayLocations?.includes('new_arrivals') || 
    p?.sections?.includes('new-arrivals')
  );

  const regularProducts = products.filter(p => 
    !p?.displayLocations?.includes('hero') && 
    !p?.displayLocations?.includes('new_arrivals') &&
    p?.section !== 'hero' &&
    p?.section !== 'new-arrival'
  );

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading products...</p>
      </Container>
    );
  }

  return (
    <div className="home-page">
      <NewArrivalsSlider 
        products={heroProducts} 
        title="Featured Products"
      />
      
      <Categories categories={categories} products={products} />      
      <NewCollection />
      
      <NewCollectionSlider 
        products={newArrivalsProducts}
        title="New Arrivals"
      />
      
      <AllCollectionsText />
      
      <AllCollections 
        title="All Products" 
        products={products} 
      />
      
      <Sidebar products={products} />

      {/* ✅ إضافة الفوتر هنا */}
      <Footer />
    </div>
  );
};

export default Home;
