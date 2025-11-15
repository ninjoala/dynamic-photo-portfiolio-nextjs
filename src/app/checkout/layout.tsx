import { CartProvider } from '../contexts/CartContext';
import { PhotoPackageCartProvider } from '../orders/contexts/PhotoPackageCartContext';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PhotoPackageCartProvider>
        {children}
      </PhotoPackageCartProvider>
    </CartProvider>
  );
}
