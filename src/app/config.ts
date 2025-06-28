// Navigation configuration
export interface NavigationConfig {
  links: Array<{
    title: string;
    path: string;
    isExternal?: boolean;
  }>;
}

// Photography category configuration
export interface PhotographyCategory {
  id: string;
  title: string;
  description: string;
  bucketFolder: string; // The folder in Wasabi bucket containing the images
  sampleImages?: string[]; // Optional sample images to show before loading from bucket
  features?: string[]; // Special features or services offered for this category
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Social media links
export interface SocialConfig {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
  twitter?: string;
  linkedin?: string;
}

// Portfolio configuration
export interface PortfolioConfig {
  categories: Array<{
    id: string;
    title: string;
    description: string;
    coverImage: string;
    images: Array<{
      src: string;
      alt: string;
      width: number;
      height: number;
      caption?: string;
      location?: string;
      date?: string;
    }>;
  }>;
}

// Pricing and packages
export interface PricingConfig {
  packages: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  }>;
  notes?: string[];
}

// Contact form configuration
export interface ContactConfig {
  email: string;
  phone?: string;
  location: string;
  availabilityHours?: string;
  formFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date';
    required: boolean;
    options?: string[]; // For select fields
  }>;
}

// About section configuration
export interface AboutConfig {
  headline: string;
  bio: string;
  profileImage: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  equipment?: Array<{
    category: string;
    items: string[];
  }>;
  awards?: Array<{
    title: string;
    year: string;
    description?: string;
  }>;
}

// Blog/News section
export interface BlogConfig {
  enabled: boolean;
  postsPerPage: number;
  categories?: string[];
}

// FAQ section
export interface FAQConfig {
  categories: Array<{
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  }>;
}

// Image configuration with expanded options
export interface ImageConfig {
  hero: string;
  logo: {
    light: string;
    dark?: string;
  };
  favicon: string;
  ogImage: string; // Open Graph image for social sharing
  gallery: string[];
  profile: string;
  backgrounds: {
    about?: string;
    contact?: string;
    portfolio?: string;
  };
}

// Text configuration with expanded options
export interface TextConfig {
  siteTitle: string;
  siteDescription: string; // For SEO
  heading: string;
  description: string;
  buttonText: string;
  aboutTitle: string;
  aboutText: string;
  servicesTitle: string;
  servicesItems: Array<{
    title: string;
    description: string;
    price?: string;
    duration?: string;
  }>;
  testimonials: Array<{
    name: string;
    comment: string;
    role?: string;
    image?: string;
    rating?: number;
  }>;
  contactText: string;
  footerText: string;
  hero: {
    heading: string;
    subtext: string;
  };
}

// Theme configuration
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: {
    heading: string;
    body: string;
  };
  darkMode: {
    enabled: boolean;
    default: 'light' | 'dark' | 'system';
  };
}

// Complete site configuration
export interface SiteConfig {
  text: TextConfig;
  images: ImageConfig;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  social: SocialConfig;
  portfolio: PortfolioConfig;
  pricing: PricingConfig;
  contact: ContactConfig;
  about: AboutConfig;
  blog?: BlogConfig;
  faq: FAQConfig;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
  };
  features: {
    bookingEnabled: boolean;
    darkMode: boolean;
    newsletter: boolean;
    clientProofing: boolean;
  };
  photographyCategory: PhotographyCategory; // New field for category-specific configuration
}

// Default lorem text
const loremText = {
  short: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  medium: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna ultrices ultricies vel in metus. Cras porta semper magna.",
  long: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna ultrices ultricies vel in metus. Cras porta semper magna. Mauris eget elit ut quam feugiat tincidunt non nec elit. Proin vel libero vitae nunc eleifend pellentesque. Fusce a augue eget turpis tincidunt lobortis vel non velit."
};

// Images section
const images: ImageConfig = {
  hero: "",
  logo: {
    light: "",
    dark: ""
  },
  favicon: "",
  ogImage: "",
  profile: "",
  gallery: [],
  backgrounds: {
    about: "",
    contact: "",
    portfolio: ""
  }
};

