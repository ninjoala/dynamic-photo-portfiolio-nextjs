import Gallery from '../components/Gallery';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-8">
        <h1 className="text-4xl font-bold text-center mb-8">My Portfolio</h1>
        <Gallery />
      </div>
    </main>
  );
} 