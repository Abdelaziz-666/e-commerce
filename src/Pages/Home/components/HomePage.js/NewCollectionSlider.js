import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';

const NewCollectionSlider = ({ products }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div
        className="container mt-5"
        style={{
          maxWidth: '100vw',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <Splide
          options={{
            type: 'loop',
            autoplay: true,
            interval: 3000,
            arrows: true,
            pagination: true,
            perPage: 1,
            focus: 'center',
            gap: 0,
            breakpoints: {
              768: {
                perPage: 1,
              },
              1024: {
                perPage: 1,
              },
            }
          }}
          aria-label="New Collection"
          style={{ maxWidth: '100%', margin: '0 auto' }}
        >
          {products?.map((product, index) => (
            <SplideSlide
              key={index}
              className="d-flex justify-content-center"
              style={{ maxWidth: '100vw' }}
            >
              <div
                style={{
                  width: '100%',
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                className='scroll-hidden'

              >
                <img
                  src={product.image}
                  alt={`Product ${index}`}
                  style={{
                    width: '100%',
                    objectFit: 'cover',
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

export default NewCollectionSlider;
