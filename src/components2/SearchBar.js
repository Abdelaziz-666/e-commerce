import { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, Button, Spinner, ListGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { debounce } from 'lodash';

const SearchBar = ({ products, onResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredResults([]);
      setShowDropdown(false);
      onResults(products);
      return;
    }

    setLoading(true);

    const filtered = products.filter((product) =>
      (product.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredResults(filtered);
    setShowDropdown(true);
    setLoading(false);
    onResults(filtered);
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [products]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="position-relative w-100" style={{ maxWidth: '600px' }}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="ابحث عن المنتجات..."
          value={searchQuery}
          onChange={handleChange}
        />
        <Button variant="outline-secondary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : <FaSearch />}
        </Button>
      </InputGroup>

      {showDropdown && filteredResults.length > 0 && (
        <ListGroup className="position-absolute w-100 shadow-sm z-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredResults.slice(0, 5).map((product, index) => (
            <ListGroup.Item key={index} action href={`#product-${product.id}`}>
              <strong>{product.name}</strong> <br />
              <small className="text-muted">{product.category}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {showDropdown && filteredResults.length === 0 && (
        <div className="position-absolute bg-white border p-2 w-100 z-3 text-muted">
          No products available
        </div>
      )}
    </div>
  );
};

export default SearchBar;
