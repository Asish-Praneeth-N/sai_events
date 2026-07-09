// ─────────────────────────────────────────────────────────────────────────────
// SAI EVENTS — Master Data Configuration
// Single source of truth for all landing page content.
// Data models are designed to be swapped for Supabase without UI changes.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Intro Types ────────────────────────────────────────────────────────────
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
  location?: string;
  year?: string;
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
  eventType?: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon?: string;
}

// ─── Event Category Type ────────────────────────────────────────────────────
export interface EventCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  count: string;           // e.g. "120+ Events"
  color: string;           // ambient accent color for hover
}

// ─── Why Choose Us Story Beat ────────────────────────────────────────────────
export interface StoryBeat {
  id: string;
  statement: string;
  subtext: string;
  image: string;
  icon: string;
}

// ─── Vendor Type (production-ready, can be replaced with Supabase) ───────────
export interface VendorCategory {
  id: string;
  label: string;
  icon: string;
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  profileImage: string;
  coverImage: string;
  category: string;          // matches VendorCategory.id
  rating: number;            // 1.0 - 5.0
  reviewCount: number;
  completedEvents: number;
  experienceYears: number;
  city: string;
  startingPrice: number;     // INR
  portfolioImages: string[];
  description: string;
  availability: "available" | "busy" | "on-request";
  isVerified: boolean;
  tags: string[];
}

// ─── How It Works Step ──────────────────────────────────────────────────────
export interface HowItWorksStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const INTRO_CONFIG = {
  // Screenplay timings
  scene1Duration: 1800, // ms — The Invitation (dark + logo)
  scene2Duration: 6000, // ms — The Walkway (cinematic slideshow)

  // Transition timings
  fadeDuration: 900, // ms

  // ── localStorage: Play only on FIRST visit, never again unless replayed ──
  // Cleared by "Replay Experience" in footer.
  cacheKey: "sai_events_intro_played_v1",
  // No expiry — permanent skip after first visit.

  // Scene 1 logo overlays
  logoText: "SAI EVENTS",
  logoSubtitle: "Crafting Celebrations That Become Memories",

  // Scene 2 image sequence (Ken Burns effect)
  images: [
    { url: "/images/wedding.png",    label: "Welcome" },
    { url: "/images/bride_prep.png", label: "Preparation" },
    { url: "/images/decor.png",      label: "Design" },
    { url: "/images/guests.png",     label: "Guests" },
    { url: "/images/fireworks.png",  label: "Celebration" }
  ] as IntroImage[],

