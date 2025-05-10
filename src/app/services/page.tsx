export default function ServicesPage() {
  const services = [
    {
      title: "Portrait Photography",
      description: "Professional portrait sessions for individuals, families, or corporate headshots. Includes lighting setup, multiple poses, and digital retouching.",
      price: "Starting at $200",
      duration: "1-2 hours",
      deliverables: "10-15 edited digital photos",
    },
    {
      title: "Wedding Photography",
      description: "Comprehensive wedding day coverage including ceremony, reception, formal portraits, and candid moments. Multiple camera angles and professional lighting.",
      price: "Starting at $2,000",
      duration: "8-10 hours",
      deliverables: "300+ edited digital photos",
    },
    {
      title: "Event Photography",
      description: "Professional coverage of corporate events, parties, conferences, and social gatherings. Includes candid shots and group photos.",
      price: "Starting at $500",
      duration: "4-6 hours",
      deliverables: "100+ edited digital photos",
    },
    {
      title: "Commercial Photography",
      description: "High-quality product photography, real estate shoots, and business promotional material. Includes professional lighting and post-processing.",
      price: "Starting at $400",
      duration: "3-4 hours",
      deliverables: "20-30 edited digital photos",
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light mb-4">Photography Services</h1>
          <p className="text-xl text-gray-600">Professional photography services tailored to your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium w-32">Price:</span>
                    <span className="text-gray-600">{service.price}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32">Duration:</span>
                    <span className="text-gray-600">{service.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32">Deliverables:</span>
                    <span className="text-gray-600">{service.deliverables}</span>
                  </div>
                </div>
                <button className="mt-8 w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-light mb-4">Custom Packages Available</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need something specific? Contact us to discuss custom photography packages 
            tailored to your unique requirements. We're happy to create a personalized 
            solution that meets your needs and budget.
          </p>
          <button className="mt-8 bg-black text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors duration-300">
            Contact for Custom Quote
          </button>
        </div>
      </div>
    </div>
  );
} 