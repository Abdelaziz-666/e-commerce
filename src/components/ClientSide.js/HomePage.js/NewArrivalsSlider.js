import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';
const NewArrivalsSlider = () => {
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
        <div className="container mt-5">
            <Splide
                options={{
                    type: 'loop',
                    autoplay: true,
                    interval: 3000,
                    arrows: true,
                    pagination: true,
                }}
                aria-label="New Arrivals"
            >
                <SplideSlide className="d-flex justify-content-center" >
                    <div> <img src='OIP.jpg' ></img></div>
                </SplideSlide>
                <SplideSlide className="d-flex justify-content-center">
                    <div> <img src='OIP.jpg'></img></div>
                </SplideSlide>
                <SplideSlide className="d-flex justify-content-center">
                    <div> <img src='OIP.jpg'></img></div>
                </SplideSlide>
            </Splide>

            <div className="sliderProgress">
                <div className="sliderBar mt-1" style={{ width: '100%' }}></div>
            </div>
        </div>
</motion.div>
    );
};

export default NewArrivalsSlider;
