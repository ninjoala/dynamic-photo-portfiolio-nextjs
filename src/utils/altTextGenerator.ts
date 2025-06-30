// Category-specific SEO data (imported here to avoid server component issues)
const categorySEO = {
  realestate: {
    services: ['HDR Photography', 'Virtual Staging', 'Aerial Photography', 'Floor Plans', 'Virtual Tours'],
  },
  events: {
    services: ['Corporate Events', 'Weddings', 'Parties', 'Conferences', 'Live Coverage'],
  },
  family: {
    services: ['Family Portraits', 'Children Photography', 'Generational Photos', 'Holiday Sessions', 'Location Shoots'],
  },
  sports: {
    services: ['Action Shots', 'Team Photos', 'Individual Portraits', 'Tournament Coverage', 'Sports Events'],
  },
  default: {
    services: ['Real Estate Photography', 'Event Photography', 'Family Photography', 'Sports Photography'],
  }
};

// Generate SEO-optimized alt text for gallery images
export function generateImageAltText(imageName: string, mode: string, index?: number): string {
  
  // Extract file name without extension and path
  const fileName = imageName.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'image';
  
  // Generate category-specific alt text
  const categoryAltText: Record<string, string[]> = {
    realestate: [
      'Professional real estate photography showcasing modern home exterior',
      'High-quality HDR real estate photo of bright interior space',
      'Real estate photography featuring spacious living room with natural light',
      'Professional property photography showing kitchen and dining area',
      'Real estate photo of master bedroom with elegant design',
      'HDR real estate photography of beautiful bathroom renovation',
      'Professional real estate photo of home exterior with landscaping',
      'Interior real estate photography showing open floor plan',
    ],
    events: [
      'Professional event photography capturing special moments',
      'Wedding photography showing romantic ceremony details',
      'Corporate event photography of networking and presentations',
      'Party photography capturing celebration and joy',
      'Conference photography documenting professional gathering',
      'Event photography showing guests enjoying festivities',
      'Professional wedding photography of bride and groom',
      'Corporate event photography of speakers and attendees',
    ],
    family: [
      'Professional family photography capturing precious moments',
      'Family portrait photography showing natural connections',
      'Children photography featuring playful and candid moments',
      'Family photography session in beautiful outdoor setting',
      'Professional family portraits showing generational bonds',
      'Holiday family photography capturing seasonal celebrations',
      'Children photography showcasing personality and joy',
      'Family photography featuring natural lighting and poses',
    ],
    sports: [
      'Dynamic sports photography capturing intense action',
      'Professional sports photography of team in action',
      'Action sports photography showing athletic competition',
      'Sports team photography featuring individual portraits',
      'Tournament sports photography documenting championship',
      'Professional sports photography of athletes in motion',
      'Sports photography capturing game-winning moments',
      'Team sports photography showing unity and determination',
    ],
  };

  // Get category-specific alt text options
  const altOptions = categoryAltText[mode] || categoryAltText.realestate;
  
  // Use index to rotate through different alt text options
  const altIndex = (index !== undefined ? index : Math.floor(Math.random() * altOptions.length)) % altOptions.length;
  let baseAlt = altOptions[altIndex];
  
  // Add location for local SEO
  baseAlt += ' in Newnan, GA';
  
  // Add specific filename context if it contains meaningful info
  if (fileName.toLowerCase().includes('hdr')) {
    baseAlt = baseAlt.replace('photography', 'HDR photography');
  }
  if (fileName.toLowerCase().includes('drone') || fileName.toLowerCase().includes('aerial')) {
    baseAlt = baseAlt.replace('photography', 'aerial photography');
  }
  if (fileName.toLowerCase().includes('sunset') || fileName.toLowerCase().includes('golden')) {
    baseAlt += ' during golden hour';
  }
  
  return baseAlt;
}

// Generate alt text for featured work images on homepage
export function generateFeaturedWorkAltText(mode: string): string {
  const seoData = categorySEO[mode as keyof typeof categorySEO] || categorySEO.default;
  
  const featuredAltText: Record<string, string> = {
    realestate: `Featured real estate photography by Nick Dobos Media showcasing ${seoData.services[0]?.toLowerCase() || 'professional property photography'} in Newnan, GA`,
    events: `Featured event photography by Nick Dobos Media capturing ${seoData.services[0]?.toLowerCase() || 'special moments'} in Newnan, GA`,
    family: `Featured family photography by Nick Dobos Media showing ${seoData.services[0]?.toLowerCase() || 'family portraits'} in Newnan, GA`,
    sports: `Featured sports photography by Nick Dobos Media documenting ${seoData.services[0]?.toLowerCase() || 'athletic action'} in Newnan, GA`,
  };

  return featuredAltText[mode] || featuredAltText.realestate;
}

// Generate alt text for hero images
export function generateHeroAltText(mode: string): string {
  const heroAltText: Record<string, string> = {
    realestate: 'Professional real estate photography hero image showcasing stunning property exterior by Nick Dobos Media in Newnan, GA',
    events: 'Professional event photography hero image capturing beautiful celebration moments by Nick Dobos Media in Newnan, GA',
    family: 'Professional family photography hero image showing loving family portrait by Nick Dobos Media in Newnan, GA',
    sports: 'Professional sports photography hero image capturing dynamic athletic action by Nick Dobos Media in Newnan, GA',
  };

  return heroAltText[mode] || heroAltText.realestate;
}