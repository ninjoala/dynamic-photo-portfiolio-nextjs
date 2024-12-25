export interface SiteConfig {
    heading: string;
    description: string;
    buttonText: string;
  }
  
  export const siteConfig: Record<string, SiteConfig> = {
    newnanrealestatephotography: {
      heading: "Welcome to Real Estate Photography",
      description: "We capture the beauty of properties with precision and style.",
      buttonText: "Book a Real Estate Session",
    },
    newnanfamilyphotography: {
      heading: "Welcome to Family Photography",
      description: "Cherish your family moments forever.",
      buttonText: "Book a Family Session",
    },
    newnanweddingphotography: {
      heading: "Welcome to Wedding Photography",
      description: "We tell your love story through stunning images.",
      buttonText: "Book a Wedding Session",
    },
    default: {
      heading: "Welcome to Our Photography Services",
      description: "Explore our range of photography offerings.",
      buttonText: "Learn More",
    },
  };
  