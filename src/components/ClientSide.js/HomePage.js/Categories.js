import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';
const categories = [
    { id: 1, name: 'ff', icon: '4' },
    { id: 2, name: 'rr', icon: '3' },
    { id: 3, name: 'ee', icon: 'q' },
    { id: 4, name: 'ww', icon: 'w' },
    { id: 5, name: 'qq', icon: 'e' },
];
const Categories = () => {
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
        <div className="container my-5">
            <h3 className="mb-3">Categories</h3>
            <Splide
                options={{
                    type: 'loop',
                    perPage: 3,
                    gap: '1rem',
                    arrows: false,
                    pagination: true,
                    autoplay: true,
                    interval: 2500,
                    breakpoints: {
                        768: {
                            perPage: 2,
                        },
                        480: {
                            perPage: 1,
                        },
                    },
                }}
                aria-label="Category Slider"
                className="mt-3"
            >
                {categories.map((cat) => (

                    <SplideSlide key={cat.id} className="d-flex justify-content-center">
                        <div className="categorySlider card text-center p-3 shadow-sm">
                            <div style={{ fontSize: '2rem' }}>{cat.icon}</div>
                            <h5 className="mt-2">{cat.name}</h5>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    </motion.div>
    );
};

export default Categories
