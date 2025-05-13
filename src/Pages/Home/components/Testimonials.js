import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/Config';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ 
    name: '', 
    comment: '', 
    rating: 5 
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), where('approved', '==', true));
        const querySnapshot = await getDocs(q);
        const testimonialsData = [];
        querySnapshot.forEach((doc) => {
          testimonialsData.push({ id: doc.id, ...doc.data() });
        });
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTestimonial({ ...newTestimonial, [name]: value });
  };

  const handleRatingChange = (rating) => {
    setNewTestimonial({ ...newTestimonial, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...newTestimonial,
        approved: false,
        createdAt: serverTimestamp()
      });

      setAlert({ 
        variant: 'success', 
        message: 'Thank you! Your feedback has been submitted and is pending approval.' 
      });
      setShowForm(false);
      setNewTestimonial({ name: '', comment: '', rating: 5 });
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setAlert({ 
        variant: 'danger', 
        message: 'Something went wrong. Please try again later.' 
      });
    }
  };

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">Customer Reviews</h2>

      {alert && (
        <Alert variant={alert.variant} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <Row className="justify-content-center mb-4">
        <Col md="auto">
          <Button style={{background:'#3c5a47'}} onClick={() => setShowForm(true)}>
            Leave a Review
          </Button>
        </Col>
      </Row>

      <Row>
        {testimonials.map(testimonial => (
          <Col key={testimonial.id} md={6}>
            <Card className="mb-4 p-3">
              <Card.Body>
                <div className="mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <Card.Text className="fst-italic">"{testimonial.comment}"</Card.Text>
                <Card.Footer className="bg-transparent">
                  <strong>- {testimonial.name}</strong><br />
                  <small className="text-muted">
                    {testimonial.createdAt?.toDate().toLocaleString()}
                  </small>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Leave a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newTestimonial.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comment"
                value={newTestimonial.comment}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Rating</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={newTestimonial.rating >= star ? 'warning' : 'outline-secondary'}
                    onClick={() => handleRatingChange(star)}
                    className="me-2"
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Button style={{background:'#3c5a47'}} type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Testimonials;
