import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { auth, db } from '../../firebase/Config';
import { doc, getDoc, updateDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import { useOrders } from '../../firebase/hooks/UseOrders';

const OrdersManagement = () => {
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setRole(userDoc.exists() ? userDoc.data().role : null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && role !== 'admin' && role !== 'owner') {
      navigate('/NotFound');
    }
  }, [role, authLoading, navigate]);

  useEffect(() => {
    if (ordersError) {
      setAlert({
        show: true,
        message: 'Error loading orders',
        variant: 'danger'
      });
    }
  }, [ordersError]);

  const handleEditOrder = (order) => {
    const safeOrder = {
      ...order,
      items: order.items?.map(item => ({
        ...item,
        selectedColor: item.selectedColor || { name: 'N/A', code: '' },
        selectedSize: item.selectedSize || 'N/A'
      })) || []
    };
    
    setSelectedOrder(safeOrder);
    setShowOrderModal(true);
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm('Delete order?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setAlert({
        show: true,
        message: 'Order deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      setAlert({
        show: true,
        message: 'Error deleting order',
        variant: 'danger'
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const confirm = window.confirm('Update order status?');
    if (!confirm) return;
  
    try {
      await runTransaction(db, async (transaction) => {
        const productUpdates = [];
        if (selectedOrder.status === 'approved') {
          for (const item of selectedOrder.items || []) {
            const productRef = doc(db, 'products', item.id);
            const productDoc = await transaction.get(productRef);
            
            if (!productDoc.exists()) {
              console.warn(`Product ${item.id} not found`);
              continue;
            }
  
            const currentStock = productDoc.data().inStock || 0;
            const newStock = currentStock - item.quantity;
  
            if (newStock < 0) {
              throw new Error(`Not enough in stock (${item.name})`);
            }
  
            productUpdates.push({ ref: productRef, newStock });
          }
        }
  
        const orderRef = doc(db, 'orders', selectedOrder.id);
        transaction.update(orderRef, { status: selectedOrder.status });
  
        if (selectedOrder.status === 'approved') {
          for (const update of productUpdates) {
            transaction.update(update.ref, { inStock: update.newStock });
          }
        }
      });
  
      setAlert({
        show: true,
        message: 'Status updated successfully',
        variant: 'success'
      });
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({
        show: true,
        message: error.message || 'Error updating status',
        variant: 'danger'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      shipped: 'info',
      delivered: 'primary',
      cancelled: 'danger',
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return isNaN(date.getTime()) 
        ? 'Unknown date' 
        : date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" /> Loading...
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="Orders management"
    >
      <Container className="my-5">
        <h2 className="mb-4">Orders Management</h2>

        {alert.show && (
          <Alert 
            variant={alert.variant} 
            onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
            dismissible
          >
            {alert.message}
          </Alert>
        )}

        <Table striped bordered hover responsive className="mt-4">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total Price</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{order.fullName || 'Unknown'}</td>
                  <td>${order.totalPrice?.toFixed(2) || '0.00'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button 
                        variant="info" 
                        size="sm" 
                        onClick={() => handleEditOrder(order)}
                      >
                        Manage
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Order Management Modal */}
        <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Manage Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <div>
                <p><strong>Customer:</strong> {selectedOrder.fullName}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>paymentMethod</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>phoneNumber1</strong> {selectedOrder.phoneNumber1}</p>
                <p><strong>phoneNumber2</strong> {selectedOrder.phoneNumber2}</p>
                <p><strong>Total Price:</strong> ${selectedOrder.totalPrice?.toFixed(2)}</p>
                <Table striped bordered hover responsive className="mt-4">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>quantity</th>
              <th>color</th>
              <th>size</th>
              <th>price</th>
            </tr>
          </thead>
          <tbody>
            {
            selectedOrder.items.length > 0 ? (
              selectedOrder.items.map((item , id) => (
                <tr key={item.id}>
                  <td>{item.name || 'Unknown'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.selectedColor.name}</td>
                  <td>{item.selectedSize}</td>
                  <td>${item.price?.toFixed(2) || '0.00'}</td>
                  <td>
         
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </Table>                
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({
                      ...selectedOrder,
                      status: e.target.value
                    })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default OrdersManagement;