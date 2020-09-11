import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storedCart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setProducts(parsedCart);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productAlreadyExists = products.find(
        stateProduct => stateProduct.id === product.id,
      );

      if (productAlreadyExists) {
        const index = products.indexOf(productAlreadyExists);
        const updatedProducts = [...products];
        updatedProducts[index].quantity += 1;
        setProducts(updatedProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updatedProducts),
        );
      } else {
        product.quantity = 1;

        setProducts([...products, product]);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = [...products];
      const productIndex = products.findIndex(product => product.id === id);
      updatedProducts[productIndex].quantity += 1;
      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = [...products];
      const productIndex = products.findIndex(product => product.id === id);
      updatedProducts[productIndex].quantity -= 1;
      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
