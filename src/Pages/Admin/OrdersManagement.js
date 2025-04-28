import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../firebase/Config';
import { doc, getDoc, updateDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import { useOrders } from '../../firebase/hooks/UseOrders';

const OrdersManagement = () => {
  const { t } = useTranslation();
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
        message: t('error loading orders'),
        variant: 'danger'
      });
    }
  }, [ordersError, t]);

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(t('Delete order'));
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setAlert({
        show: true,
        message: t('Order deleted successfully'),
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      setAlert({
        show: true,
        message: t('Error deleting order'),
        variant: 'danger'
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const confirm = window.confirm(t(' update'));
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
              throw new Error(`${t('Not enough in stock')} (${item.name})`);
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
        message: t('status updated successfully'),
        variant: 'success'
      });
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({
        show: true,
        message: error.message || t('Error updating status'),
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
    return <Badge bg={statusMap[status] || 'secondary'}>{t(status)}</Badge>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return t('Unknown date');
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return isNaN(date.getTime()) 
        ? t('Unknown date') 
        : date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('Unknown date');
    }
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" /> {t('loading')}...
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
        <h2 className="mb-4">{t('Orders management')}</h2>

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
              <th>{t('id')}</th>
              <th>{t('customer')}</th>
              <th>{t('total price')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{order.fullName || t(' ')}</td>
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
                        {t('manage')}
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  {t('No orders founded')}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Order Management Modal */}
        <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('Manage order')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <div>
                <p><strong>{t('customer')}:</strong> {selectedOrder.fullName}</p>
                <p><strong>{t('address')}:</strong> {selectedOrder.address}</p>
                <p><strong>{t('total price')}:</strong> ${selectedOrder.totalPrice?.toFixed(2)}</p>
                
                <div className="mb-3">
                  <label className="form-label">{t('status')}</label>
                  <select
                    className="form-select"
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({
                      ...selectedOrder,
                      status: e.target.value
                    })}
                  >
                    <option value="pending">{t('pending')}</option>
                    <option value="approved">{t('approved')}</option>
                    <option value="shipped">{t('shipped')}</option>
                    <option value="delivered">{t('delivered')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus}>
              {t('Update status')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default OrdersManagement;