// Portfolio section
const portfolio: PortfolioConfig = {
  categories: [
    {
      id: "architecture",
      title: "Architecture Portfolio",
      description: "Stunning architectural photography showcasing modern design",
      coverImage: "",
      images: []
    },
    {
      id: "family",
      title: "Family Portfolio", 
      description: "Capturing precious family moments and memories",
      coverImage: "",
      images: []
    },
    {
      id: "romantic",
      title: "Romantic Portfolio",
      description: "Beautiful and intimate romantic photography",
      coverImage: "",
      images: []
    }
  ]
};

// Photography categories
export const photographyCategories: Record<string, PhotographyCategory> = {
  'realestate': {
    id: 'real-estate',
    title: 'Real Estate Photography',
    description: 'Professional real estate photography that sells properties faster',
    bucketFolder: 'real-estate',
    features: [
      'HDR Photography',
      'Virtual Staging',
      'Aerial Photography',
      'Floor Plans',
      'Virtual Tours'
    ],
    priceRange: {
      min: 150,
      max: 500,
      currency: 'USD'
    }
  },
  'events': {
    id: 'events',
    title: 'Event Photography',
    description: 'Capturing your special moments with style',
    bucketFolder: 'events',
    features: [
      'Corporate Events',
      'Weddings',
      'Parties',
      'Conferences',
      'Live Coverage'
    ],
    priceRange: {
      min: 200,
      max: 1000,
      currency: 'USD'
    }
  },
  'family': {
    id: 'family',
    title: 'Family Photography',
    description: 'Preserving precious family moments',
    bucketFolder: 'family',
    features: [
      'Family Portraits',
      'Children Photography',
      'Generational Photos',
      'Holiday Sessions',
      'Location Shoots'
    ],
    priceRange: {
      min: 175,
      max: 600,
      currency: 'USD'
    }
  },
  'sports': {
    id: 'sports',
    title: 'Sports Photography',
    description: 'Dynamic sports photography that captures the action',
    bucketFolder: 'sports',
    features: [
      'Action Shots',
      'Team Photos',
      'Individual Portraits',
      'Tournament Coverage',
      'Sports Events'
    ],
    priceRange: {
      min: 150,
      max: 800,
      currency: 'USD'
    }
  },
  'shared': {
    id: 'shared',
    title: 'Shared Assets',
    description: 'Common images used across all site versions',
    bucketFolder: 'shared',
    features: []
  }
};

// Helper function to get category from domain
export function getCategoryFromDomain(domain: string): string {
  console.log('getCategoryFromDomain - Input domain:', domain);
  
  // Remove port number first
  const domainWithoutPort = domain.split(':')[0];
  
  // Remove common TLDs and www
  const cleanDomain = domainWithoutPort
    .replace(/\.(com|net|org|local|localhost|vercel\.app)$/i, '')
    .replace(/^www\./i, '')
    .toLowerCase();
    
  console.log('getCategoryFromDomain - Clean domain:', cleanDomain);

  // If we're on nickdobosmedia.com, use the realestate category
  if (cleanDomain === 'nickdobosmedia') {
    console.log('getCategoryFromDomain - Mapping nickdobosmedia to realestate');
    return 'realestate';
  }

  // Extract category from domain (e.g., "newnanrealestatephotography" -> "real-estate")
  const categoryMatches = cleanDomain.match(/newnan(.+?)photography/);
  console.log('getCategoryFromDomain - Category matches:', categoryMatches);
  
  if (categoryMatches && categoryMatches[1]) {
    const extractedCategory = categoryMatches[1].toLowerCase().replace(/[^a-z-]/g, '-');
    console.log('getCategoryFromDomain - Extracted category:', extractedCategory);
    const finalCategory = photographyCategories[extractedCategory] ? extractedCategory : 'default';
    console.log('getCategoryFromDomain - Final category:', finalCategory);
    return finalCategory;
  }

  return 'default';
}

