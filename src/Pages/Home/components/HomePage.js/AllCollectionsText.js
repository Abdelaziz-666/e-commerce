import React from 'react';
import { motion } from 'framer-motion';

const NewCollection = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, rotateX: 60, filter: 'blur(2px)' },
    visible: {
      opacity: 1,
      rotateX: 0,
      filter: 'blur(0)',
      transition: {
        duration: 1.2,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  const underlineVariants = {
    hidden: { scaleX: 0, transformOrigin: 'right' },
    visible: {
      scaleX: 1,
      transformOrigin: 'left',
      transition: {
        delay: 0.6,
        duration: 1,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="NewCollectioncontainer"
    >
      <motion.div className="NewCollectiontext">
        <motion.span
          variants={textVariants}
          style={{ display: 'inline-block' }}
        >
         All products
          <motion.span
            variants={underlineVariants}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg,rgb(76, 110, 85),rgba(52, 107, 70, 0.55))',
            }}
          />
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default NewCollection;