import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button, Card, Col, Row, Badge, Alert, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import { auth } from "../firebase/Config";
import useFavorites from "../firebase/services/Favorites-service";

const Favorites = () => {
  const [user] = useAuthState(auth);
  const { favorites, toggleFavorite, loading } = useFavorites(); 
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const fallbackImage = "/images/no-image.png";

  return (
    <div className="container py-4">
      <h4 className="mb-4">My Favorites</h4>
      <Row className="justify-content-center g-3">
        {favorites.length === 0 ? (
          <Alert variant="info" className="text-center w-100">
            You haven't added any favorites yet
          </Alert>
        ) : (
          favorites.map((product) => {
            const price = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;
            const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

            return (
              <Col key={product.id || `${product.id}-${product.name}`} xs={6} sm={6} md={4} lg={3}>
                <motion.div
                  className="h-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-sm h-100 border-0 position-relative">
                    <Button
                      variant="link"
                      className="position-absolute top-0 end-0 m-2 p-0"
                      onClick={() => toggleFavorite(product)} 
                      style={{ zIndex: 5 }}
                    >
                      <FaHeart
                        style={{
                          color: "red",
                          fontSize: "1.4rem",
                        }}
                      />
                    </Button>

                    <Card.Img
                      variant="top"
                      src={product.mainImage || fallbackImage}
                      alt={product.name}
                      style={{ height: "200px", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />

                    {product.inStock <= 0 && (
                      <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
                        Out of stock
                      </Badge>
                    )}

                    {product.inStock > 0 && product.isOnSale && (
                      <Badge bg="success" className="position-absolute top-0 start-0 m-2">
                        SALE!
                      </Badge>
                    )}

                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fs-6 text-truncate">{product.name}</Card.Title>
                      <div className="d-flex align-items-center gap-2">
                        <Card.Text className="fw-bold text-success mb-0">
                          {!isNaN(discountedPrice)
                            ? discountedPrice.toFixed(2)
                            : "N/A"}{" "}
                          EGP
                        </Card.Text>
                        {product.isOnSale && product.originalPrice && (
                          <small className="text-decoration-line-through text-muted">
                            {product.originalPrice} EGP
                          </small>
                        )}
                      </div>
                      <div className="mt-auto">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="w-100"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            );
          })
        )}
      </Row>
    </div>
  );
};

export default Favorites;
