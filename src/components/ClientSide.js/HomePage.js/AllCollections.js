import React from 'react'
import { useState } from 'react';
import { Button, Card, Carousel, Col, Row } from 'react-bootstrap';
import { motion } from 'framer-motion';
const AllCollections = () => {
    const products = [
        { id: 1, name: "T-Shirt", price: "$20", img: "OIP.JPG" },
        { id: 2, name: "Jacket", price: "$45", img: "OIP.JPG" },
        { id: 3, name: "Shoes", price: "$60", img: "OIP.JPG" },
        { id: 4, name: "Jeans", price: "$35", img: "OIP.JPG" },
        { id: 5, name: "Hat", price: "$10", img: "OIP.JPG" },
        { id: 6, name: "Socks", price: "$5", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
        { id: 7, name: "Scarf", price: "$12", img: "OIP.JPG" },
    ];
    const [showMore, setShowMore] = useState(false);
    const visibleProducts = showMore ? products : products.slice(0, 7);
    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div>
            <div className='container'>
                <Row className='justify-content-center g-3'>
                    {
                        visibleProducts.map((product) => (

                            <Col xs={8} sm={6} md={4} lg={3} xl={3} className=' d-flex justify-content-center'>
                                <motion.div
                                    variants={itemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                >
                                    <Card key={product.id} className='my-3' >
                                        <Carousel className="d-flex justify-content-center" >
                                            <Carousel.Item className="d-flex justify-content-center" style={{ width: "95%", objectFit: "contain" }}>
                                                <img className="img-item d-block w-75 " src={product.img} />
                                            </Carousel.Item>
                                        </Carousel>
                                        <Card.Body>
                                            <Card.Title>{product.name}</Card.Title>
                                            <Card.Text style={{ fontSize: "medium" }}>{product.size}</Card.Text >
                                            <Card.Text style={{ fontSize: "medium", fontWeight: "bolder" }}>{product.time}</Card.Text >
                                            <div className='price d-flex justify-content-between '>
                                                <Card.Text className='mt-3'> {product.price} <span>جنيه</span></Card.Text>
                                            </div>
                                            <div>
                                            </div>
                                            <div className='d-flex justify-content-between mt-2 '>
                                                <Button variant="primary" className='d-flex me-1 justify-content-center' style={{ width: "fit-content", fontSize: "15px" }}> Add to cart</Button>
                                                <Button variant="primary" className=' d-flex ms-1 justify-content-center' style={{ width: "fit-content", fontSize: "15px" }} >Order Now</Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                </Row>
            </div>
            {showMore ? null :
                <div className='w-100 d-flex justify-content-center'>
                    <button
                        onClick={() => setShowMore(true)}
                        className="btn ms-2 btn-primary"> Show More    </button>
                </div>
            }
        </div>
    )
}

export default AllCollections
