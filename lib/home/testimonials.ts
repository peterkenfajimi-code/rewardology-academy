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

/** Curated learner perspectives — edit here to update the homepage testimonials section. */
export const HOME_TESTIMONIALS: Testimonial[] = [
  {
    id: "amara-osei",
    quote:
      "Rewardology is the only platform that explains compensation concepts the way practitioners actually think. I transitioned into Total Rewards in six months using these materials.",
    name: "Amara Osei",
    role: "Total Rewards Analyst",
    location: "Lagos",
    avatar: "A",
    avatarBg: "linear-gradient(135deg,#0C4A6E,#0891B2)",
    revealDelay: "reveal-d1",
  },
  {
    id: "daniel-mensah",
    quote:
      "The pay equity module alone saved our organization from a costly audit. The practical frameworks here go far beyond anything in a generic HR certification.",
    name: "Daniel Mensah",
    role: "Senior HR Manager",
    location: "Accra",
    avatar: "D",
    avatarBg: "linear-gradient(135deg,#064E3B,#059669)",
    revealDelay: "reveal-d2",
  },
  {
    id: "sophia-nkrumah",
    quote:
      "I read the 25 articles cover to cover before my first compensation director interview. The vocabulary, frameworks, and confidence I walked in with were completely different.",
    name: "Sophia Nkrumah",
    role: "Compensation Director",
    location: "Nairobi",
    avatar: "S",
    avatarBg: "linear-gradient(135deg,#3B0764,#7C3AED)",
    revealDelay: "reveal-d3",
  },
];
