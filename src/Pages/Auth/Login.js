import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Form, Card, Alert, FormGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { auth, db } from '../../firebase/Config';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); 
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;

        if (role === 'owner' || role === 'admin') {
          navigate('/admin'); 
        } else {
          navigate('/');
        }
      } else {
        console.log('No such user document!');
      }
    } catch (error) {
      setError('Error logging in. Please try again.');
      console.error('Error logging in: ', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <Card className="p-4 shadow" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <Form onSubmit={handleLogin}> 
          <FormGroup className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" placeholder="Enter your email" required />
          </FormGroup>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" placeholder="Enter your password" required />
          </Form.Group>
          {error && <Alert variant="danger" className="py-1">{error}</Alert>}
          <Button variant="primary" className="w-100 mb-3" type="submit">
            Login
          </Button>
          <p className="text-center ">
            Don't have an account yet? <Link to="/register">Register</Link>
          </p>
        </Form>
      </Card>
    </motion.div>
  );
};

export default Login;