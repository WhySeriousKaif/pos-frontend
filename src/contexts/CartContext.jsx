import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [orderNote, setOrderNote] = useState('');

  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if product already in cart
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [
          ...prevItems,
          {
            id: Date.now(), // Temporary ID
            product,
            quantity: 1,
            price: product.sellingPrice || product.price || 0,
          }
        ];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedCustomer(null);
    setDiscount({ type: 'percentage', value: 0 });
    setOrderNote('');
  }, []);

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // Calculate discount amount
  const discountAmount = discount.type === 'percentage'
    ? (subtotal * discount.value) / 100
    : discount.value;

  // Calculate total
  const total = Math.max(0, subtotal - discountAmount);

  const value = {
    cartItems,
    selectedCustomer,
    discount,
    orderNote,
    subtotal,
    discountAmount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setSelectedCustomer,
    setDiscount,
    setOrderNote,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

