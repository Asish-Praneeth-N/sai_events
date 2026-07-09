export interface IntroImage {
  url: string;
  label: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  image: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export const INTRO_CONFIG = {
  // Screenplay timings
  scene1Duration: 1500, // ms
  scene2Duration: 5500, // ms (Total intro: 7.0 seconds)
  
  // Transition timings
  fadeDuration: 900, // ms
  
  // Local storage cache setting (intro only plays once every 24 hours)
  cacheKey: 'sai_events_intro_played',
  cacheExpiryHours: 24,

  // Scene 1 logo overlays
  logoText: 'SAI EVENTS',
  logoSubtitle: 'Crafting Timeless Celebrations',

  // Scene 2 image sequence (Ken Burns effect)
  images: [
    { url: '/images/bride_prep.png', label: 'Bride Preparation' },
    { url: '/images/wedding.png', label: 'Wedding Stage' },
    { url: '/images/engagement.png', label: 'Ring Exchange' },
    { url: '/images/reception.png', label: 'Reception Ceremony' },
    { url: '/images/birthday.png', label: 'Birthday Celebration' },
    { url: '/images/corporate.png', label: 'Corporate Event' },
    { url: '/images/decor.png', label: 'Luxury Decoration' },
    { url: '/images/guests.png', label: 'Guests Smiling' },
    { url: '/images/fireworks.png', label: 'Fireworks Celebration' }
  ] as IntroImage[],

  // Scene 2 text sequence (phrases shown one-by-one)
  phrases: [
    "Every celebration begins with a dream.",
    "Every detail tells a story.",
    "Every smile becomes a memory.",
    "Every event deserves perfection.",
    "Creating Memories",
    "Planning Celebrations",
    "Designing Dreams",
    "Luxury Experiences",
    "Welcome to SAI EVENTS"
  ] as string[],
};

export const LANDING_PAGE_CONFIG = {
  hero: {
    title: "Creating Extraordinary Celebrations",
    subheading: "From weddings and engagements to birthdays and corporate events, we create unforgettable experiences that last forever.",
    videoUrl: "", // Add a video background here if available, falls back to rotating images
    backgroundImages: [
      "/images/wedding.png",
      "/images/reception.png",
      "/images/decor.png",
      "/images/fireworks.png"
    ]
  },
  
  services: [
    {
      id: "wedding",
      title: "Weddings",
      description: "Elegant wedding stage decoration, floral setups, and bespoke coordination for your special day.",
      image: "/images/wedding.png",
      icon: "Heart"
    },
    {
      id: "engagement",
      title: "Engagements",
      description: "Sophisticated ring ceremonies and pre-wedding celebrations created with premium aesthetics.",
      image: "/images/engagement.png",
      icon: "Sparkles"
    },
    {
      id: "birthday",
      title: "Birthdays",
      description: "Vibrant birthday parties, custom theme backgrounds, and beautiful cake table setups.",
      image: "/images/birthday.png",
      icon: "Cake"
    },
    {
      id: "corporate",
      title: "Corporate",
      description: "Professional seminars, corporate galas, product launches, and audio-visual setups.",
      image: "/images/corporate.png",
      icon: "Briefcase"
    },
    {
      id: "baby-shower",
      title: "Baby Showers",
      description: "Gentle pastel themes, balloon installations, and happy setups for mothers-to-be.",
      image: "/images/decor.png",
      icon: "Baby"
    },
    {
      id: "decoration",
      title: "Decorations",
      description: "Custom lighting configurations, themed floral decor, and premium table arrangements.",
      image: "/images/catering.png",
      icon: "Palette"
    }
  ] as ServiceItem[],

  gallery: [
    { id: "1", title: "Luxury Floral Arch", category: "Weddings", image: "/images/wedding.png" },
    { id: "2", title: "Ring Exchange Ceremony", category: "Engagements", image: "/images/engagement.png" },
    { id: "3", title: "Pastel Birthday Canopy", category: "Birthdays", image: "/images/birthday.png" },
    { id: "4", title: "Gourmet Catering Display", category: "Decorations", image: "/images/catering.png" },
    { id: "5", title: "Corporate Gala Dinner", category: "Corporate", image: "/images/corporate.png" },
    { id: "6", title: "Evening Reception Stage", category: "Weddings", image: "/images/reception.png" },
    { id: "7", title: "Fairy Lights Pathway", category: "Decorations", image: "/images/decor.png" },
    { id: "8", title: "Grand Fireworks Finale", category: "Weddings", image: "/images/fireworks.png" }
  ] as GalleryItem[],

  about: {
    tagline: "Our Journey",
    heading: "Crafting Experiences Since 2014",
    description: "For over a decade, Sai Events has been setting new standards in luxury event management, connecting elite clients with premium setups and decorations.",
    timeline: [
      { year: "2014", title: "The Beginning", description: "Sai Events was founded with a passion for designing beautiful intimate weddings." },
      { year: "2017", title: "Going Corporate", description: "Expanded our catalog to cover luxury corporate galas and seminars." },
      { year: "2020", title: "Unified Platform", description: "Launched our digital portal to connect vendors, coordinators, and clients." },
      { year: "2023", title: "Pan-Indian Operations", description: "Coordinated over 300+ major multi-day luxury weddings across destinations." },
      { year: "2026", title: "Cinematic Luxury", description: "Unveiling our high-end premium ecosystem and visual aesthetic experience." }
    ] as TimelineMilestone[]
  },

  stats: [
    { value: 500, suffix: "+", label: "Events Designed" },
    { value: 1000, suffix: "+", label: "Happy Clients" },
    { value: 12, suffix: "+", label: "Years Experience" }
  ] as StatItem[],

  testimonials: [
    {
      id: "1",
      name: "Aishwarya & Vikram",
      role: "Wedding Clients",
      rating: 5,
      content: "Sai Events turned our wedding stage into an absolute fairy tale. The floating candles and luxury stage backdrop were simply jaw-dropping.",
      image: "/images/wedding.png"
    },
    {
      id: "2",
      name: "Siddharth Mehta",
      role: "CEO, TechVantage",
      rating: 5,
      content: "Excellent corporate seminar coordination. The audio-visual systems, stages, and timing were perfect. Truly professional team.",
      image: "/images/corporate.png"
    },
    {
      id: "3",
      name: "Priyanka Sen",
      role: "Birthday Host",
      rating: 5,
      content: "The balloon arches and theme decor for my daughter's birthday were outstanding. Every single guest complimented the layout.",
      image: "/images/birthday.png"
    }
  ] as TestimonialItem[],

  contact: {
    email: "coordination@saievents.com",
    phone: "+91 98765 43210",
    address: "Sai Events Tower, Jubilee Hills, Hyderabad, India",
    workingHours: "Mon - Sat: 9:00 AM - 8:00 PM"
  }
};
