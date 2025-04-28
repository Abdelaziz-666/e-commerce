import { useState } from 'react';
import { FaShoppingCart, FaHeart, FaFilter, FaUser } from 'react-icons/fa';
import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { useCart } from '../firebase/hooks/UseCart';
import { useUser } from '../firebase/hooks/UseAuth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/Config';

const ElNavbar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const { total = 0, itemCount = 0 } = useCart(user?.uid);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const renderUserIcon = () => {
    if (loading) return null;

    if (user) {
      const displayName = user.displayName || '';
      const firstChar = displayName
        ? displayName.charAt(0).toUpperCase()
        : (user.email?.charAt(0).toUpperCase() || 'U');

      return (
        <Dropdown align="end" className="mx-2">
          <Dropdown.Toggle
            variant="link"
            id="user-dropdown"
            className="user-icon d-flex align-items-center justify-content-center "
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid black',
              backgroundColor: '#f0f0f0',
              color: 'black',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {firstChar}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <Nav.Link onClick={() => navigate('/login')} className="ms-2">
          <FaUser size={20} />
        </Nav.Link>
      );
    }
  };

  const handleFilterChange = (min, max, category, discount) => {
    console.log('Filtering products with:', { min, max, category, discount });
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary sticky-top" bg="light" variant="light">
        <Container fluid>
          <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            E-Shop
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            <Nav.Link onClick={() => setShowSidebar(true)} className="me-2">
              <FaFilter size={20} />
            </Nav.Link>

            {renderUserIcon()}

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </div>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
            </Nav>

            <Nav className="ms-auto d-flex align-items-center">
              <Nav.Link
                className="position-relative d-flex align-items-center"
                onClick={() => navigate('/cart')}
                style={{ cursor: 'pointer' }}
              >
                <FaShoppingCart size={20} />
                {itemCount > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {itemCount}
                  </Badge>
                )}
                <span className="ms-2" style={{ fontSize: '0.9rem' }}>
                  ${total.toFixed(2)}
                </span>
              </Nav.Link>

              <Nav.Link
                className="ms-3"
                onClick={() => navigate('/favorites')}
                style={{ cursor: 'pointer' }}
              >
                <FaHeart size={20} />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onFilterChange={handleFilterChange}
      />
    </>
  );
};

export default ElNavbar;
