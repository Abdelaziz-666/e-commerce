import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './i18n';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import AdminPanel from './Pages/Admin/AdminPanel';
import NotFound from './Pages/NotFound';
import ElNavbar from './components2/ElNavbar';
import Home from './Pages/Home/Home';
import FilteredProductsPage from './components2/FilteredProductsPage';
import CartPage from './Pages/Home/components/Cart/CartPage';
import FavoritesWrapper from './Pages/Home/components/FavoritesWrapper';
import ProductDetails from './Pages/ProductDetails';
import Checkout from './Pages/Home/components/Cart/CheckOutPage';
import ProfilePage from './Pages/ProfilePage';
import CategoryProducts from './Pages/Home/components/HomePage.js/CategoryProducts';

function App() {
  return (
    <Router>
      <ElNavbar/>      
            <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/favorites" element={<FavoritesWrapper />} />
        <Route path="*" element={<NotFound />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="/filtered-products" element={<FilteredProductsPage/>} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/category-products" element={<CategoryProducts />} />
      </Routes>
    </Router>
  );
}

export default App;