import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import AddProduct from './AddProduct';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useProducts } from '../../firebase/hooks/UseProducts';
import { auth, db } from '../../firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
 
const AdminPanel = () => {
  const { t } = useTranslation();
  const { products, deleteProduct } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && role !== 'admin' && role !== 'owner') {
      navigate('/NotFound');
    }
  }, [role, loading, navigate]);

  const handleEditProduct = (product) => {
    setSelectedProduct({ ...product });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (selectedProduct && selectedProduct.id) {
      const productRef = doc(db, 'products', selectedProduct.id);
      await updateDoc(productRef, {
        name: selectedProduct.name || '',
        price: selectedProduct.price || 0,
        category: selectedProduct.category || '',
        inStock: selectedProduct.inStock || 0,
        displayLocation: selectedProduct.displayLocation || 'normal',
      });
      setShowEditModal(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'inStock' ? Number(value) : value,
    }));
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-panel">
      <Container className="my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t('admin panel')}</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>
            {t('add product')}
          </Button>
        </div>

        {/* Products Table */}
        <h3 className="mt-5 mb-3">{t('products')}</h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>{t('serial id')}</th>
              <th>{t('name')}</th>
              <th>{t('price')}</th>
              <th>{t('category')}</th>
              <th>{t('stock')}</th>
              <th>{t('display location')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
                <td>{product.inStock}</td>
                <td>{t(product.displayLocation)}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEditProduct(product)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => deleteProduct(product.id)}
                  >
                    {t('delete')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <AddProduct show={showModal} handleClose={() => setShowModal(false)} />

        {/* Edit Product Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('edit_product')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={selectedProduct.name}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('price')}</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={selectedProduct.price}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('category')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={selectedProduct.category}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('stock')}</Form.Label>
                  <Form.Control
                    type="number"
                    name="inStock"
                    value={selectedProduct.inStock}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('display location')}</Form.Label>
                  <Form.Control
                    as="select"
                    name="displayLocation"
                    value={selectedProduct.displayLocation}
                    onChange={handleChange}
                  >
                    <option value="normal">{t('normal')}</option>
                    <option value="hero">{t('hero')}</option>
                    <option value="new_arrivals">{t('new_arrivals')}</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              {t('save changes')}
            </Button>
          </Modal.Footer>
        </Modal>
        <OrdersManagement/>
      </Container>
    </motion.div>
  );
};

export default AdminPanel;