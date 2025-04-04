export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="space-y-4">
        <p className="text-3xl text-stone-800 font-light tracking-widest animate-fade-up">
          Welcome
        </p>
        <p className="text-lg text-stone-600 font-light tracking-wider animate-fade-up-delay">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
} 