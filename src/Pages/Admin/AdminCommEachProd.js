import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/Config';
import { collection, doc, getDocs, query, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Table, Button, Spinner, Badge, Alert, Modal } from 'react-bootstrap';

const AdminCommEachProd = () => {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [visibleComments, setVisibleComments] = useState(5);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Get all products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get all comments subcollections
        const allComments = [];
        
        for (const product of productsData) {
          const commentsQuery = query(
            collection(db, `products/${product.id}/comments`)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          
          commentsSnapshot.forEach(commentDoc => {
            allComments.push({
              id: commentDoc.id,
              productId: product.id,
              productName: product.name,
              ...commentDoc.data(),
              createdAt: commentDoc.data().createdAt?.toDate()
            });
          });
        }
        
        setPendingComments(allComments);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchComments();
  }, []);
  

  const approveComment = async (comment) => {
    try {
      const commentRef = doc(db, `products/${comment.productId}/comments`, comment.id);
      await updateDoc(commentRef, {
        approved: true
      });
      
      setPendingComments(pendingComments.filter(c => c.id !== comment.id));
      setSuccessMessage(`Comment from ${comment.userName} approved successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComment = async (comment) => {
    try {
      const commentRef = doc(db, `products/${comment.productId}/comments`, comment.id);
      await deleteDoc(commentRef);
      
      setPendingComments(pendingComments.filter(c => c.id !== comment.id));
      setSuccessMessage(`Comment from ${comment.userName} deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const showDetails = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-4">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <h4>Pending Comments Approval</h4>
      <p className="text-muted">Review and approve or delete customer comments</p>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}

      {pendingComments.length === 0 ? (
        <Alert variant="info" className="mt-4">No pending comments for approval</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingComments.slice(0, visibleComments).map((comment) => (
              <tr key={comment.id}>
                <td>{comment.productName}</td>
                <td>{comment.userName}</td>
                <td>{comment.text}</td>
                <td>{comment.createdAt?.toLocaleDateString()}</td>
                <td>
                  <Button 
                    variant="link" 
                    onClick={() => showDetails(comment)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => approveComment(comment)}
                    disabled={comment.approved} // Disable if already approved
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => deleteComment(comment)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {pendingComments.length > visibleComments && (
        <Button 
          variant="link" 
          className="mt-3" 
          onClick={() => setVisibleComments(visibleComments + 5)}
        >
          See More
        </Button>
      )}
      
      {/* Modal for comment details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Comment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <>
              <p><strong>Product:</strong> {selectedComment.productName}</p>
              <p><strong>User:</strong> {selectedComment.userName}</p>
              <p><strong>Comment:</strong></p>
              <p className="fst-italic">"{selectedComment.text}"</p>
              <p>
                <strong>Submitted At:</strong>{' '}
                {selectedComment.createdAt?.toLocaleString() || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {selectedComment.approved ? 'Approved' : 'Pending'}
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

export default AdminCommEachProd;
