import { Offcanvas, ListGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import { Button } from 'react-bootstrap';

const Sidebar = ({ showSidebar, setShowSidebar, onFilterChange }) => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [discountRanges, setDiscountRanges] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    price: null,
    category: null,
    discount: null
  });

  useEffect(() => {
    const fetchFilters = async () => {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => doc.data());

      const allCategories = [...new Set(products.map(p => p.category))];
      setCategories(allCategories);

      const prices = products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceStep = Math.ceil((maxPrice - minPrice) / 4);

      const ranges = [];
      for (let i = minPrice; i < maxPrice; i += priceStep) {
        const max = i + priceStep > maxPrice ? maxPrice : i + priceStep;
        ranges.push({ label: `${i} - ${max}`, min: i, max });
      }
      setPriceRanges(ranges);

      const discounts = products.map(p => p.discount || 0);
      const minDiscount = Math.min(...discounts);
      const maxDiscount = Math.max(...discounts);
      const discountStep = Math.ceil((maxDiscount - minDiscount) / 3);

      const discountRangeList = [];
      for (let i = minDiscount; i < maxDiscount; i += discountStep) {
        const max = i + discountStep > maxDiscount ? maxDiscount : i + discountStep;
        discountRangeList.push({ label: `${i}% - ${max}%`, min: i, max });
      }
      setDiscountRanges(discountRangeList);
    };

    fetchFilters();
  }, []);

  const handlePriceFilter = (min, max) => {
    const newFilters = { 
      ...selectedFilters, 
      price: selectedFilters.price?.min === min && selectedFilters.price?.max === max ? null : { min, max }
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
    updateURL(newFilters);
  };

  const handleCategoryFilter = (category) => {
    const newFilters = { 
      ...selectedFilters, 
      category: selectedFilters.category === category ? null : category
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
    updateURL(newFilters);
  };

  const handleDiscountFilter = (min, max) => {
    const newFilters = { 
      ...selectedFilters, 
      discount: selectedFilters.discount?.min === min && selectedFilters.discount?.max === max ? null : { min, max }
    };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (filters) => {
    const params = new URLSearchParams();
    
    if (filters.price) {
      params.append('priceMin', filters.price.min);
      params.append('priceMax', filters.price.max);
    }
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.discount) {
      params.append('discountMin', filters.discount.min);
      params.append('discountMax', filters.discount.max);
    }
    
    navigate(`/filtered-products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const newFilters = { price: null, category: null, discount: null };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
    navigate('/filtered-products');
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: showSidebar ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#fff',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.3)',
        zIndex: 999,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start" scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Filters</h5>
            <Button 
              variant="link" 
              onClick={handleClearFilters}
              className="text-decoration-none p-0"
            >
              Clear All
            </Button>
          </div>

          <div className="mt-3">
            <h6 className="mb-3">Price Range</h6>
            <ListGroup>
              {priceRanges.map((range, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  onClick={() => handlePriceFilter(range.min, range.max)}
                  className="filter-item"
                  active={selectedFilters.price?.min === range.min && selectedFilters.price?.max === range.max}
                >
                  {range.label}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          <div className="mt-4">
            <h6 className="mb-3">Categories</h6>
            <ListGroup>
              {categories.map((category, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  onClick={() => handleCategoryFilter(category)}
                  className="filter-item"
                  active={selectedFilters.category === category}
                >
                  {category}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          <div className="mt-4">
            <h6 className="mb-3">Discount Range</h6>
            <ListGroup>
              {discountRanges.map((range, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  onClick={() => handleDiscountFilter(range.min, range.max)}
                  className="filter-item"
                  active={selectedFilters.discount?.min === range.min && selectedFilters.discount?.max === range.max}
                >
                  {range.label}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </motion.div>
  );
};

export default Sidebar;