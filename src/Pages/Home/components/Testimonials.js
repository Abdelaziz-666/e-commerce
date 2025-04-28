import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    { 
      id: 1, 
      name: t('testimonials.user1.name'),
      comment: t('testimonials.user1.comment'),
      rating: 5
    },
    { 
      id: 2, 
      name: t('testimonials.user2.name'),
      comment: t('testimonials.user2.comment'),
      rating: 4
    }
  ];

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">{t('testimonials.title')}</h2>
      <Row>
        {testimonials.map(testimonial => (
          <Col key={testimonial.id} md={6}>
            <Card className="mb-4 p-3">
              <Card.Body>
                <div className="mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <Card.Text className="fst-italic">"{testimonial.comment}"</Card.Text>
                <Card.Footer className="bg-transparent">
                  <strong>- {testimonial.name}</strong>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default Testimonials;