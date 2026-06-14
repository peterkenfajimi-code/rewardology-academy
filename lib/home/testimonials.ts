export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  avatarBg: string;
  revealDelay: "reveal-d1" | "reveal-d2" | "reveal-d3";
};

/** Placeholder cards — fill quote, name, role, and stars when real testimonials are ready. */
export const HOME_TESTIMONIALS: Testimonial[] = [
  {
    id: "slot-1",
    quote: "",
    name: "",
    role: "",
    location: "",
    avatar: "",
    avatarBg: "linear-gradient(135deg,#0C4A6E,#0891B2)",
    revealDelay: "reveal-d1",
  },
  {
    id: "slot-2",
    quote: "",
    name: "",
    role: "",
    location: "",
    avatar: "",
    avatarBg: "linear-gradient(135deg,#064E3B,#059669)",
    revealDelay: "reveal-d2",
  },
  {
    id: "slot-3",
    quote: "",
    name: "",
    role: "",
    location: "",
    avatar: "",
    avatarBg: "linear-gradient(135deg,#3B0764,#7C3AED)",
    revealDelay: "reveal-d3",
  },
];
