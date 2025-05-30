import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import AddProduct from './AddProduct';
import { useState, useEffect } from 'react';
import { useProducts } from '../../firebase/hooks/UseProducts';
import { auth, db } from '../../firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement';
import TestimonialsAdmin from './TestimonialsAdmin';
import AdminCommEachProd from './AdminCommEachProd';

const AdminPanel = () => {
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
    setSelectedProduct({ 
      ...product,
      displayLocations: product.displayLocations || ['normal']
    });
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
        displayLocations: selectedProduct.displayLocations || ['normal'],
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
          <h2>Admin Panel</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <h3 className="mt-5 mb-3">Products</h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Serial ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Display Locations</th>
              <th>Actions</th>
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
                <td>{product.displayLocations?.join(', ') || 'normal'}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
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
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={selectedProduct.name}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={selectedProduct.price}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={selectedProduct.category}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="inStock"
                    value={selectedProduct.inStock}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Display Locations</Form.Label>
                  <div className="border p-3 rounded mb-2">
                    {['normal', 'hero', 'new_arrivals'].map((location) => (
                      <Form.Check 
                        key={location}
                        type="checkbox"
                        id={`location-${location}`}
                        label={
                          location === 'normal' ? 'Normal' : 
                          location === 'hero' ? 'Hero Section' : 
                          'New Arrivals'
                        }
                        checked={selectedProduct.displayLocations?.includes(location)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setSelectedProduct(prev => ({
                            ...prev,
                            displayLocations: isChecked
                              ? [...(prev.displayLocations || []), location]
                              : (prev.displayLocations || []).filter(l => l !== location)
                          }));
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <OrdersManagement/>
        <TestimonialsAdmin />
        <AdminCommEachProd/>

      </Container>
    </motion.div>
  );
};

export default AdminPanel;