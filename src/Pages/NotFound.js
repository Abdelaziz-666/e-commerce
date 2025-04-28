import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="text-center mt-5"
    >
      <h1 className="display-1">404</h1>
      <p className="lead">Page Not Found</p>
      <Button as={Link} to="/" variant="primary">Go Home</Button>
    </motion.div>
  );
};

export default NotFound;