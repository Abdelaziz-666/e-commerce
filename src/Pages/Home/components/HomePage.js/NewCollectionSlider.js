import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NewCollectionSlider = ({ products }) => {
  const navigate = useNavigate();
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
      <div className="slider-container">
        <Splide
          options={{
            type: 'loop',
            perPage: 3,
            gap: '1rem',
            arrows: false,
            pagination: false,
            breakpoints: {
              768: { perPage: 2 },
              480: { perPage: 1 },
            },
          }}
        >
          {products?.map((product, index) => (
            <SplideSlide key={index}>
              <div className="product-card">
                <div className="image-wrapper-fixed"
                  onClick={() => navigate(`/product/${product.id}`)}

                >
                  <img
                    src={product.mainImage || 'https://via.placeholder.com/300'}
                    alt={`Product ${index}`}
                    className="slider-image"
                  />
                </div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </motion.div>
  );
};

export default NewCollectionSlider;
