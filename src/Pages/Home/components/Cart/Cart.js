import { useEffect } from 'react';
import { Button, Table, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useCart } from '../../../../firebase/hooks/UseCart';
import { removeFromCart, updateCartItem } from '../../../../firebase/services/Cart-service';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Cart = ({ userId }) => {
  const navigate = useNavigate();
  const { cartItems, loading, error, total, itemCount } = useCart(userId);

  useEffect(() => {
    console.log('Current cart items:', cartItems);
  }, [cartItems]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = cartItems.find(item => item.id === productId);
    if (!product) return;
    
    if (newQuantity > product.inStock) {
      alert('Limited Item Quantity');
      return;
    }

    try {
      await updateCartItem(userId, productId, newQuantity);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert('Error updating quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(userId, productId);
    } catch (err) {
      console.error("Error removing item:", err);
      alert('Error removing item');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="primary" />
      <span className="ms-2">Loading...</span>
    </div>
  );

  if (error) return (
    <Alert variant="danger" className="mt-3">
      {error}
    </Alert>
  );

  if (!cartItems || cartItems.length === 0) return (
    <div className="text-center mt-5">
      <h4>Your cart is empty</h4>
      <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
        Continue Shopping
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="cart-container p-3"
    >
      <Row className="mb-4">
        <Col>
          <h3>
            Shopping Cart <Badge bg="primary" pill>{itemCount}</Badge>
          </h3>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="mb-4">
        <thead className="table-dark">
          <tr>
            <th className="text-center">Product</th>
            <th className="text-center">Price</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Total</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            const price = parseFloat(item.price).toFixed(2) || 0);
            const itemTotal = (price * item.quantity).toFixed(2);
            return (
              <tr key={item.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img 
                      src={item.mainImage} 
                      alt={item.name} 
                      width="60" 
                      height="60"
                      className="me-3 rounded border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/no-image.png';
                      }}
                    />
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      {item.size && <small className="text-muted">Size: {item.size}</small>}
                      {item.color && <small className="text-muted d-block">Color: {item.color}</small>}
                    </div>
                  </div>
                </td>
                <td className="align-middle text-center">${price.toFixed(2)}</td>
                <td className="align-middle text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="quantity-btn"
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.inStock}
                        className="quantity-btn"
                      >
                        +
                      </Button>
                    </div>
                    {item.quantity >= item.inStock && (
                      <small className="text-danger">
                        Max quantity in Stock ({item.inStock})
                      </small>
                    )}
                  </div>
                </td>
                <td className="align-middle text-center">${itemTotal}</td>
                <td className="align-middle text-center">
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Row className="justify-content-end mt-4">
        <Col md={4}>
          <div className="border p-3 rounded bg-light shadow-sm">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>${parseFloat(total).toFixed(2)}</span>
            </div>
            <hr />
            <h4 className="d-flex justify-content-between mb-3">
              <span>Total:</span>
              <span>${parseFloat(total).toFixed(2)}</span>
            </h4>
            <Button 
              variant="primary" 
              size="lg" 
              className="w-100 py-3 fw-bold"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
            <div className="text-center mt-2">
              <small className="text-muted">
                or <a href="/" className="text-decoration-none">continue shopping</a>
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Cart;