// Default configuration
const defaultConfig: SiteConfig = {
  text: {
    siteTitle: "Our Photography Services",
    siteDescription: loremText.medium,
    heading: "Welcome to Our Photography Services",
    description: loremText.medium,
    buttonText: "Learn More",
    aboutTitle: "About Us",
    aboutText: loremText.long,
    servicesTitle: "Our Services",
    servicesItems: [
      { title: "Service 1", description: loremText.medium },
      { title: "Service 2", description: loremText.medium },
      { title: "Service 3", description: loremText.medium }
    ],
    testimonials: [
      { name: "Client Name 1", comment: loremText.medium },
      { name: "Client Name 2", comment: loremText.medium }
    ],
    contactText: loremText.medium,
    footerText: loremText.medium,
    hero: {
      heading: "Professional Photography Services in Newnan",
      subtext: "Flexible scheduling. Local expertise. A friendly, professional experience every time."
    }
  },
  images: images,
  theme: {
    primaryColor: "#4A5568",
    secondaryColor: "#CBD5E0",
    accentColor: "#805AD5",
    fontFamily: {
      heading: "sans-serif",
      body: "sans-serif"
    },
    darkMode: {
      enabled: false,
      default: 'light'
    }
  },
  navigation: {
    links: [
      { title: "Home", path: "/" },
      { title: "About", path: "/about" },
      { title: "Services", path: "/services" },
      { title: "Portfolio", path: "/portfolio" },
      { title: "Pricing", path: "/pricing" },
      { title: "Contact", path: "/contact" }
    ]
  },
  social: {
    instagram: "https://instagram.com/newnanphotography",
    facebook: "https://facebook.com/newnanphotography",
    pinterest: "https://pinterest.com/newnanphotography",
    twitter: "https://twitter.com/newnanphotography",
    linkedin: "https://linkedin.com/company/newnanphotography"
  },
  portfolio: portfolio,
  pricing: {
    packages: [
      {
        name: "Basic",
        price: "$100",
        description: "Perfect for beginners",
        features: ["1 hour session", "10 high-res images"],
        buttonText: "Book Now"
      },
      {
        name: "Pro",
        price: "$200",
        description: "For experienced photographers",
        features: ["2 hours session", "20 high-res images"],
        isPopular: true,
        buttonText: "Book Now"
      },
      {
        name: "Premium",
        price: "$300",
        description: "For professional clients",
        features: ["3 hours session", "30 high-res images"],
        buttonText: "Book Now"
      }
    ],
    notes: ["All packages include editing and retouching"]
  },
  contact: {
    email: "info@newnanphotography.com",
    phone: "(555) 555-5555",
    location: "New York, NY",
    availabilityHours: "Mon-Fri: 9am-5pm",
    formFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: false },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "date", label: "Date", type: "date", required: false },
      { name: "service", label: "Service", type: "select", required: true, options: ["Real Estate", "Family", "Wedding"] }
    ]
  },
  about: {
    headline: "About Us",
    bio: loremText.long,
    profileImage: "https://picsum.photos/id/64/400/400",
    stats: [
      { value: "10+", label: "Years of Experience" },
      { value: "100+", label: "Completed Projects" },
      { value: "50+", label: "Satisfied Clients" }
    ],
    equipment: [
      { category: "Cameras", items: ["Canon EOS R5", "Sony A7 III"] },
      { category: "Lenses", items: ["24-70mm f/2.8", "70-200mm f/2.8"] },
      { category: "Lighting", items: ["Profoto B1", "Godox V860 II"] }
    ]
  },
  blog: {
    enabled: true,
    postsPerPage: 10
  },
  faq: {
    categories: [
      {
        title: "General",
        questions: [
          { question: "What types of photography do you offer?", answer: "We offer a wide range of photography services including Real Estate, Family, and Wedding photography." },
          { question: "Do you travel for shoots?", answer: "Yes, we are happy to travel for shoots. Please contact us for a quote." },
          { question: "How long does it take to get my photos?", answer: "It typically takes 4-6 weeks to receive your edited photos." }
        ]
      },
      {
        title: "Pricing",
        questions: [
          { question: "Do you offer discounts for multiple services?", answer: "Yes, we offer discounts for booking multiple services." },
          { question: "Do you offer payment plans?", answer: "Yes, we offer flexible payment plans. Please contact us for more information." },
          { question: "Do you offer refunds?", answer: "Refunds are not offered, but we are happy to discuss any concerns." }
        ]
      },
      {
        title: "Services",
        questions: [
          { question: "Do you offer photo editing services?", answer: "Yes, we offer photo editing services. Please contact us for more information." },
          { question: "Do you offer prints and canvases?", answer: "Yes, we offer prints and canvases. Please contact us for more information." },
          { question: "Do you offer digital downloads?", answer: "Yes, we offer digital downloads. Please contact us for more information." }
        ]
      }
    ]
  },
  seo: {
    title: "New Nan Photography",
    description: "Professional photography services for Real Estate, Family, and Wedding photography. Located in New York, NY.",
    keywords: ["New Nan Photography", "Real Estate Photography", "Family Photography", "Wedding Photography", "New York"],
    author: "New Nan Photography"
  },
  features: {
    bookingEnabled: true,
    darkMode: false,
    newsletter: true,
    clientProofing: true
  },
  photographyCategory: photographyCategories['realestate'] // Default to real estate if no match
};

