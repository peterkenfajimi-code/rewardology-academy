export type TestimonialSlot = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  avatarBg: string;
  stars?: string;
  revealDelay: "reveal-d1" | "reveal-d2" | "reveal-d3";
};

/** Empty layout slots when no approved testimonials exist yet. */
export const HOME_TESTIMONIAL_SLOTS: TestimonialSlot[] = [
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

/** @deprecated Use HOME_TESTIMONIAL_SLOTS */
export const HOME_TESTIMONIALS = HOME_TESTIMONIAL_SLOTS;
