import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';
const NewCollectionSlider = () => {
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
                    perPage: 3,
                    focus  : 'center',
                }}
                aria-label="New Arrivals"
            >
                <SplideSlide className="d-flex justify-content-center me-4 "  >
                    <div> <img  className='card' src='OIP.jpg' ></img></div>
                </SplideSlide>
                <SplideSlide className="d-flex justify-content-center me-4 " >
                    <div> <img className='card'  src='OIP.jpg'></img></div>
                </SplideSlide>
                <SplideSlide className="d-flex justify-content-center me-4 " >
                    <div> <img className='card'  src='OIP.jpg'></img></div>
                </SplideSlide>
            </Splide>


        </div>
  </motion.div>
  )
}

export default NewCollectionSlider
