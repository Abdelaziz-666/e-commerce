import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Badge, Alert, Spinner, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/Config";
import { useNavigate, useSearchParams } from "react-router-dom";
import useFavorites from "../firebase/services/Favorites-service";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function FilteredProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  const navigate = useNavigate();

  const { favorites, toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  useEffect(() => {
    if (user) fetchQuantities();
  }, [user, products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
        setFilteredProducts(productList);

        const allCategories = [...new Set(productList.map(p => p.category))];
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const fetchQuantities = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const cart = userData.cart || [];

    const updatedQuantities = {};
    for (let product of products) {
      const item = cart.find(i => i.id === product.id);
      updatedQuantities[product.id] = item ? item.quantity : 0;
    }
    setQuantities(updatedQuantities);
  };

  const addToCart = async (userId, product) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User document doesn't exist");
      }

      const userData = userDoc.data();
      const cart = userData.cart || [];
      
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity = product.quantity;
      } else {
        cart.push(product);
      }

      await updateDoc(userRef, { cart });
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const handleAddToCart = async (productId, discountedPrice) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    setErrors(prev => ({ ...prev, [productId]: null }));

    try {
      const productToAdd = products.find(p => p.id === productId);
      if (!productToAdd) {
        throw new Error("Product not found");
      }

      const currentQuantity = quantities[productId] || 0;
      
      if (currentQuantity >= productToAdd.stock) {
        throw new Error("Maximum stock reached");
      }

      await addToCart(user.uid, {
        ...productToAdd,
        quantity: currentQuantity + 1,
        price: discountedPrice
      });

      setQuantities(prev => ({
        ...prev,
        [productId]: currentQuantity + 1
      }));

      setAlertMessage(`Added To Cart`);
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [productId]: error.message
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const category = searchParams.get('category');
    const discountMin = searchParams.get('discountMin');
    const discountMax = searchParams.get('discountMax');

    let filtered = [...products];

    if (priceMin && priceMax) {
      filtered = filtered.filter(p => 
        p.price >= Number(priceMin) && p.price <= Number(priceMax)
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.category === category);
      setSelectedCategory(category);
    } else {
      setSelectedCategory("all");
    }

    if (discountMin && discountMax) {
      filtered = filtered.filter(p => 
        (p.discount || 0) >= Number(discountMin) && 
        (p.discount || 0) <= Number(discountMax)
      );
    }

    setFilteredProducts(filtered);
  }, [searchParams, products]);

  const handleFilterChange = (filters) => {
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

  const fallbackImage = "/images/no-image.png";

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container my-5">
      {alertMessage && (
        <Alert variant="success" onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      <div className="mb-4 text-center">
        <Form.Select
          value={selectedCategory}
          onChange={(e) => {
            const newCategory = e.target.value;
            setSelectedCategory(newCategory);
            
            const params = new URLSearchParams(searchParams.toString());
            
            if (newCategory === "all") {
              params.delete('category');
            } else {
              params.set('category', newCategory);
            }
            
            navigate(`/filtered-products?${params.toString()}`);
          }}
          style={{ maxWidth: "300px", margin: "0 auto" }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Form.Select>
      </div>

      {favoritesLoading && (
        <div className="text-center py-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <h4>No products found matching your filters</h4>
          <Button 
            variant="primary" 
            onClick={() => navigate('/filtered-products')}
            className="mt-3"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <Row className="justify-content-center g-0">
          {filteredProducts.map((product) => {
            const loading = loadingStates[product.id];
            const error = errors[product.id];
            const currentQuantity = quantities[product.id] || 0;

            const discountedPrice = product.discount
              ? parseFloat(product.price) * (1 - product.discount / 100)
              : parseFloat(product.price);

            const price = isNaN(discountedPrice) ? 0 : discountedPrice.toFixed(2);

            return (
              <Col key={product.id} xs={10} sm={6} md={4} lg={3}>
                <motion.div
                  className="h-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="product-card shadow-sm h-100 border-0 position-relative">
                    <Button
                      variant="link"
                      className="position-absolute top-0 end-0 m-2 p-0"
                      onClick={() => toggleFavorite(product)}
                      disabled={favoritesLoading}
                      style={{ zIndex: 5 }}
                    >
                      {isFavorite(product.id) ? (
                        <FaHeart style={{ color: 'red', fontSize: '1.4rem' }} />
                      ) : (
                        <FaRegHeart style={{ color: '#000', fontSize: '1.4rem', textShadow: '0 0 3px #000' }} />
                      )}
                    </Button>

                    <Card.Img
                      variant="top"
                      src={product.mainImage || fallbackImage}
                      alt={product.name}
                      style={{ height: '200px', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = fallbackImage }}
                    />

                    {product.inStock <= 0 && (
                      <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
                        Out of stock
                      </Badge>
                    )}
                    {product.inStock > 0 && product.discount > 0 && (
                      <Badge bg="success" className="position-absolute top-0 start-0 m-2">
                        {product.discount}% OFF
                      </Badge>
                    )}

                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fs-6 text-truncate">{product.name}</Card.Title>
                      <Card.Text className="text-muted mb-1">{product.size}</Card.Text>
                      <Card.Text className="fw-bold">{product.time}</Card.Text>
                      <div className="mt-auto">
                        <div className="mb-2">
                          {product.discount > 0 ? (
                            <>
                              <span className="text-muted text-decoration-line-through me-2">
                                {parseFloat(product.price).toFixed(2)}$
                              </span>
                              <span className="text-danger fw-bold">
                                {price}$
                              </span>
                            </>
                          ) : (
                            <span className="fw-bold">{price}$</span>
                          )}
                        </div>

                        {error && <Alert variant="danger" className="py-1">{error}</Alert>}

                        <div className="d-flex gap-2">
                          <Button
                            variant={loading ? 'success' : currentQuantity >= product.inStock ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => handleAddToCart(product.id, discountedPrice)}
                            disabled={loading || currentQuantity >= product.inStock}
                            className="flex-grow-1"
                          >
                            {loading ? (
                              <Spinner size="sm" animation="border" />
                            ) : currentQuantity >= product.inStock ? (
                              `Max in stock : ${product.inStock}`
                            ) : (
                              'Add to cart'
                            )}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default FilteredProducts;
