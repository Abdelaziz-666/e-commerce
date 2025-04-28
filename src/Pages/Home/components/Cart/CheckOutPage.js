import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../../../firebase/services/Order-service';
import { auth } from '../../../../firebase/Config';
import { clearCart } from '../../../../firebase/services/Cart-service';
import { Alert, Spinner } from 'react-bootstrap';
import { useCart } from '../../../../firebase/hooks/UseCart';

const CheckOutPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber1: '',
    phoneNumber2: '',
    paymentMethod: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { cartItems, total, loading: cartLoading, itemCount, error: cartError } = useCart(auth.currentUser?.uid);

  useEffect(() => {
    if (cartError) {
      setError(cartError);
    }
  }, [cartError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { fullName, address, phoneNumber1, paymentMethod } = formData;
      
      if (!fullName.trim() || !address.trim() || !phoneNumber1.trim() || !paymentMethod) {
        throw new Error('Please fill out all required fields.');
      }

      console.log('Current cart items:', cartItems); // Debug log

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to place an order.');
      }

      await createOrder({
        userId: user.uid,
        ...formData,
        totalPrice: total,
        items: cartItems,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      await clearCart(user.uid);
      
      navigate(paymentMethod === 'visa' ? '/visa-payment' : ' ', { 
        state: { 
          totalPrice: total,
          orderDetails: formData
        } 
      });
    } catch (err) {
      setError(err.message);
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = 
    isSubmitting || 
    cartLoading ||
    !cartItems || 
    cartItems.length === 0 ||
    !formData.fullName.trim() ||
    !formData.address.trim() ||
    !formData.phoneNumber1.trim() ||
    !formData.paymentMethod;

  if (cartLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Checkout</h2>
              {itemCount > 0 && (
                <span className="badge bg-light text-dark">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            
            <div className="card-body">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              
              <div className="mb-4 p-3 bg-light rounded text-center">
                <h4 className="mb-0">
                  Total Price: <strong className="text-primary">${total?.toFixed(2)}</strong>
                </h4>
              </div>

              <form onSubmit={handleOrderSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number 1 *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber1"
                    value={formData.phoneNumber1}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number 2 (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber2"
                    value={formData.phoneNumber2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-select"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="visa">Credit/Debit Card</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className={`btn btn-primary w-100 py-2 ${isButtonDisabled ? 'disabled' : ''}`}
                  disabled={isButtonDisabled}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;