import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Badge, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../../firebase/Config';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useFavorites from '../../../../firebase/services/Favorites-service';
import { addToCart } from '../../../../firebase/services/Cart-service';

const AllCollections = ({ products }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingStates, setLoadingStates] = useState({});
  const [quantities, setQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const fallbackImage = "/images/no-image.png";

  const handleShowMore = () => setVisibleCount(prev => prev + 8);

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

  useEffect(() => {
    if (user) fetchQuantities();
  }, [user, products]);

  const handleAddToCart = async (productId, discountedPrice) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd || !productToAdd.id) return;

    const currentQuantity = quantities[productId] || 0;

    if (currentQuantity >= productToAdd.inStock) {
      setAlertMessage(`Maximum stock reached: ${productToAdd.inStock}`);
      return;
    }

    setLoadingStates(prev => ({ ...prev, [productId]: true }));

    try {
      await addToCart(user.uid, {
        ...productToAdd,
        quantity: currentQuantity + 1,
      });

      setQuantities(prev => ({
        ...prev,
        [productId]: currentQuantity + 1
      }));

      setAlertMessage('Added to cart successfully');
    } catch (error) {
      setAlertMessage('Error adding to cart');
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStockStatus = (product) => {
    if (product.inStock <= 0) {
      return {
        text: 'Out of stock',
        variant: 'danger',
        disabled: true
      };
    }

    const currentQuantity = quantities[product.id] || 0;
    if (currentQuantity >= product.inStock) {
      return {
        text: `Max available: ${product.inStock}`,
        variant: 'danger',
        disabled: true
      };
    }

    return {
      text: 'Add to cart',
      variant: 'primary',
      disabled: false
    };
  };

  return (
    <div className="container">
      {favoritesLoading && (
        <div className="text-center py-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {alertMessage && (
        <Alert variant={alertMessage.includes('error') ? 'danger' : 'success'} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      <Row className="justify-content-center g-3">
        {products.slice(0, visibleCount).map((product) => {
          const loading = loadingStates[product.id];
          const stockStatus = getStockStatus(product);
          return (
            <Col key={product.id} xs={6} sm={6} md={4} lg={3}>
              <motion.div
                className="h-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-sm h-100 border-0 position-relative">
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
                    src={product.mainImage || fallbackImage || product.image}
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = fallbackImage }}
                    onClick={() => navigate(`/product/${product.id}`)}

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
                    <div className="mt-auto">
                      <div className="mb-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-muted text-decoration-line-through me-2">
                              {product.originalPrice}$
                            </span>
                            <span className="text-danger fw-bold">

                              {parseFloat(product.price).toFixed(2)}$
                            </span>
                          </>
                        ) : (
                          <span className="fw-bold">{product.price}$</span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          style={{
                            backgroundColor: loading
                              ? '#198754'
                              : stockStatus.disabled
                              ? '#dc3545'
                              : '#3c5a47',
                            borderColor: loading
                              ? '#198754'
                              : stockStatus.disabled
                              ? '#dc3545'
                              : '#3c5a47',
                            color: '#fff'
                          }}
                          variant={stockStatus.variant}
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={loading || stockStatus.disabled}
                          className="flex-grow-1"
                        >

                          {loading ? (
                            <Spinner size="sm" animation="border" />
                          ) : (
                            stockStatus.text
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

      {products.length > visibleCount && (
        <div className="text-center mt-4">
          <Button variant="dark" onClick={handleShowMore}>
            Show More
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllCollections;
