import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ========== ترجمة اللغة الإنجليزية ==========
const enTranslations = {
  navigation: {
    home: 'Home',
    categories: 'Categories',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    offers: 'Special Offers',
    admin_panel: 'Admin Panel'
  },
  
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    enter_email: 'Enter email',
    no_account: "Don't have an account?",
    have_account: "Already have an account?"
  },
  
  product: {
    name: 'Product Name',
    price: 'Price',
    description: 'Description',
    add_to_cart: 'Add to Cart',
    view_details: 'View Details',
    remove: 'Remove',
    size: 'Size',
    color: 'Color',
    quantity: 'Quantity',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock'
  },
  
  testimonials: {
    title: 'Customer Reviews',
    rating: 'Rating: {rating}/5',
    write_review: 'Write a Review',
    all_reviews: 'See All Reviews',
    no_reviews: 'No reviews yet'
  },
  
  admin: {
    add_product: 'Add Product',
    edit_product: 'Edit Product',
    delete_product: 'Delete Product',
    product_list: 'Product List',
    orders: 'Orders',
    users: 'Users',
    statistics: 'Statistics'
  },
  
  common: {
    search: 'Search',
    view: 'View',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Operation succeeded'
  },
  
  cart: {
    title: 'Shopping Cart',
    subtotal: 'Subtotal',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    empty_cart: 'Your cart is empty',
    items_count: '{count} items'
  },
  
  notifications: {
    added_to_cart: 'Added to cart successfully',
    removed_from_cart: 'Removed from cart',
    login_success: 'Logged in successfully',
    logout_success: 'Logged out successfully',
    added_to_favorites: 'Added to favorites'
  }
};

// ========== ترجمة اللغة العربية ==========
const arTranslations = {
  navigation: {
    home: 'الرئيسية',
    categories: 'الأقسام',
    new_arrivals: 'وصل حديثاً',
    best_sellers: 'الأكثر مبيعاً',
    offers: 'عروض خاصة',
    admin_panel: 'لوحة التحكم'
  },
  
  auth: {
    login: 'تسجيل الدخول',
    register: 'تسجيل حساب',
    logout: 'تسجيل خروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    full_name: 'الاسم الكامل',
    enter_email: 'أدخل البريد الإلكتروني',
    no_account: 'ليس لديك حساب؟',
    have_account: 'لديك حساب بالفعل؟'
  },
  
  product: {
    name: 'اسم المنتج',
    price: 'السعر',
    description: 'الوصف',
    add_to_cart: 'أضف إلى السلة',
    view_details: 'عرض التفاصيل',
    remove: 'إزالة',
    size: 'المقاس',
    color: 'اللون',
    quantity: 'الكمية',
    in_stock: 'متوفر في المخزن',
    out_of_stock: 'غير متوفر'
  },
  
  testimonials: {
    title: 'آراء العملاء',
    rating: 'التقييم: {rating}/5',
    write_review: 'أضف تقييمك',
    all_reviews: 'عرض جميع التقييمات',
    no_reviews: 'لا توجد تقييمات بعد'
  },
  
  admin: {
    add_product: 'إضافة منتج',
    edit_product: 'تعديل المنتج',
    delete_product: 'حذف المنتج',
    product_list: 'قائمة المنتجات',
    orders: 'الطلبات',
    users: 'المستخدمين',
    statistics: 'الإحصائيات'
  },
  
  common: {
    search: 'بحث',
    view: 'عرض',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    delete: 'حذف',
    confirm: 'تأكيد',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تمت العملية بنجاح'
  },
  
  cart: {
    title: 'سلة التسوق',
    subtotal: 'المجموع الفرعي',
    total: 'الإجمالي',
    checkout: 'إتمام الشراء',
    empty_cart: 'سلة التسوق فارغة',
    items_count: '{count} عنصر'
  },
  
  notifications: {
    added_to_cart: 'تمت الإضافة إلى السلة بنجاح',
    removed_from_cart: 'تمت الإزالة من السلة',
    login_success: 'تم تسجيل الدخول بنجاح',
    logout_success: 'تم تسجيل الخروج بنجاح',
    added_to_favorites: 'تم الإضافة إلى المفضلة'
  }
};

// ========== تهيئة i18n ==========
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations }
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    interpolation: {
      escapeValue: false,
      format: (value, format) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(i18n.language, { 
            style: 'currency', 
            currency: i18n.language === 'ar' ? 'EGP' : 'USD' 
          }).format(value);
        }
        return value;
      }
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;