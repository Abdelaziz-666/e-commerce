import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';

const NewArrivalsSlider = ({ products }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{
        position: 'relative',
        top: '-60px',
        zIndex: 1,
      }}
    >
      <div
        className="container-fluid p-0"
        style={{ maxWidth: '100vw', overflow: 'hidden' }}
      >
        <Splide
          options={{
            type: 'loop',
            autoplay: true,
            interval: 4000,
            arrows: false,
            pagination: false,
            perPage: 1,
            gap: 0,
          }}
          aria-label="New Arrivals"
          style={{ width: '100vw', margin: '0 auto' }}
        >
          {products?.map((product, index) => (
            <SplideSlide key={index}>
              <div
                style={{
                  width: '100vw',
                  height: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
              >
                <motion.img
                  src={product.mainImage}
                  alt={`Product ${index}`}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{
                    width: '100vw',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '0 0 2rem 2rem',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                    backgroundColor: '#fff',
                    

                  }}
                />
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </motion.div>
  );
};

export default NewArrivalsSlider;
