'use client';

interface ButtonProps {
  text: string;
  backgroundColor: string;
}

export default function Button({ text, backgroundColor }: ButtonProps) {
  return (
    <button 
      className="hover:bg-opacity-90 text-white font-light py-3 px-6 rounded-lg transition-colors"
      style={{ backgroundColor }}
      onClick={() => {
        // Add your client-side interaction here
        console.log('Button clicked!');
      }}
    >
      {text}
    </button>
  );
} 