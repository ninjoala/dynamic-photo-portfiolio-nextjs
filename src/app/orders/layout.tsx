import { PhotoPackageCartProvider } from './contexts/PhotoPackageCartContext';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhotoPackageCartProvider>
      {children}
    </PhotoPackageCartProvider>
  );
}
