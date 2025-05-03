import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row>
          <Col md={4} className="text-center">
            <h5>About Us</h5>
            <p>
              We are dedicated to providing the best online shopping experience.
            </p>
          </Col>
          <Col md={4} className="text-center">
            <h5>Follow Us</h5>
            <Button variant="link" className="text-light p-2" href="https://facebook.com">
              <FaFacebook size={24} />
            </Button>
            <Button variant="link" className="text-light p-2" href="https://instagram.com">
              <FaInstagram size={24} />
            </Button>
            <Button variant="link" className="text-light p-2" href="https://twitter.com">
              <FaTwitter size={24} />
            </Button>
            <Button variant="link" className="text-light p-2" href="https://linkedin.com">
              <FaLinkedin size={24} />
            </Button>
          </Col>
          <Col md={4} className="text-center">
            <p>&copy; 2025 Your Company. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
