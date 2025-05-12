import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Spinner, 
  Container, 
  Row, 
  Col, 
  Button, 
  ListGroup, 
  Badge,
  Toast,
  ToastContainer,
  Alert,
  Form
} from 'react-bootstrap';
import { motion } from 'framer-motion';
import { AiOutlineHeart, AiFillHeart, AiOutlineShoppingCart } from 'react-icons/ai';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import { auth, db } from '../firebase/Config';
import { getProductById } from '../firebase/services/Product-service';
import { addToCart } from '../firebase/services/Cart-service';
import useFavorites from '../firebase/services/Favorites-service';
import { doc, getDoc } from 'firebase/firestore';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState('');
  
  const { favorites, toggleFavorite } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setMainImage(data.mainImage || data.image || '');
        } else {
          console.error("Product data is missing or invalid");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && user) {
      setIsFavorite(favorites.some(fav => fav.id === product.id));
    }
  }, [favorites, product, user]);

  const fetchQuantities = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const cart = userData.cart || [];

    const updatedQuantities = {};
    if (product) {
      const item = cart.find(i => i.id === product.id);
      updatedQuantities[product.id] = item ? item.quantity : 0;
    }
    setQuantities(updatedQuantities);
  };

  useEffect(() => {
    if (user && product) fetchQuantities();
  }, [user, product]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product || !product.id) {
      console.error("Product id is missing, cannot toggle favorite");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(product);
      setShowFavoriteToast(true);
    } catch (error) {
      console.error("Error updating favorites:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (color.image) {
      setMainImage(color.image);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product || !product.id) {
      console.error("Product data is missing or invalid, cannot add to cart");
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setAlertMessage('Please select a color');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setAlertMessage('Please select a size');
      return;
    }

    const currentQuantity = quantities[product.id] || 0;
    if (currentQuantity >= product.inStock) {
      setAlertMessage('Maximum quantity in stock reached');
      return;
    }

    setIsAddingToCart(true);
    try {
      const cartItem = { 
        ...product, 
        quantity: currentQuantity + 1,
        price: product.discount 
          ? parseFloat(product.price) * (1 - product.discount / 100)
          : parseFloat(product.price),
        selectedColor: selectedColor,
        selectedSize: selectedSize
      };

      await addToCart(user.uid, cartItem);

      setQuantities(prev => ({
        ...prev,
        [product.id]: currentQuantity + 1
      }));

      setAlertMessage('Added to cart successfully');
    } catch (error) {
      setAlertMessage('Error adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-3" style={{ padding: '10px' }}>
        <Spinner animation="border" size="sm" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="text-center my-3" style={{ padding: '10px' }}>
        <h5 style={{ fontSize: '0.9rem' }}>Product not found</h5>
      </Container>
    );
  }

  const currentQuantity = quantities[product.id] || 0;
  const discountedPrice = product.discount
    ? parseFloat(product.originalPrice) * (1 - product.discount / 100)
    : parseFloat(product.price);
  const price = isNaN(discountedPrice) ? 0 : discountedPrice.toFixed(2);

  return (
    <Container className="my-2" style={{ maxWidth: '800px' }}>
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast 
          show={showFavoriteToast} 
          onClose={() => setShowFavoriteToast(false)} 
          delay={3000} 
          autohide
          bg={isFavorite ? "success" : "warning"}
        >
          <Toast.Body className="d-flex align-items-center text-white">
            <MdCheck size={18} className="me-2" />
            {isFavorite ? "Added to favorites!" : "Removed from favorites"}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {alertMessage && (
        <Alert 
          variant={alertMessage.includes('Error') ? 'danger' : 'success'} 
          onClose={() => setAlertMessage(null)} 
          dismissible
          className="mt-3"
        >
          {alertMessage}
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-2 shadow-sm rounded-4 bg-white"
        style={{ fontSize: '0.8rem' }}
      >
        <Button
          variant="light"
          onClick={() => navigate(-1)}
          className="mb-2 d-flex align-items-center gap-1"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          <MdArrowBack size={14} /> Back
        </Button>

        <Row className="g-2">
          <Col md={6} className="text-center mb-2">
            <motion.img
              src={mainImage}
              alt={product.name}
              className="img-fluid rounded-3 shadow-sm"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              style={{ 
                maxHeight: '250px', 
                objectFit: 'contain',
                width: '100%'
              }}
            />

            {product.colors && product.colors.length > 0 && (
              <div className="mt-3">
                <h6 style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Colors:</h6>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {product.colors.map((color, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`rounded-circle border ${selectedColor?.name === color.name ? 'border-primary border-2' : 'border-secondary'}`}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color.code,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => handleColorSelect(color)}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <div className="position-absolute top-0 start-100 translate-middle">
                          <MdCheck size={14} className="text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {selectedColor && (
                  <div className="mt-2 small text-muted">
                    Selected: {selectedColor.name}
                  </div>
                )}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-3">
                <h6 style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sizes:</h6>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {product.sizes.map((size, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-pill border ${selectedSize === size ? 'border-primary border-2 bg-primary text-white' : 'border-secondary'}`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size}
                    </motion.div>
                  ))}
                </div>
                {selectedSize && (
                  <div className="mt-2 small text-muted">
                    Selected: {selectedSize}
                  </div>
                )}
              </div>
            )}
          </Col>

          <Col md={6}>
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {product.name}
              </h4>
              <Button 
                variant={isFavorite ? "danger" : "outline-danger"} 
                className="rounded-circle p-1" 
                onClick={handleToggleFavorite}
                style={{ minWidth: '28px', minHeight: '28px' }}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <Spinner animation="border" size="sm" />
                ) : isFavorite ? (
                  <AiFillHeart size={14} />
                ) : (
                  <AiOutlineHeart size={14} />
                )}
              </Button>
            </div>

            <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
              {product.description}
            </p>

            <div className="mb-2">
              {product.discount > 0 ? (
                <>
                  <span className="text-muted text-decoration-line-through me-2">
                    {parseFloat(product.originalPrice).toFixed(2)} EGP
                  </span>
                  <span className="text-danger fw-bold">
                    {price} $
                  </span>
                  <Badge bg="success" className="ms-2">
                    {product.discount}% OFF
                  </Badge>
                </>
              ) : (
                <span className="fw-bold">{parseFloat(product.price).toFixed(2)} $</span>
              )}
            </div>

            <Form.Group className="mb-3">
              <Button 
                variant={isAddingToCart ? 'success' : currentQuantity >= product.inStock ? 'danger' : 'dark'}
                size="sm" 
                className="px-3 mt-1 mb-3 d-flex align-items-center gap-1"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                onClick={handleAddToCart}
                disabled={isAddingToCart || currentQuantity >= product.inStock || product.inStock <= 0}
              >
                {isAddingToCart ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Adding...
                  </>
                ) : currentQuantity >= product.inStock ? (
                  `Max in stock: ${product.inStock}`
                ) : (
                  <>
                    <AiOutlineShoppingCart size={14} />
                    Add To Cart
                  </>
                )}
              </Button>
            </Form.Group>

            {product.details && product.details.length > 0 && (
              <div className="mt-3">
                <h6 style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Product Details:</h6>
                <ListGroup variant="flush" style={{ fontSize: '0.75rem' }}>
                  {product.details.map((detail, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between px-0 py-1">
                      <span className="text-muted">{detail.key}:</span>
                      <span className="fw-medium">{detail.value}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            <div className="mt-2">
              <Badge bg={product.inStock > 0 ? 'success' : 'danger'} style={{ fontSize: '0.65rem' }}>
                {product.inStock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {product.inStock > 0 && (
                <span className="ms-2" style={{ fontSize: '0.7rem' }}>
                  {product.inStock} available
                </span>
              )}
            </div>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default ProductDetails;