  // Scene 2 cinematic phrases (5 stories)
  phrases: [
    "Welcome to SAI EVENTS",
    "Every celebration begins with an idea.",
    "Every detail deserves perfection.",
    "Every memory deserves a beautiful beginning.",
    "Let's create something unforgettable."
  ] as string[],
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const LANDING_PAGE_CONFIG = {
  hero: {
    title: "Creating Extraordinary Celebrations",
    subheading:
      "From intimate family gatherings to grand weddings and corporate events, we transform ideas into unforgettable experiences.",
    backgroundImages: [
      "/images/wedding.png",
      "/images/reception.png",
      "/images/decor.png",
      "/images/fireworks.png",
    ],
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

  // ─── Why Choose Us (Scene 4 — The Story) ──────────────────────────────────
  whyChooseUs: [
    {
      id: "listen",
      statement: "We listen.",
      subtext: "Every event begins with understanding your vision. We hear what others overlook.",
      image: "/images/bride_prep.png",
      icon: "Ear",
    },
    {
      id: "design",
      statement: "We design.",
      subtext: "Every detail is crafted with intention — from the first petal to the final light.",
      image: "/images/decor.png",
      icon: "Palette",
    },
    {
      id: "organize",
      statement: "We organize.",
      subtext: "A thousand moving parts, orchestrated flawlessly so you never have to worry.",
      image: "/images/corporate.png",
      icon: "LayoutGrid",
    },
    {
      id: "celebrate",
      statement: "We celebrate.",
      subtext: "On your day, we fade into the background. Your joy becomes the centrepiece.",
      image: "/images/wedding.png",
      icon: "Sparkles",
    },
    {
      id: "memories",
      statement: "You create memories.",
      subtext: "Long after the last guest leaves, the moments we craft together remain forever.",
      image: "/images/guests.png",
      icon: "Heart",
    },
  ] as StoryBeat[],

  // ─── Event Categories (Scene 5 — The Atelier) ─────────────────────────────
  eventCategories: [
    {
      id: "weddings",
      title: "Weddings",
      description: "Luxury stage decor, floral arches, and bespoke ceremony coordination.",
      image: "/images/wedding.png",
      icon: "Heart",
      count: "200+ Events",
      color: "rgba(212,175,55,0.15)",
    },
    {
      id: "engagements",
      title: "Engagements",
      description: "Intimate ring ceremonies with premium aesthetics and cinematic setups.",
      image: "/images/engagement.png",
      icon: "Gem",
      count: "80+ Events",
      color: "rgba(180,100,200,0.12)",
    },
    {
      id: "birthdays",
      title: "Birthdays",
      description: "Vibrant themes, custom balloon art, and immersive party experiences.",
      image: "/images/birthday.png",
      icon: "Cake",
      count: "150+ Events",
      color: "rgba(255,150,80,0.12)",
    },
    {
      id: "corporate",
      title: "Corporate",
      description: "Professional galas, product launches, and world-class AV setups.",
      image: "/images/corporate.png",
      icon: "Briefcase",
      count: "60+ Events",
      color: "rgba(80,130,220,0.12)",
    },
    {
      id: "baby-shower",
      title: "Baby Showers",
      description: "Soft pastels, balloon installations, and magical welcoming setups.",
      image: "/images/decor.png",
      icon: "Baby",
      count: "40+ Events",
      color: "rgba(180,220,255,0.12)",
    },
    {
      id: "anniversary",
      title: "Anniversaries",
      description: "Romantic candlelit ambience and personalized décor for milestone love.",
      image: "/images/reception.png",
      icon: "HeartHandshake",
      count: "70+ Events",
      color: "rgba(212,175,55,0.12)",
    },
    {
      id: "housewarming",
      title: "Housewarming",
      description: "Traditional and modern celebration setups for your new beginning.",
      image: "/images/decor.png",
      icon: "Home",
      count: "35+ Events",
      color: "rgba(100,200,150,0.12)",
    },
    {
      id: "college-fest",
      title: "College Fests",
      description: "High-energy stage design, lighting, and full event coordination.",
      image: "/images/corporate.png",
      icon: "GraduationCap",
      count: "25+ Events",
      color: "rgba(255,80,120,0.12)",
    },
    {
      id: "private",
      title: "Private Parties",
      description: "Exclusive themed evenings with premium entertainment and styling.",
      image: "/images/guests.png",
      icon: "Users",
      count: "90+ Events",
      color: "rgba(150,100,255,0.12)",
    },
    {
      id: "decorations",
      title: "Luxury Décor",
      description: "Custom lighting, floral installations, and curated table arrangements.",
      image: "/images/decor.png",
      icon: "Palette",
      count: "300+ Projects",
      color: "rgba(212,175,55,0.15)",
    },
  ] as EventCategory[],

  // ─── Gallery ───────────────────────────────────────────────────────────────
  gallery: [
    { id: "1", title: "Luxury Floral Arch",      category: "Weddings",     location: "Hyderabad", year: "2025", image: "/images/wedding.png"    },
    { id: "2", title: "Ring Exchange Ceremony",  category: "Engagements",  location: "Pune",      year: "2025", image: "/images/engagement.png" },
    { id: "3", title: "Pastel Birthday Canopy",  category: "Birthdays",    location: "Mumbai",    year: "2024", image: "/images/birthday.png"   },
    { id: "4", title: "Gourmet Catering Display",category: "Decorations",  location: "Delhi",     year: "2024", image: "/images/catering.png"   },
    { id: "5", title: "Corporate Gala Dinner",   category: "Corporate",    location: "Bangalore", year: "2025", image: "/images/corporate.png"  },
    { id: "6", title: "Evening Reception Stage", category: "Weddings",     location: "Hyderabad", year: "2025", image: "/images/reception.png"  },
    { id: "7", title: "Fairy Lights Pathway",    category: "Decorations",  location: "Chennai",   year: "2024", image: "/images/decor.png"      },
    { id: "8", title: "Grand Fireworks Finale",  category: "Weddings",     location: "Goa",       year: "2024", image: "/images/fireworks.png"  },
  ] as GalleryItem[],

  // ─── Vendor Categories ─────────────────────────────────────────────────────
  vendorCategories: [
    { id: "all",          label: "All",            icon: "LayoutGrid"    },
    { id: "photographer", label: "Photographers",   icon: "Camera"        },
    { id: "decorator",    label: "Decorators",      icon: "Palette"       },
    { id: "caterer",      label: "Caterers",        icon: "UtensilsCrossed"},
    { id: "makeup",       label: "Makeup Artists",  icon: "Sparkles"      },
    { id: "dj",           label: "DJs & Music",     icon: "Music"         },
    { id: "planner",      label: "Event Planners",  icon: "ClipboardList" },
  ] as VendorCategory[],

  // ─── Vendor Mock Data (production-ready model, swap with Supabase later) ───
  vendors: [
    {
      id: "v1",
      businessName: "Riya Lens Studio",
      ownerName: "Riya Sharma",
      profileImage: "/images/bride_prep.png",
      coverImage: "/images/wedding.png",
      category: "photographer",
      rating: 4.9,
      reviewCount: 87,
      completedEvents: 142,
      experienceYears: 8,
      city: "Hyderabad",
      startingPrice: 25000,
      portfolioImages: ["/images/wedding.png", "/images/engagement.png", "/images/bride_prep.png"],
      description: "Award-winning wedding photographer specializing in cinematic storytelling and candid moments.",
      availability: "available",
      isVerified: true,
      tags: ["Candid", "Cinematic", "Pre-wedding"],
    },
    {
      id: "v2",
      businessName: "Elara Décor Co.",
      ownerName: "Arjun Kapoor",
      profileImage: "/images/decor.png",
      coverImage: "/images/decor.png",
      category: "decorator",
      rating: 4.8,
      reviewCount: 64,
      completedEvents: 98,
      experienceYears: 6,
      city: "Mumbai",
      startingPrice: 50000,
      portfolioImages: ["/images/decor.png", "/images/reception.png", "/images/wedding.png"],
      description: "Luxury floral and thematic decoration studio creating breathtaking immersive venue transformations.",
      availability: "busy",
      isVerified: true,
      tags: ["Floral", "Thematic", "Luxury"],
    },
    {
      id: "v3",
      businessName: "Spice Route Catering",
      ownerName: "Priya Nair",
      profileImage: "/images/catering.png",
      coverImage: "/images/catering.png",
      category: "caterer",
      rating: 4.7,
      reviewCount: 112,
      completedEvents: 210,
      experienceYears: 12,
      city: "Bangalore",
      startingPrice: 35000,
      portfolioImages: ["/images/catering.png", "/images/corporate.png", "/images/guests.png"],
      description: "Multi-cuisine catering with live counters, dessert stations, and premium plated service.",
      availability: "available",
      isVerified: true,
      tags: ["Multi-cuisine", "Live Counters", "Pan-India"],
    },
    {
      id: "v4",
      businessName: "Glow Artistry",
      ownerName: "Simran Gill",
      profileImage: "/images/bride_prep.png",
      coverImage: "/images/bride_prep.png",
      category: "makeup",
      rating: 5.0,
      reviewCount: 56,
      completedEvents: 78,
      experienceYears: 5,
      city: "Delhi",
      startingPrice: 15000,
      portfolioImages: ["/images/bride_prep.png", "/images/engagement.png", "/images/wedding.png"],
      description: "Bridal and editorial makeup artist creating flawless, long-lasting looks for every skin tone.",
      availability: "on-request",
      isVerified: true,
      tags: ["Bridal", "Editorial", "Airbrush"],
    },
    {
      id: "v5",
      businessName: "BeatBox Entertainment",
      ownerName: "DJ Rahul V",
      profileImage: "/images/corporate.png",
      coverImage: "/images/fireworks.png",
      category: "dj",
      rating: 4.8,
      reviewCount: 93,
      completedEvents: 180,
      experienceYears: 10,
      city: "Hyderabad",
      startingPrice: 20000,
      portfolioImages: ["/images/fireworks.png", "/images/guests.png", "/images/reception.png"],
      description: "Premium DJ and sound production for weddings, corporate events, and private parties.",
      availability: "available",
      isVerified: true,
      tags: ["Weddings", "Corporate", "Live Sound"],
    },
    {
      id: "v6",
      businessName: "Grand Occasion Planners",
      ownerName: "Meera Iyer",
      profileImage: "/images/corporate.png",
      coverImage: "/images/wedding.png",
      category: "planner",
      rating: 4.9,
      reviewCount: 44,
      completedEvents: 65,
      experienceYears: 9,
      city: "Chennai",
      startingPrice: 80000,
      portfolioImages: ["/images/wedding.png", "/images/corporate.png", "/images/reception.png"],
      description: "Full-service luxury event planning and coordination for weddings and corporate milestones.",
      availability: "available",
      isVerified: true,
      tags: ["Full-service", "Destination", "Corporate"],
    },
  ] as VendorProfile[],

  // ─── How It Works Steps ────────────────────────────────────────────────────
  howItWorks: [
    {
      id: "book",
      step: 1,
      title: "Book Your Event",
      description: "Share your event details — date, type, guest count, and vision with our team.",
      icon: "CalendarCheck",
    },
    {
      id: "choose",
      step: 2,
      title: "Choose Event Type",
      description: "Select from our curated event categories. Each tailored to different tastes and budgets.",
      icon: "ListFilter",
    },
    {
      id: "suggestions",
      step: 3,
      title: "Receive Vendor Suggestions",
      description: "Our platform matches you with verified, reviewed vendors who fit your exact requirements.",
      icon: "UserCheck",
    },
    {
      id: "compare",
      step: 4,
      title: "Compare & Decide",
      description: "Review portfolios, ratings, pricing, and availability. Choose with complete confidence.",
      icon: "BarChart3",
    },
    {
      id: "finalize",
      step: 5,
      title: "Finalize & Confirm",
      description: "Lock in your vendors, confirm logistics, and let our coordinators handle the rest.",
      icon: "CheckCircle2",
    },
    {
      id: "celebrate",
      step: 6,
      title: "Celebrate",
      description: "Arrive at your perfectly orchestrated event and simply enjoy every unforgettable moment.",
      icon: "PartyPopper",
    },
  ] as HowItWorksStep[],

  // ─── About ─────────────────────────────────────────────────────────────────
  about: {
    tagline: "Our Journey",
    heading: "Crafting Experiences Since 2014",
    description:
      "For over a decade, Sai Events has been setting new standards in luxury event management, connecting elite clients with premium setups and decorations.",
    timeline: [
      { year: "2014", title: "The Beginning",         description: "Founded with a passion for designing beautiful intimate weddings in Hyderabad."     },
      { year: "2017", title: "Going Corporate",        description: "Expanded our catalog to cover luxury corporate galas, seminars, and product launches." },
      { year: "2020", title: "Unified Platform",       description: "Launched our digital portal to connect vendors, coordinators, and clients seamlessly." },
      { year: "2023", title: "Pan-Indian Operations",  description: "Coordinated over 300+ major multi-day luxury weddings across destination venues."    },
      { year: "2026", title: "Cinematic Luxury",       description: "Unveiling our high-end premium ecosystem — the experience you are walking through now." },
    ] as TimelineMilestone[],
  },

  // ─── Updated Stats (four counters) ────────────────────────────────────────
  stats: [
    { value: 500,   suffix: "+",  label: "Events Designed",    icon: "CalendarCheck"  },
    { value: 150,   suffix: "+",  label: "Verified Vendors",   icon: "ShieldCheck"    },
    { value: 10000, suffix: "+",  label: "Happy Guests",       icon: "Users"          },
    { value: 4.9,   suffix: "★",  label: "Customer Rating",    icon: "Star"           },
  ] as StatItem[],

  // ─── Testimonials ──────────────────────────────────────────────────────────
  testimonials: [
    {
      id: "1",
      name: "Aishwarya & Vikram",
      role: "Wedding Clients",
      rating: 5,
      content:
        "Sai Events turned our wedding stage into an absolute fairy tale. The floating candles and luxury stage backdrop were simply jaw-dropping. Every guest was speechless.",
      image: "/images/wedding.png",
      eventType: "Luxury Wedding",
    },
    {
      id: "2",
      name: "Siddharth Mehta",
      role: "CEO, TechVantage",
      rating: 5,
      content:
        "Excellent corporate seminar coordination. The audio-visual systems, stages, and timing were perfect. We received compliments from our international delegates for weeks after.",
      image: "/images/corporate.png",
      eventType: "Corporate Gala",
    },
    {
      id: "3",
      name: "Priyanka Sen",
      role: "Birthday Host",
      rating: 5,
      content:
        "The balloon arches and theme decor for my daughter's birthday were outstanding. Every single guest complimented the layout. Absolutely worth every rupee.",
      image: "/images/birthday.png",
      eventType: "Birthday Celebration",
    },
    {
      id: "4",
      name: "Rohan & Nisha Gupta",
      role: "Engagement Couple",
      rating: 5,
      content:
        "Our engagement ceremony was beyond our wildest dreams. The floral setup, lighting, and the photographer they recommended captured every precious moment perfectly.",
      image: "/images/engagement.png",
      eventType: "Engagement Ceremony",
    },
  ] as TestimonialItem[],

  // ─── Contact ───────────────────────────────────────────────────────────────
  contact: {
    email: "coordination@saievents.com",
    phone: "+91 98765 43210",
    address: "Sai Events Tower, Jubilee Hills, Hyderabad, India",
    workingHours: "Mon - Sat: 9:00 AM - 8:00 PM",
  },
};
