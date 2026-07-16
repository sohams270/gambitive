export const SITE = {
  name: "Gambitive",
  url: "https://gambitive.com",
  // Working assumption per brief — refine when the niche is finalized.
  niche: "India's tech and startup ecosystem",
  description:
    "The news, the analysis, and the stories founders don't usually tell — from India's tech and startup ecosystem.",
  // Swap in the real newsletter provider endpoint (e.g. Buttondown:
  // https://buttondown.com/api/emails/embed-subscribe/gambitive).
  newsletterAction: "https://buttondown.com/api/emails/embed-subscribe/gambitive",
  // Swap in the real form endpoint (e.g. Formspree) for The Hard Part pitches.
  pitchFormAction: "https://formspree.io/f/REPLACE_ME",
  contactEmail: "hello@gambitive.com",
  advertiseEmail: "partners@gambitive.com",
  // Set to the production domain to enable Plausible; leave "" to disable.
  plausibleDomain: "",
  // Social profiles shown in the footer. Update handles when the real
  // accounts exist; set any to "" to hide its icon.
  social: {
    x: "https://x.com/gambitive",
    linkedin: "https://www.linkedin.com/company/gambitive",
    facebook: "https://www.facebook.com/gambitive",
    whatsapp: "https://whatsapp.com/channel/gambitive",
  },
} as const;

export const SECTIONS = {
  latest: {
    slug: "latest",
    name: "Latest",
    tagline: "What happened, and why it matters, fast.",
  },
  "deep-dives": {
    slug: "deep-dives",
    name: "Deep Dives",
    tagline: "The analysis nobody else is doing.",
  },
  "the-hard-part": {
    slug: "the-hard-part",
    name: "The Hard Part",
    tagline: "The stories leaders don't put in their pitch decks.",
  },
} as const;

export type SectionSlug = keyof typeof SECTIONS;
