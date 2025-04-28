import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Container, Card, Form, Button, Alert, Spinner, Tab, Tabs, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase/Config';
import { useOrders } from '../firebase/hooks/UseOrders';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    role: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { orders, loading: ordersLoading } = useOrders(auth.currentUser?.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({
              name: userDoc.data().name || '',
              email: user.email || '',
              address: userDoc.data().address || '',
              phone: userDoc.data().phone || '',
              role: userDoc.data().role || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
      });

      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Error changing password');
    }
  };

  const reorderItem = async (order) => {
    console.log('Reordering:', order);
    alert('Reorder feature coming soon!');
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

  if (loading && activeTab === 'profile') {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="my-5">
        <h2 className="mb-4">My Profile</h2>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        {(userData.role === 'admin' || userData.role === 'owner') && (
          <div className="text-center mt-4">
            <Button 
              variant="dark" 
              onClick={() => navigate('/admin')}
              className="px-4 py-2"
            >
              Go to Admin Panel
            </Button>
          </div>
        )}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="profile" title="Profile">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Personal Information</h4>
                  {!editMode ? (
                    <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div>
                      <Button variant="outline-secondary" onClick={() => setEditMode(false)} className="me-2">
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleSaveProfile} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control plaintext readOnly defaultValue={userData.name} />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control plaintext readOnly defaultValue={userData.email} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    {editMode ? (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control plaintext readOnly defaultValue={userData.address || 'Not specified'} />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control plaintext readOnly defaultValue={userData.phone || 'Not specified'} />
                    )}
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-4">
              <Card.Body>
                <h4 className="mb-4">Change Password</h4>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Change Password
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="orders" title="My Orders">
            {ordersLoading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Loading orders...</p>
              </div>
            ) : (
              <div className="mt-3">
                {orders.length > 0 ? (
                  <div className="list-group">
                    {orders.map(order => (
                      <div key={order.id} className="list-group-item mb-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5>Order #{order.id.substring(0, 8)}</h5>
                            <small className="text-muted">
                              {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                            </small>
                          </div>
                          <div>
                            {getStatusBadge(order.status)}
                            <span className="ms-3 fw-bold">${order.totalPrice?.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h6>Items:</h6>
                          <ul className="list-unstyled">
                            {order.items?.map(item => (
                              <li key={item.id} className="d-flex justify-content-between py-2 border-bottom">
                                <div>
                                  {item.name} x {item.quantity}
                                </div>
                                <div>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => reorderItem(order)}
                        >
                          Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No orders found</Alert>
                )}
              </div>
            )}
          </Tab>
        </Tabs>
      </Container>
    </motion.div>
  );
};

export default ProfilePage;