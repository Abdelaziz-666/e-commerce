import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="text-center mt-5"
    >
      <h1 className="display-1">404</h1>
      <p className="lead">{t('page not found')}</p>
      <Button as={Link} to="/" variant="primary">{t('go home')}</Button>
    </motion.div>
  );
};

export default NotFound;