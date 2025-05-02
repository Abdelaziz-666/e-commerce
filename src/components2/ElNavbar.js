import { useState } from 'react';
import { FaShoppingCart, FaHeart, FaFilter, FaUser, FaSearch } from 'react-icons/fa';
import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { useCart } from '../firebase/hooks/UseCart';
import { useUser } from '../firebase/hooks/UseAuth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/Config';
import SearchBar from './SearchBar';
import { useProducts } from '../firebase/hooks/UseProducts';

const ElNavbar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { products } = useProducts();
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
      return (
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            id="user-dropdown"
            style={{
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: '#000'
            }}
          >
            <FaUser size={20} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <FaUser
          size={20}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        />
      );
    }
  };

  const handleFilterChange = (min, max, category, discount) => {
    console.log('Filtering products with:', { min, max, category, discount });
  };

  return (
    <>
      <Navbar expand="lg" className="navbar sticky-top py-2" bg="white" variant="light">
        <Container fluid className="d-flex justify-content-between align-items-center px-3">
          {/* Left Icons */}
          <div className="d-flex align-items-center gap-3">
            <FaFilter style={{ cursor: 'pointer' }} onClick={() => setShowSidebar(true)} />
            <FaSearch style={{ cursor: 'pointer' }} onClick={() => setShowSearch(prev => !prev)} />
          </div>

          {/* Center Logo */}
          <Navbar.Brand
            onClick={() => navigate('/')}
            style={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              letterSpacing: '1px',
              cursor: 'pointer'
            }}
          >
            LOGO
          </Navbar.Brand>

          {/* Right Icons */}
          <div className="d-flex align-items-center gap-3">
            {renderUserIcon()}
            <FaHeart style={{ cursor: 'pointer' }} onClick={() => navigate('/favorites')} />
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/cart')}>
              <FaShoppingCart />
              {itemCount > 0 && (
                <Badge
                  pill
                  bg="dark"
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6rem' }}
                >
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
        </Container>

        {/* Search Bar */}
        {showSearch && (
          <div className="w-100 px-4 mt-2">
            <SearchBar products={products} onResults={() => {}} />
          </div>
        )}
      </Navbar>

      {/* Sidebar */}
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onFilterChange={handleFilterChange}
      />
    </>
  );
};

export default ElNavbar;