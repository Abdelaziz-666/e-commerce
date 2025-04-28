import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/Config';

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        // جلب جميع التصنيفات الفريدة التي تحتوي على منتجات
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const categoriesWithProducts = new Set();
        
        productsSnapshot.forEach(doc => {
          const product = doc.data();
          if (product.category) {
            categoriesWithProducts.add(product.category);
          }
        });

        // تحويل الـ Set إلى مصفوفة من التصنيفات
        const uniqueCategories = Array.from(categoriesWithProducts).map(category => ({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          icon: getCategoryIcon(category)
        }));

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, []);

  const getCategoryIcon = (categoryName) => {
    // يمكنك تخصيص الأيقونات حسب التصنيفات لديك
    switch(categoryName.toLowerCase()) {
      case 'electronics': return '📱';
      case 'clothing': return '👕';
      case 'books': return '📚';
      default: return '🛒';
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <section className="my-5">
        <h2 className="text-center mb-4">{t('categories.title')}</h2>
        <div className="text-center">Loading categories...</div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="my-5">
        <h2 className="text-center mb-4">{t('categories.title')}</h2>
        <div className="text-center text-muted">No categories with products available yet</div>
      </section>
    );
  }

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">{t('categories.title')}</h2>
      <Row className="px-4">
        {categories.map(category => (
          <Col key={category.id} md={4} className="mb-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="text-center p-4 cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                <Card.Body>
                  <Card.Title>{category.name}</Card.Title>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default Categories;