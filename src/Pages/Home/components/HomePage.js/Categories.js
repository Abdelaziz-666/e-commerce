import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Categories = ({ categories, products }) => {
    const navigate = useNavigate();
    
    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const isImageUrl = (icon) => {
        return typeof icon === 'string' && 
               (icon.startsWith('http') || 
               icon.startsWith('data:image'));
    };

    const handleCategoryClick = (categoryName) => {
        const filteredProducts = products.filter(product => 
            product.category === categoryName
        );
        
        navigate('/category-products', {
            state: {
                categoryName,
                filteredProducts
            }
        });
        

    };

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className="container my-5">
                <h3 className="mb-3c">Categories</h3>
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
                            <div 
                                className="categorySlider card text-center p-3 shadow-sm"
                                onClick={() => handleCategoryClick(cat.name)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ fontSize: '2rem', minHeight: '48px' }}>
                                    {isImageUrl(cat.icon) ? (
                                        <img 
                                            src={cat.icon} 
                                            alt={cat.name} 
                                            style={{ 
                                                width: '120px', 
                                                height: '120px',
                                                objectFit: 'contain'
                                            }} 
                                        />
                                    ) : (
                                        <span>{cat.icon}</span>
                                    )}
                                </div>
                                <h5 className="mt-2c">{cat.name}</h5>
                            </div>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>
        </motion.div>
    );
};

export default Categories;