// Image configuration with placeholder/lorem images
export interface ImageConfig {
  hero: string;
  gallery: string[];
  profile: string;
  logo: string;
}

// Text configuration with placeholder/lorem text
export interface TextConfig {
  heading: string;
  description: string;
  buttonText: string;
  aboutTitle: string;
  aboutText: string;
  servicesTitle: string;
  servicesItems: Array<{
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    name: string;
    comment: string;
  }>;
  contactText: string;
}

// Complete site configuration
export interface SiteConfig {
  text: TextConfig;
  images: ImageConfig;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

// Default lorem text
const loremText = {
  short: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  medium: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna ultrices ultricies vel in metus. Cras porta semper magna.",
  long: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna ultrices ultricies vel in metus. Cras porta semper magna. Mauris eget elit ut quam feugiat tincidunt non nec elit. Proin vel libero vitae nunc eleifend pellentesque. Fusce a augue eget turpis tincidunt lobortis vel non velit."
};

// Picsum placeholder images
const placeholderImages = {
  hero: "https://picsum.photos/id/164/1200/600",  // Landscape format for hero
  profile: "https://picsum.photos/id/64/400/400", // Square for profile pic
  logo: "https://picsum.photos/id/28/200/100",    // Logo format
  gallery: [
    "https://picsum.photos/id/239/800/600",       // Gallery images
    "https://picsum.photos/id/42/800/600",
    "https://picsum.photos/id/119/800/600",
    "https://picsum.photos/id/188/800/600"
  ]
};

// Themed placeholder images for different photography types
const realEstateImages = {
  hero: "https://picsum.photos/id/87/1200/600",    // Architecture
  profile: "https://picsum.photos/id/64/400/400",
  logo: "https://picsum.photos/id/28/200/100",
  gallery: [
    "https://picsum.photos/id/173/800/600",        // Buildings
    "https://picsum.photos/id/110/800/600", 
    "https://picsum.photos/id/189/800/600",
    "https://picsum.photos/id/174/800/600"
  ]
};

const familyImages = {
  hero: "https://picsum.photos/id/25/1200/600",   // People
  profile: "https://picsum.photos/id/64/400/400",
  logo: "https://picsum.photos/id/28/200/100",
  gallery: [
    "https://picsum.photos/id/177/800/600",       // Outdoors
    "https://picsum.photos/id/61/800/600",
    "https://picsum.photos/id/65/800/600",
    "https://picsum.photos/id/160/800/600"
  ]
};

const weddingImages = {
  hero: "https://picsum.photos/id/56/1200/600",    // Romantic
  profile: "https://picsum.photos/id/64/400/400",
  logo: "https://picsum.photos/id/28/200/100",
  gallery: [
    "https://picsum.photos/id/152/800/600",
    "https://picsum.photos/id/106/800/600",
    "https://picsum.photos/id/133/800/600",
    "https://picsum.photos/id/24/800/600"
  ]
};

// Default configuration
const defaultConfig: SiteConfig = {
  text: {
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
    contactText: loremText.medium
  },
  images: placeholderImages,
  theme: {
    primaryColor: "#4A5568",
    secondaryColor: "#CBD5E0",
    fontFamily: "sans-serif"
  }
};

// Version-specific configurations
export const siteVersions: Record<string, SiteConfig> = {
  // Real Estate Photography Version
  "newnanrealestatephotography": {
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Real Estate Photography",
      description: "We capture the beauty of properties with precision and style.",
      buttonText: "Book a Real Estate Session",
      aboutTitle: "About Our Real Estate Photography",
      servicesTitle: "Our Real Estate Services"
    },
    images: realEstateImages,
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#2D3748"
    }
  },
  
  // Family Photography Version
  "newnanfamilyphotography": {
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Family Photography",
      description: "Cherish your family moments forever.",
      buttonText: "Book a Family Session",
      aboutTitle: "About Our Family Photography",
      servicesTitle: "Our Family Photo Services"
    },
    images: familyImages,
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#68A1DC"
    }
  },
  
  // Wedding Photography Version
  "newnanweddingphotography": {
    text: {
      ...defaultConfig.text,
      heading: "Welcome to Wedding Photography",
      description: "We tell your love story through stunning images.",
      buttonText: "Book a Wedding Session",
      aboutTitle: "About Our Wedding Photography",
      servicesTitle: "Our Wedding Services"
    },
    images: weddingImages,
    theme: {
      ...defaultConfig.theme,
      primaryColor: "#9F7AEA"
    }
  },
  
  // Default fallback version
  "default": defaultConfig
};

// Function to get configuration based on domain or version ID
export function getConfig(versionId: string): SiteConfig {
  return siteVersions[versionId] || siteVersions.default;
}
  