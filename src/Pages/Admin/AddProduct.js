import { useState, useRef, useEffect } from 'react';
import { Modal, Form, Button, Image, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { db } from '../../firebase/Config';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, getDocs } from 'firebase/firestore';

const AddProduct = ({ show, handleClose, onProductAdded }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: 0,
    category: '',
    section: 'regular',
    image: null,
    stock: 1,
    details: [] // Added details array
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: null
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [categoryPreviewUrl, setCategoryPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [newDetailKey, setNewDetailKey] = useState('');
  const [newDetailValue, setNewDetailValue] = useState('');
  const fileInputRef = useRef(null);
  const categoryFileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const loadedCategories = [];
        querySnapshot.forEach((doc) => {
          loadedCategories.push({ id: doc.id, ...doc.data() });
        });
        setCategories(loadedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!newProduct.image) {
      setPreviewUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(newProduct.image);
  }, [newProduct.image]);

  useEffect(() => {
    if (!newCategory.icon) {
      setCategoryPreviewUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategoryPreviewUrl(reader.result);
    };
    reader.readAsDataURL(newCategory.icon);
  }, [newCategory.icon]);

  useEffect(() => {
    if (newProduct.originalPrice) {
      const original = parseFloat(newProduct.originalPrice);
      const discount = parseFloat(newProduct.discount || 0);
      const finalPrice = discount > 0 ? original * (1 - discount / 100) : original;
      
      setNewProduct(prev => ({
        ...prev,
        price: finalPrice.toFixed(2)
      }));
    }
  }, [newProduct.originalPrice, newProduct.discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    try {
      if (!newProduct.name.trim() || !newProduct.originalPrice || !newProduct.category) {
        throw new Error('Please fill all required fields');
      }

      if (isNaN(parseFloat(newProduct.price))) {
        throw new Error('Invalid price value');
      }

      let imageUrl = '';
      if (newProduct.image) {
        try {
          const formData = new FormData();
          formData.append('file', newProduct.image);
          formData.append('upload_preset', 'TESTERAPP');
          
          const response = await fetch(
            'https://api.cloudinary.com/v1_1/dkf2bb8xv/image/upload',
            {
              method: 'POST',
              body: formData,
            }
          );

          const data = await response.json();
          
          if (!response.ok || !data.secure_url) {
            throw new Error(data.message || 'Failed to upload image');
          }

          imageUrl = data.secure_url;
        } catch (err) {
          console.error('Cloudinary upload error:', err);
          throw new Error('Image upload failed. Please try again.');
        }
      }

      const productData = {
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        originalPrice: parseFloat(newProduct.originalPrice),
        discount: parseFloat(newProduct.discount || 0),
        category: newProduct.category,
        section: newProduct.section,
        image: imageUrl,
        inStock: parseInt(newProduct.stock) || 1,
        details: newProduct.details, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isOnSale: newProduct.discount > 0
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      handleCloseModal();
      if (onProductAdded) {
        onProductAdded({ 
          id: docRef.id, 
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!newCategory.icon) {
      setError('Category icon is required');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', newCategory.icon);
      formData.append('upload_preset', 'TESTERAPP');
      
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dkf2bb8xv/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.secure_url) {
        throw new Error(data.message || 'Failed to upload category icon');
      }

      const categoryData = {
        name: newCategory.name.trim(),
        icon: data.secure_url,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      
      setCategories([...categories, { id: docRef.id, ...categoryData }]);
      setNewProduct(prev => ({ ...prev, category: newCategory.name.trim() }));
      
      setNewCategory({ name: '', icon: null });
      setCategoryPreviewUrl('');
      if (categoryFileInputRef.current) categoryFileInputRef.current.value = '';
      setShowAddCategory(false);
      
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.message || 'Category upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        setCategories(categories.filter(cat => cat.id !== categoryId));
        
        if (newProduct.category === categories.find(c => c.id === categoryId)?.name) {
          setNewProduct(prev => ({ ...prev, category: '' }));
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5MB)');
      return;
    }

    setError('');
    setNewProduct({...newProduct, image: file});
  };

  const handleCategoryIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Only image files are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large (max 2MB)');
      return;
    }

    setError('');
    setNewCategory({...newCategory, icon: file});
  };

  const addDetail = () => {
    if (!newDetailKey.trim() || !newDetailValue.trim()) {
      setError('Both key and value are required for details');
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      details: [...prev.details, { key: newDetailKey.trim(), value: newDetailValue.trim() }]
    }));

    setNewDetailKey('');
    setNewDetailValue('');
    setError('');
  };

  const removeDetail = (index) => {
    setNewProduct(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setNewProduct({ 
      name: '', 
      price: '', 
      originalPrice: '',
      discount: 0,
      category: '', 
      section: 'regular',
      stock: 1,
      image: null,
      details: []
    });
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Product</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control 
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Original Price *</Form.Label>
                <Form.Control 
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control 
                  type="number"
                  min="0"
                  max="100"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Price After Discount</Form.Label>
                <Form.Control 
                  type="number"
                  value={newProduct.price}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Stock *</Form.Label>
                <Form.Control 
                  type="number"
                  min="1"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: Math.max(1, e.target.value)})}
                  required
                />
              </Form.Group>

              {/* Product Details Section */}
              <Form.Group className="mb-3">
                <Form.Label>Product Details</Form.Label>
                <div className="border p-3 rounded mb-2">
                  <Row className="mb-3">
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder="Detail key"
                        value={newDetailKey}
                        onChange={(e) => setNewDetailKey(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder="Detail value"
                        value={newDetailValue}
                        onChange={(e) => setNewDetailValue(e.target.value)}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button 
                        variant="primary" 
                        onClick={addDetail}
                        disabled={isUploading}
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>

                  {newProduct.details.length > 0 && (
                    <div className="mt-2">
                      <h6>Current Details:</h6>
                      <ul className="list-group">
                        {newProduct.details.map((detail, index) => (
                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{detail.key}:</strong> {detail.value}
                            </div>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeDetail(index)}
                              disabled={isUploading}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label>Category *</Form.Label>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    disabled={isUploading}
                  >
                    {showAddCategory ? 'Hide Add Category' : 'Add Category'}
                  </Button>
                </div>
                
                {showAddCategory ? (
                  <div className="border p-3 mb-3 rounded">
                    <Form.Group className="mb-3">
                      <Form.Label>Category Name *</Form.Label>
                      <Form.Control 
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Category Icon *</Form.Label>
                      <Form.Control 
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryIconChange}
                        ref={categoryFileInputRef}
                      />
                      {categoryPreviewUrl && (
                        <div className="mt-3 text-center">
                          <Image 
                            src={categoryPreviewUrl} 
                            thumbnail 
                            style={{ maxHeight: '60px' }} 
                            alt="Category Icon Preview" 
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setNewCategory({...newCategory, icon: null});
                              setCategoryPreviewUrl('');
                              if (categoryFileInputRef.current) categoryFileInputRef.current.value = '';
                            }}
                            disabled={isUploading}
                          >
                            Remove Icon
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="success" 
                        onClick={handleAddCategory}
                        disabled={isUploading || !newCategory.name.trim() || !newCategory.icon}
                      >
                        {isUploading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" /> Saving...
                          </>
                        ) : (
                          'Save Category'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    
                    {newProduct.category && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteCategory(
                          categories.find(c => c.name === newProduct.category)?.id
                        )}
                        disabled={isUploading}
                        title="Delete Category"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                  </div>
                )}
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Section</Form.Label>
                <Form.Control 
                  as="select"
                  value={newProduct.section}
                  onChange={(e) => setNewProduct({...newProduct, section: e.target.value})}
                >
                  <option value="regular">Regular Product</option>
                  <option value="new-arrival">New Arrival</option>
                  <option value="hero">Hero Section</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Product Image</Form.Label>
                <Form.Control 
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                {previewUrl && (
                  <div className="mt-3 text-center">
                    <Image 
                      src={previewUrl} 
                      thumbnail 
                      style={{ maxHeight: '200px' }} 
                      alt="Preview" 
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setNewProduct({...newProduct, image: null});
                        setPreviewUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      disabled={isUploading}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={isUploading}>
            Close
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Uploading...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProduct;