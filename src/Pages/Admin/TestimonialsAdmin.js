import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/Config';

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [visibleTestimonials, setVisibleTestimonials] = useState(5);  // Set initial number of testimonials to show

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const testimonialsData = [];
        querySnapshot.forEach((doc) => {
          testimonialsData.push({ id: doc.id, ...doc.data() });
        });
        setTestimonials(testimonialsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  const handleApprove = async (id) => {
    try {
      const testimonialRef = doc(db, 'testimonials', id);
      await updateDoc(testimonialRef, {
        approved: true
      });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, approved: true } : t))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const showDetails = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowModal(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="p-4">
      <h2 className="mb-4">All Testimonials</h2>
      
      {testimonials.length === 0 ? (
        <Alert variant="info">No testimonials available.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.slice(0, visibleTestimonials).map(testimonial => (
              <tr key={testimonial.id}>
                <td>{testimonial.name}</td>
                <td>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </td>
                <td>
                  {testimonial.approved ? (
                    <Badge bg="success">Approved</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </td>
                <td>
                  <Button 
                    variant="link" 
                    onClick={() => showDetails(testimonial)}
                  >
                    View
                  </Button>
                </td>
                <td>
                  {!testimonial.approved && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleApprove(testimonial.id)}
                    >
                      Approve
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* See More Button */}
      {testimonials.length > visibleTestimonials && (
        <Button 
          variant="link" 
          className="mt-3" 
          onClick={() => setVisibleTestimonials(visibleTestimonials + 5)}
        >
          See More
        </Button>
      )}
      
      {/* Modal for testimonial details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Testimonial Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTestimonial && (
            <>
              <p><strong>Name:</strong> {selectedTestimonial.name}</p>
              <p><strong>Rating:</strong> 
                {Array.from({ length: selectedTestimonial.rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </p>
              <p><strong>Comment:</strong></p>
              <p className="fst-italic">"{selectedTestimonial.comment}"</p>
              <p>
                <strong>Submitted At:</strong>{' '}
                {selectedTestimonial.createdAt?.seconds
                  ? new Date(selectedTestimonial.createdAt.seconds * 1000).toLocaleString()
                  : 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {selectedTestimonial.approved ? 'Approved' : 'Pending'}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestimonialsAdmin;
