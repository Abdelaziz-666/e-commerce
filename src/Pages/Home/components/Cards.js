// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
// import { motion } from 'framer-motion';
// import { db, auth } from '../../../firebase/Config';
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { useNavigate } from 'react-router-dom';

// const Cards = ({ product }) => {
//   const { t } = useTranslation();
//   const [user] = useAuthState(auth);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [inStock, setInStock] = useState(product.stock || product.inStock || 0);
//   const [discount, setDiscount] = useState(product.discount || 0);
//   const [addedToCart, setAddedToCart] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!product.id) return;

//     const fetchProductData = async () => {
//       try {
//         const productRef = doc(db, 'products', product.id);
//         const productSnap = await getDoc(productRef);
//         if (productSnap.exists()) {
//           const productData = productSnap.data();
//           setInStock(productData.inStock || productData.stock || 0);
//           setDiscount(productData.discount || 0);
//         }
//       } catch (err) {
//         console.error('Error fetching product data:', err);
//       }
//     };

//     fetchProductData();
//   }, [product.id]);

//   const addToCart = async () => {
//     if (!user) {
//       navigate('/login', { state: { from: window.location.pathname } });
//       return;
//     }

//     if (inStock <= 0) {
//       setError(t('product.out_of_stock'));
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const userRef = doc(db, 'users', user.uid);
//       const userSnap = await getDoc(userRef);
//       const currentCart = userSnap.exists() ? userSnap.data().cart || [] : [];

//       const existingItem = currentCart.find(item => item.id === product.id);
//       let updatedCart;

//       if (existingItem) {
//         updatedCart = currentCart.map(item => 
//           item.id === product.id 
//             ? { ...item, quantity: item.quantity + 1 } 
//             : item
//         );
//       } else {
//         updatedCart = [
//           ...currentCart,
//           {
//             id: product.id,
//             name: product.name,
//             price: discount > 0 ? product.price * (1 - discount / 100) : product.price,
//             originalPrice: product.price,
//             image: product.imageUrl || '/images/no-image.png',
//             quantity: 1,
//             addedAt: new Date(),
//             discount: discount
//           }
//         ];
//       }

//       await updateDoc(userRef, { cart: updatedCart });
//       setAddedToCart(true);
//       setTimeout(() => setAddedToCart(false), 2000);
//     } catch (err) {
//       console.error("Error adding to cart:", err);
//       setError(t('cart.add_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fallbackImage = "/images/no-image.png";

//   return (
//     <motion.div 
//       whileHover={{ scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 300 }}
//       className="h-100"
//     >
//       <Card className="h-100 shadow-sm">
//         <div className="position-relative">
//           <Card.Img 
//             variant="top" 
//             src={product.imageUrl || fallbackImage}
//             alt={product.name}
//             onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
//             style={{ height: '200px', objectFit: 'cover' }}
//           />
//           {inStock <= 0 ? (
//             <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
//               {t('product.out_of_stock')}
//             </Badge>
//           ) : discount > 0 ? (
//             <Badge bg="success" className="position-absolute top-0 end-0 m-2">
//               {discount}% OFF
//             </Badge>
//           ) : null}
//         </div>

//         <Card.Body className="d-flex flex-column">
//           <Card.Title className="mb-2">{product.name}</Card.Title>
//           <div className="mb-2">
//             {discount > 0 ? (
//               <>
//                 <span className="text-muted text-decoration-line-through me-2">
//                   ${product.price.toFixed(2)}
//                 </span>
//                 <span className="text-danger fw-bold">
//                   ${(product.price * (1 - discount / 100)).toFixed(2)}
//                 </span>
//               </>
//             ) : (
//               <span className="fw-bold">${product.price.toFixed(2)}</span>
//             )}
//           </div>

//           {error && <Alert variant="danger" className="py-1">{error}</Alert>}

//           <Button 
//             variant={addedToCart ? 'success' : (inStock > 0 ? 'primary' : 'secondary')}
//             onClick={addToCart}
//             disabled={inStock <= 0 || loading || addedToCart}
//             className="mt-auto"
//           >
//             {loading ? (
//               <Spinner animation="border" size="sm" />
//             ) : addedToCart ? (
//               <>{t('product.added_to_cart')} ✓</>
//             ) : inStock > 0 ? (
//               t('product.add_to_cart')
//             ) : (
//               t('product.out_of_stock')
//             )}
//           </Button>
//         </Card.Body>
//       </Card>
//     </motion.div>
//   );
// };

// export default Cards;