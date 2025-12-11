import React from 'react';
import { Star } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      text: "The blue light glasses completely cured my evening headaches. Plus, they look incredibly chic.",
      role: "Digital Designer",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Marcus Chen",
      text: "I was skeptical about buying glasses online, but the face shape guide was spot on. Fit perfectly.",
      role: "Architect",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Elena Rossi",
      text: "Luxury quality without the ridiculous markup. The gold detailing on the frames is exquisite.",
      role: "Fashion Editor",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section className="py-24 bg-white text-black border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Thousands of Happy Eyes</h2>
          <div className="flex justify-center items-center gap-2">
            <div className="flex text-gold-500">
                {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" className="w-5 h-5" />)}
            </div>
            <span className="font-bold">4.9/5</span>
            <span className="text-gray-400">(2,400+ Reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                    <p className="text-lg italic text-gray-700 mb-6">"{review.text}"</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                             <ImageWithFallback 
                                src={review.image} 
                                alt={review.name} 
                                className="w-full h-full object-cover" 
                             />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{review.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{review.role}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;