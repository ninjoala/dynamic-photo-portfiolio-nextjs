import { CartProvider } from '../contexts/CartContext';

export default function CougarComebackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}