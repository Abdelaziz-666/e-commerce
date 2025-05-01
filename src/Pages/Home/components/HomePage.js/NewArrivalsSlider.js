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
    >
      <div
        className="container-fluid p-0 mt-5 "
        style={{ maxWidth: '100vw', overflow: 'hidden' }}
      >
        <Splide
          options={{
            type: 'loop',
            autoplay: true,
            interval: 3000,
            arrows: true,
            pagination: true,
            perPage: 1,
            gap: 0,
          }}
          aria-label="New Arrivals"
          style={{
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          {products?.map((product, index) => (
            <SplideSlide key={index}>
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
                  src={ product.mainImage}
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

        <div className="sliderProgress">
          <div className="sliderBar mt-1" style={{ width: '100%' }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewArrivalsSlider;
