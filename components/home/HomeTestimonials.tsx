import { fetchApprovedTestimonials } from "@/lib/testimonials/fetchApproved";
import { starsForRating } from "@/lib/testimonials/types";
import { HOME_TESTIMONIAL_SLOTS } from "@/lib/home/testimonials";

const AVATAR_BACKGROUNDS = [
  "linear-gradient(135deg,#0C4A6E,#0891B2)",
  "linear-gradient(135deg,#064E3B,#059669)",
  "linear-gradient(135deg,#3B0764,#7C3AED)",
];

export async function HomeTestimonials() {
  const approved = await fetchApprovedTestimonials(3);

  const cards =
    approved.length > 0
      ? approved.map((item, index) => ({
          id: item.id,
          quote: item.quote,
          name: item.name,
          role: item.role,
          location: item.location,
          avatar: item.avatar,
          stars: starsForRating(item.rating),
          avatarBg: AVATAR_BACKGROUNDS[index % AVATAR_BACKGROUNDS.length],
          revealDelay: HOME_TESTIMONIAL_SLOTS[index]?.revealDelay ?? "reveal-d1",
        }))
      : HOME_TESTIMONIAL_SLOTS;

  return (
    <section className="section proof-section">
      <div className="section-inner">
        <div className="section-hd reveal">
          <div>
            <div className="section-eyebrow">Testimonials</div>
            <h2 className="section-title">
              Trusted by HR <em>Professionals</em>
            </h2>
            <p className="section-sub" style={{ marginTop: 12, maxWidth: 520 }}>
              Perspectives from rewards and HR practitioners — shared after completing courses,
              quizzes, and comics on Rewardology Academy.
            </p>
          </div>
        </div>
        <div className="proof-grid">
          {cards.map((p) => (
            <div className={`proof-card reveal ${p.revealDelay}`} key={p.id}>
              <div className="proof-stars" aria-hidden={!p.quote}>
                {p.quote ? p.stars ?? "★★★★★" : "\u00A0"}
              </div>
              <div className="proof-text">{p.quote ? `\u201C${p.quote}\u201D` : "\u00A0"}</div>
              <div className="proof-author">
                <div className="proof-avatar" style={{ background: p.avatarBg }}>
                  {p.avatar || "\u00A0"}
                </div>
                <div>
                  <div className="proof-name">{p.name || "\u00A0"}</div>
                  <div className="proof-role">
                    {[p.role, p.location].filter(Boolean).join(" · ") || "\u00A0"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