// Version-specific configurations
export const siteVersions: Record<string, SiteConfig> = {
  // Real Estate Photography Version
  "newnanrealestatephotography": {
    ...defaultConfig,
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Real Estate Photography",
      description: "We capture the beauty of properties with precision and style.",
      buttonText: "Book a Real Estate Session",
      aboutTitle: "About Our Real Estate Photography",
      servicesTitle: "Our Real Estate Services",
      hero: {
        heading: "Professional Photos for Newnan's Top Agents",
        subtext: "Flexible scheduling. Local expertise. A friendly, professional experience every time."
      }
    },
    photographyCategory: photographyCategories['realestate'],
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#2D3748"
    }
  },
  
  // Events Photography Version
  "newnaneventphotography": {
    ...defaultConfig,
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Event Photography",
      description: "Capturing the moments that matter.",
      buttonText: "Book an Event",
      aboutTitle: "About Our Event Photography",
      servicesTitle: "Our Event Services",
      hero: {
        heading: "Capturing Newnan's Special Moments",
        subtext: "From corporate events to weddings, we capture the moments that matter most."
      }
    },
    photographyCategory: photographyCategories['events'],
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#4A5568"
    }
  },

  // Family Photography Version
  "newnanfamilyphotography": {
    ...defaultConfig,
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Family Photography",
      description: "Cherish your family moments forever.",
      buttonText: "Book a Family Session",
      aboutTitle: "About Our Family Photography",
      servicesTitle: "Our Family Photo Services",
      hero: {
        heading: "Creating Timeless Family Memories",
        subtext: "Natural, authentic family photography that captures your family's unique story."
      }
    },
    photographyCategory: photographyCategories['family'],
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#68A1DC"
    }
  },

  // Sports Photography Version
  "newnansportsphotography": {
    ...defaultConfig,
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Sports Photography",
      description: "Capturing the action and emotion of sports.",
      buttonText: "Book Sports Coverage",
      aboutTitle: "About Our Sports Photography",
      servicesTitle: "Our Sports Services",
      hero: {
        heading: "Capturing the Action in Newnan Sports",
        subtext: "Dynamic sports photography that brings the intensity of the game to life."
      }
    },
    photographyCategory: photographyCategories['sports'],
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#E53E3E"
    }
  },
  
  // Default fallback version
  "default": defaultConfig
};

// Function to get configuration based on domain or version ID
export function getConfig(domain: string): SiteConfig {
  const cleanDomain = domain.toLowerCase();
  return siteVersions[cleanDomain] || siteVersions.default;
}
  