export type CourseBlock = {
  t: "intro" | "h" | "p" | "box" | "scenario" | "takeaways" | "quiz_intro";
  v?: string | string[];
  label?: string;
  title?: string;
  org?: string;
  items?: string[];
};

export type KnowledgeQuiz = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

export type CourseLesson = {
  id: string;
  title: string;
  duration: string;
  xp: number;
  type: "lesson" | "quiz";
  objectives?: string[];
  body?: CourseBlock[];
  quiz?: KnowledgeQuiz;
  quiz_questions?: KnowledgeQuiz[];
  /** Linked article id from ESSENTIALS_ARTICLES */
  article?: number;
};

export type CourseModule = {
  id: string;
  title: string;
  color: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  color2: string;
  bg: string;
  icon: string;
  level: string;
  duration: string;
  lessons_count: number;
  total_xp: number;
  desc: string;
  outcomes: string[];
  modules: CourseModule[];
};

export const COURSES: Course[] = [
  {
    "id": 1,
    "title": "Total Rewards Foundations",
    "subtitle": "Your complete introduction to the world of Total Rewards",
    "color": "#C8963E",
    "color2": "#E2AC50",
    "bg": "#0C2340",
    "icon": "◈",
    "level": "Beginner",
    "duration": "3–4 hours",
    "lessons_count": 6,
    "total_xp": 1200,
    "desc": "Learn what Total Rewards really means, how compensation and benefits work together, and why the best HR professionals think in systems — not silos.",
    "outcomes": [
      "Define Total Rewards and explain its five core pillars",
      "Distinguish base pay, variable pay, and total cash",
      "Describe how benefits protect and support the workforce",
      "Apply a Total Rewards lens to diagnose real organizational problems",
      "Map EVP claims to reward programme reality"
    ],
    "modules": [
      {
        "id": "1-1",
        "title": "Introduction to Total Rewards",
        "color": "#C8963E",
        "lessons": [
          {
            "id": "1-1-1",
            "title": "What Total Rewards Means",
            "duration": "8 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Define Total Rewards",
              "Understand the financial vs non-financial distinction",
              "Recognise why salary alone is insufficient"
            ],
            "body": [
              {
                "t": "intro",
                "v": "When most people hear the word 'rewards,' they think about pay. But the HR professionals who build reward systems know that pay is only one part of a much larger picture — and often not the most powerful part."
              },
              {
                "t": "h",
                "v": "The Full Definition"
              },
              {
                "t": "p",
                "v": "Total Rewards is the complete set of financial and non-financial value an organization provides to employees in exchange for their time, skills, effort, and contribution. It answers one question every employee asks: why should I give my best here?"
              },
              {
                "t": "p",
                "v": "A payslip answers part of that question. But employees also ask about security, growth, belonging, flexibility, recognition, and purpose. Total Rewards helps organizations design intentional answers to all of those questions — not just the financial ones."
              },
              {
                "t": "box",
                "v": "Total Rewards = Financial rewards (pay, bonuses, benefits, pension) + Non-financial rewards (recognition, career growth, flexibility, culture, and wellbeing support)",
                "label": "Core Definition"
              },
              {
                "t": "h",
                "v": "Why the Distinction Matters"
              },
              {
                "t": "p",
                "v": "Organizations that think about rewards narrowly — as salary and benefits only — often struggle to understand why highly paid employees leave, or why teams with average pay show exceptional engagement. The answer is almost always found in the non-financial dimensions."
              },
              {
                "t": "p",
                "v": "Total Rewards thinking gives HR professionals a diagnostic lens. When turnover rises despite competitive pay, the question becomes: which of the other pillars is underperforming? This saves budget and solves the real problem rather than treating a symptom."
              },
              {
                "t": "scenario",
                "v": "Nova Tech is losing mid-level engineers despite paying at the 60th market percentile. Exit interviews reveal underappreciation, no clear promotion path, and poor work-life balance — not low pay.\n\nA narrow compensation view recommends a pay increase. The Total Rewards view identifies Recognition (managers not acknowledging contribution), Career Development (unclear promotion criteria), and Wellbeing (poor workload management) as root causes. Targeted interventions cost a fraction of a salary increase and address what employees actually said.",
                "title": "Nova Tech's Retention Problem",
                "org": "Nova Tech"
              },
              {
                "t": "takeaways",
                "items": [
                  "Total Rewards is the complete financial and non-financial package — not salary alone.",
                  "The five pillars are: Compensation, Benefits, Wellbeing, Recognition, and Career Development.",
                  "Non-financial rewards often drive engagement more powerfully than compensation increments.",
                  "Diagnosing using all five pillars enables more precise, more cost-effective interventions."
                ]
              }
            ],
            "article": 1
          },
          {
            "id": "1-1-2",
            "title": "The Five Pillars Explained",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Name and define each of the five pillars",
              "Explain the purpose of each pillar",
              "Identify which pillar addresses specific employee needs"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Each of the five Total Rewards pillars meets a different set of employee needs — and an organization that invests heavily in one while neglecting others will find that investment underperforming. Understanding what each pillar does is the foundation of effective reward strategy."
              },
              {
                "t": "h",
                "v": "Pillar 1 — Compensation"
              },
              {
                "t": "p",
                "v": "Compensation is all direct financial pay: base salary, bonuses, commissions, allowances, and long-term incentives. It is the most visible pillar and the most commonly benchmarked against the external market. Employees see it on every payslip and compare it to peers at other organizations."
              },
              {
                "t": "h",
                "v": "Pillar 2 — Benefits"
              },
              {
                "t": "p",
                "v": "Benefits are indirect financial value — health insurance, pension contributions, life assurance, paid leave, and employee assistance programmes. Their value is real but protective rather than income-generating. They are most appreciated when needed and most commonly undervalued when not."
              },
              {
                "t": "box",
                "v": "Benefits answer a fundamentally different question than compensation. Compensation answers: 'What do I earn?' Benefits answer: 'If something goes wrong — my health, my family, my income — is my employer standing behind me?'",
                "label": "Key Insight"
              },
              {
                "t": "h",
                "v": "Pillars 3, 4 and 5 — Wellbeing, Recognition, Career Development"
              },
              {
                "t": "p",
                "v": "Wellbeing addresses physical, mental, and financial health through programmes, culture, and flexible working. Recognition meets the human need to feel seen and valued — often more immediately motivating than a pay increase. Career Development covers learning, mentoring, promotion pathways, and skills investment."
              },
              {
                "t": "p",
                "v": "Research consistently shows that the non-financial pillars — particularly recognition and career development — have higher marginal engagement impact than equivalent additional pay investment. The organizations that invest deliberately across all five tend to outperform those that compete on compensation alone."
              },
              {
                "t": "scenario",
                "v": "Solaris Financial paid at the 65th market percentile but consistently scored poorly on Wellbeing and Career Development engagement dimensions. Rather than increasing pay further, HR designed a mentoring programme and a manager recognition training initiative. Engagement scores in those dimensions rose 18 points — at a fraction of the cost of a further pay increase.",
                "title": "Solaris's Pillar Imbalance",
                "org": "Solaris Financial"
              },
              {
                "t": "takeaways",
                "items": [
                  "The five pillars serve different human needs: financial security, protection, wellbeing, belonging, and growth.",
                  "Recognition and career development typically have higher marginal engagement returns than equivalent pay increases.",
                  "Effective reward strategy requires all five pillars to reinforce each other.",
                  "Diagnosing which pillar is underperforming prevents over-investing in compensation to solve non-compensation problems."
                ]
              }
            ],
            "article": 1
          },
          {
            "id": "1-1-3",
            "title": "The Employee Value Proposition",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Define the Employee Value Proposition",
              "Map EVP claims to Total Rewards pillars",
              "Identify and close EVP-reward gaps"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Your organization constantly makes a promise to employees and candidates: here is what you will experience in return for your contribution. The EVP is that promise made explicit. Total Rewards is what makes the promise real — or reveals it as marketing."
              },
              {
                "t": "h",
                "v": "What an EVP Is — and Is Not"
              },
              {
                "t": "p",
                "v": "An EVP is the articulation of what the organization genuinely offers employees. The most credible EVPs are built from evidence about what employees actually experience — not from what leadership believes the organization offers. An EVP built from aspiration rather than evidence will set expectations the organization cannot meet."
              },
              {
                "t": "box",
                "v": "A quick EVP credibility test: ask 10 employees why they stay. If their answers match your published EVP, it is authentic. If they describe something different — or contradict EVP claims — you have a credibility gap that is already visible to candidates and competitors.",
                "label": "The Credibility Test"
              },
              {
                "t": "h",
                "v": "Mapping EVP to Total Rewards"
              },
              {
                "t": "p",
                "v": "Every EVP claim maps to a specific reward programme. 'We invest in your growth' maps to learning budget, promotion rates, and career development infrastructure. 'We pay competitively' maps to salary benchmarking data. 'We care about your wellbeing' maps to the breadth and utilisation of wellbeing programmes."
              },
              {
                "t": "p",
                "v": "When programmes do not deliver on the claim, the EVP creates the very problem it was designed to prevent: candidates who join expecting one experience and leave when they discover another — taking their knowledge and networks with them."
              },
              {
                "t": "scenario",
                "v": "Kestrel Group's EVP claimed 'market-leading rewards' and 'exceptional learning culture.' An audit revealed: base salaries at P45 (below median), learning spend at £280/employee vs a sector benchmark of £650. The honest EVP — competitive pay, genuine inclusion commitment, and a collaborative culture — attracted better-fit candidates and reduced 90-day attrition by 22%.",
                "title": "Kestrel's EVP Audit",
                "org": "Kestrel Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "An EVP is only as credible as the Total Rewards programmes that substantiate its claims.",
                  "Every EVP claim should map to a tangible programme, policy, or practice — absent evidence means the claim needs revision.",
                  "The most damaging EVP failure is the gap between recruitment promise and employment reality.",
                  "Regular EVP audits against reward programme reality are essential to sustaining employer brand credibility."
                ]
              }
            ],
            "article": 11
          },
          {
            "id": "1-1-Q",
            "title": "Module Quiz: Introduction to Total Rewards",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on What Total Rewards Means, The Five Pillars, and the EVP. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      },
      {
        "id": "1-2",
        "title": "Compensation Fundamentals",
        "color": "#C8963E",
        "lessons": [
          {
            "id": "1-2-1",
            "title": "Base Pay, Variable Pay and Benefits",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Define each component of a total compensation package",
              "Calculate total cash and total remuneration",
              "Explain the pay mix concept"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Ask ten employees what they earn and nine will quote their base salary. Ask what their total package is worth and most will underestimate by 20 to 35 percent. Closing that gap starts with understanding the components."
              },
              {
                "t": "h",
                "v": "Base Salary"
              },
              {
                "t": "p",
                "v": "Base salary is the fixed, guaranteed amount paid for performing the role — expressed annually, paid monthly or biweekly. It is the primary benchmark in market pricing and the reference point for every other pay element. In most structured organizations it is governed by a salary range with a minimum, midpoint, and maximum."
              },
              {
                "t": "h",
                "v": "Variable Pay"
              },
              {
                "t": "p",
                "v": "Variable pay is at-risk compensation: bonuses, commissions, incentive schemes, and long-term equity awards whose value depends on performance outcomes. The mix between fixed and variable pay encodes organizational values — high variable signals performance differentiation; high fixed signals stability and certainty."
              },
              {
                "t": "box",
                "v": "Total Cash = Base Salary + Variable Cash (bonuses + commissions + allowances)\nTotal Remuneration = Total Cash + Employer Benefit Costs\n\nEmployees typically see only take-home pay — making total remuneration 20-40% higher than most employees realize.",
                "label": "The Key Formulas"
              },
              {
                "t": "h",
                "v": "Benefits as Protective Value"
              },
              {
                "t": "p",
                "v": "Benefits provide indirect financial value — health insurance, pension contributions, life assurance, paid leave. Their cost to the employer is real and significant, but because it is invisible to employees (not on the payslip), it generates far less perceived value than its cost suggests. Total Reward Statements exist to close this gap."
              },
              {
                "t": "scenario",
                "v": "Almont Solutions benchmarked base salaries and concluded they were at market median. They missed that their pension employer match (3% vs sector average 8%) and health insurance quality placed their total remuneration at the 32nd percentile. Forty percent of voluntary leavers cited 'better package elsewhere' in exit interviews — but the real gap was in the invisible benefits, not the visible salary.",
                "title": "Almont's Benchmarking Blind Spot",
                "org": "Almont Solutions"
              },
              {
                "t": "takeaways",
                "items": [
                  "Base salary is fixed and guaranteed; variable pay is at-risk and conditional on performance.",
                  "The pay mix — ratio of fixed to variable — signals organizational values and attracts different talent profiles.",
                  "Total remuneration = total cash + employer benefit costs; always significantly higher than base or take-home pay.",
                  "Benefits are undervalued because they are invisible — Total Reward Statements make the full picture visible."
                ]
              }
            ],
            "article": 2
          },
          {
            "id": "1-2-2",
            "title": "Variable Pay Design Principles",
            "duration": "8 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Apply line of sight as a design principle",
              "Set achievable and stretching incentive targets",
              "Identify why incentive plans fail"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Variable pay is the most powerful compensation tool when designed well — and one of the most expensive mistakes when designed poorly. The difference between a plan that drives behaviour and one that generates resentment comes down to a small number of design principles consistently underestimated."
              },
              {
                "t": "h",
                "v": "Line of Sight: The Most Important Principle"
              },
              {
                "t": "p",
                "v": "Line of sight is the degree to which an employee can connect their daily actions to the incentive measure. A salesperson whose commission follows a closed deal has perfect line of sight. An analyst whose bonus depends on enterprise EBITDA has almost none — their effort is negligible relative to the measure. Plans with weak line of sight become perceived as delayed, arbitrary salary supplements."
              },
              {
                "t": "box",
                "v": "Ask this of every incentive measure: 'If this employee works significantly harder and smarter next month, will it measurably change their incentive outcome?' If the honest answer is no — the line of sight is too weak to motivate behaviour change.",
                "label": "The Line of Sight Test"
              },
              {
                "t": "h",
                "v": "Target Setting"
              },
              {
                "t": "p",
                "v": "Targets must be genuinely stretching and genuinely achievable for strong performers. A plan where the majority of participants consistently earn less than 50% of their target is not motivating — it is demoralising. Calibrate targets so that full payout is achievable for strong performers, exceptional performance earns maximum, and minimum performance earns zero."
              },
              {
                "t": "h",
                "v": "The Four Design Essentials"
              },
              {
                "t": "p",
                "v": "Effective incentive plans share four characteristics: Clarity (employees can explain how the plan works in two minutes), Measurability (performance is tracked objectively and consistently), Achievability (full-target payout is realistic for strong performers), and Alignment (measures reward the behaviours the business actually wants)."
              },
              {
                "t": "scenario",
                "v": "Nova Tech's engineering bonus was 70% company revenue growth, 30% personal rating. Despite strong company performance, bonus satisfaction was 28%. Line of sight was almost zero — engineers felt revenue was entirely outside their influence. Redesigned to 50% team delivery milestones + 50% individual contribution, same payout. Understanding rose from 31% to 74%, satisfaction from 28% to 61%.",
                "title": "Nova Tech's Incentive Redesign",
                "org": "Nova Tech"
              },
              {
                "t": "takeaways",
                "items": [
                  "Line of sight is the most important design variable — employees must believe their actions influence the measure.",
                  "The four design essentials: clarity, measurability, achievability, alignment.",
                  "Target setting determines whether a plan motivates or demotivates — too hard is as damaging as too easy.",
                  "Mid-year rule changes destroy trust and effectively end the plan's motivational function for the rest of the year."
                ]
              }
            ],
            "article": 9
          },
          {
            "id": "1-2-3",
            "title": "Pay Equity Fundamentals",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Distinguish the unadjusted and adjusted pay gap",
              "Identify the most common root causes of pay inequity",
              "Understand why governance is the sustainable solution"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Pay equity is not about paying everyone the same. It is about ensuring pay differences are fair, explainable, and free from unjustifiable bias — and that the processes which govern pay decisions make equitable outcomes the natural result, not the exception."
              },
              {
                "t": "h",
                "v": "Two Gaps, Two Interventions"
              },
              {
                "t": "p",
                "v": "The unadjusted pay gap compares average pay between groups regardless of role — it reflects occupational segregation and representation issues. The adjusted gap controls for grade, function, experience, and performance, then asks: what difference remains that cannot be explained by legitimate factors? This residual is what requires direct corrective action."
              },
              {
                "t": "box",
                "v": "Unadjusted gap: average difference regardless of role — reflects structural issues.\nAdjusted gap: residual after controlling for grade, function, experience, performance — reflects pay decision inequity.\n\nBoth matter — but they require different interventions.",
                "label": "Two Gaps, Two Responses"
              },
              {
                "t": "h",
                "v": "How Gaps Develop"
              },
              {
                "t": "p",
                "v": "Gaps compound through small, repeated decisions: a negotiation-based offer 8% closer to range minimum for one group than another; a merit increase applied 0.3% lower to a demographic group year after year; a promotion with a new title but no salary review. Each seems unremarkable in isolation. Together they produce systematic inequity."
              },
              {
                "t": "h",
                "v": "Governance as the Sustainable Solution"
              },
              {
                "t": "p",
                "v": "Individual salary corrections are necessary but not sufficient. Without reforming the processes that created the gap — structured offer matrices, merit guidelines with demographic audit steps, mandatory promotion pay reviews — the next cohort of gaps will form through identical mechanisms. Correction without reform is expensive and temporary."
              },
              {
                "t": "scenario",
                "v": "Solaris Financial's adjusted pay gap analysis revealed a 6.3% residual representing $3.2M in disadvantage across 87 employees. Root causes: negotiation-based offers and inconsistent merit allocation. The correction programme fixed individual salaries. The governance reforms — structured offer matrix, merit demographic audit, promotion pay review mandate — prevented recurrence.",
                "title": "Solaris Financial's Pay Audit",
                "org": "Solaris Financial"
              },
              {
                "t": "takeaways",
                "items": [
                  "The adjusted gap — after controlling for legitimate factors — is the most actionable equity metric.",
                  "Gaps develop through small, repeated process failures — not single dramatic decisions.",
                  "Correction without governance reform is temporary; the same mechanisms will recreate the gap.",
                  "The three highest-impact governance controls: structured offer matrix, merit demographic audit, promotion pay review."
                ]
              }
            ],
            "article": 4
          },
          {
            "id": "1-2-Q",
            "title": "Module Quiz: Compensation Fundamentals",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Base Pay, Variable Pay Design, and Pay Equity Fundamentals. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "Compensation & Benefits Essentials",
    "subtitle": "The technical architecture of fair, competitive, and sustainable reward",
    "color": "#2E7D8C",
    "color2": "#3A9BAD",
    "bg": "#0C2340",
    "icon": "◇",
    "level": "Intermediate",
    "duration": "3–4 hours",
    "lessons_count": 6,
    "total_xp": 1200,
    "desc": "Build a salary structure from scratch, price roles against the market, design incentive plans that work, and manage a benefits strategy anchored to what your workforce actually values.",
    "outcomes": [
      "Build a salary structure with grades, midpoints, and ranges",
      "Match jobs to salary surveys and interpret percentile data",
      "Calculate and interpret compa-ratio and range penetration",
      "Identify what makes an incentive plan effective or counterproductive",
      "Design a benefits strategy anchored to workforce preferences and utilisation data"
    ],
    "modules": [
      {
        "id": "2-1",
        "title": "Salary Structures",
        "color": "#2E7D8C",
        "lessons": [
          {
            "id": "2-1-1",
            "title": "Salary Grades and Ranges",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Explain what a salary structure is and why it matters",
              "Understand how job evaluation produces grades",
              "Describe the anatomy of a salary range"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Without a salary structure, pay decisions default to whoever negotiates hardest. With one, every decision is made within a consistent, defensible framework that creates internal equity, external competitiveness, and governance accountability."
              },
              {
                "t": "h",
                "v": "What a Salary Structure Is"
              },
              {
                "t": "p",
                "v": "A salary structure is a hierarchy of grades, each with a defined minimum, midpoint, and maximum salary range. When a role is placed in Grade 4, everyone knows what range applies — without renegotiating for every hire or promotion. The structure creates consistency in every pay decision the organization makes."
              },
              {
                "t": "box",
                "v": "Minimum → entry/developing employee; below market reference\nMidpoint → fully competent employee; market reference rate (typically P50-P65)\nMaximum → highly experienced; ceiling of the grade\n\nMidpoints should be reviewed annually against market movement.",
                "label": "Anatomy of a Salary Range"
              },
              {
                "t": "h",
                "v": "Building the Grade Structure: Job Evaluation"
              },
              {
                "t": "p",
                "v": "Before building ranges, you need to understand the relative size of every role. Job evaluation scores each role on dimensions like knowledge required, problem-solving complexity, accountability, and impact. Roles with similar scores sit in the same grade regardless of function or title — a Finance Analyst at 280 points and an HR Analyst at 278 points belong in the same grade because they represent similar organizational value."
              },
              {
                "t": "h",
                "v": "Range Spreads"
              },
              {
                "t": "p",
                "v": "The spread between minimum and maximum defines how much variation is possible within one grade. Junior grades use 40-50% spreads (roles are more standardized). Senior grades use 60-70% spreads (wider to accommodate the significant difference between a new and a highly experienced senior professional)."
              },
              {
                "t": "scenario",
                "v": "Castleton Partners paid entirely by negotiation for ten years. An audit found two Senior Analysts doing identical work earning $64,000 and $89,000 — a 39% gap with no documented justification. After implementing a seven-grade structure anchored to P50, the average gap between comparable roles fell from 28% to 6% within one year. Voluntary turnover in mid-level roles fell 18%.",
                "title": "Castleton Builds From Scratch",
                "org": "Castleton Partners"
              },
              {
                "t": "takeaways",
                "items": [
                  "A salary structure creates consistency, governance, and the foundation for pay equity — it is a governance tool, not a cage.",
                  "Grades emerge from job evaluation: scoring roles on complexity, accountability, and scope regardless of title.",
                  "Range spread: 40-50% for junior grades, 60-70% for senior grades.",
                  "Midpoints require annual review against market movement — structures without maintenance drift within three years."
                ]
              }
            ],
            "article": 3
          },
          {
            "id": "2-1-2",
            "title": "Market Pricing and Benchmarking",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Read and interpret salary survey percentiles",
              "Match jobs by content not title",
              "Choose and apply an appropriate market positioning strategy"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Every compensation decision rests on an estimate of what the market pays for equivalent work. Market pricing is the discipline of gathering the best available evidence for that estimate — and making deliberate choices about where to position against it."
              },
              {
                "t": "h",
                "v": "Reading Salary Survey Data"
              },
              {
                "t": "p",
                "v": "Salary surveys report pay at defined percentiles. P25 is the lower quartile — below most competitors. P50 is the market median — the most common target. P75 is the upper quartile — above most competitors. P90 is highly competitive positioning, sustainable only for genuinely scarce talent segments."
              },
              {
                "t": "box",
                "v": "P25 → Below market (bottom quartile)\nP50 → Market median — most common benchmark target\nP75 → Above market (upper quartile)\nP90 → Highly competitive positioning for scarce talent\n\nAlways age survey data: market moving at 3.5% annually, 10-month-old data = multiply P50 by 1.029.",
                "label": "Percentile Reference Guide"
              },
              {
                "t": "h",
                "v": "Job Matching: Content Not Title"
              },
              {
                "t": "p",
                "v": "The most important and most frequently mishandled step. A 'Senior Manager' in a five-person team is not comparable to a 'Senior Manager' running a 200-person division — matching by title gives you wrong data. Match by role content: scope of accountability, number of direct reports, decision-making authority, and actual work performed. Use 80% content equivalence as your reliability threshold."
              },
              {
                "t": "scenario",
                "v": "Driftwood Media used a traditional media industry survey to benchmark digital engineering roles. The survey had almost no digital-native participants. Switching to a technology sector survey revealed an 18-22% pay gap for those roles. Targeted market supplements brought digital positions to P65, resolving the retention problem within two hiring cycles.",
                "title": "Driftwood's Digital Talent Gap",
                "org": "Driftwood Media"
              },
              {
                "t": "takeaways",
                "items": [
                  "Salary surveys report pay at percentiles: P25 (below), P50 (median target), P75 (above), P90 (highly competitive).",
                  "Match by role content — scope, accountability, decision authority — not job title.",
                  "Use multiple survey sources: single-source benchmarking creates false precision.",
                  "Always age survey data forward to your decision date using an estimated annual market movement factor."
                ]
              }
            ],
            "article": 6
          },
          {
            "id": "2-1-3",
            "title": "Compa-Ratio and Range Penetration",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Calculate compa-ratio and range penetration",
              "Interpret metric values for individual employees",
              "Use distributions not averages to diagnose pay positioning"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Two metrics can tell you almost everything about where an employee's pay sits. Compa-ratio and range penetration are the bread-and-butter analytics of compensation management — simple to calculate, immediately actionable, and foundational to every pay review and equity audit."
              },
              {
                "t": "h",
                "v": "Compa-Ratio"
              },
              {
                "t": "p",
                "v": "Compa-ratio compares an employee's actual salary to the midpoint of their grade range. A compa-ratio of 1.00 means paid exactly at the market reference. Below 1.00 is below market reference — appropriate for new or developing employees. Above 1.00 is above market reference — typical for highly experienced, consistently high-performing employees."
              },
              {
                "t": "box",
                "v": "Compa-Ratio = Employee Salary ÷ Grade Midpoint\n\nExample: £73,000 ÷ £82,000 = 0.890 (89% of midpoint — below market reference)\n\nRange Penetration = (Salary − Min) ÷ (Max − Min)\nExample: (£73K − £65K) ÷ (£99K − £65K) = 24%",
                "label": "The Two Core Formulas"
              },
              {
                "t": "h",
                "v": "Using Distributions, Not Averages"
              },
              {
                "t": "p",
                "v": "An average compa-ratio of 0.97 looks healthy. But if 30% of the population is at 0.84 and the other 30% is at 1.11, with a hollow middle, the distribution reveals a compression problem the average obscures. Always examine the distribution — plot it as a histogram — not just the mean."
              },
              {
                "t": "scenario",
                "v": "Three employees at Kestrel Group, Grade 4 (Range: £65K–£99K, Midpoint £82K). Employee A earns £73K: compa-ratio 0.89, penetration 24% — below market, good headroom, strong merit candidate. Employee B earns £84K: compa-ratio 1.02, penetration 56% — at market, standard treatment. Employee C earns £97K: compa-ratio 1.18, penetration 94% — above market, approaching ceiling, grade progression conversation needed.",
                "title": "Three Employees, One Grade",
                "org": "Kestrel Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Compa-ratio measures market alignment: below 1.00 is below market reference; above 1.00 is above.",
                  "Range penetration measures progression headroom: 0% is at minimum, 100% is at ceiling.",
                  "Use distributions not averages — compression and inequality are invisible in means but critical in distributions.",
                  "Both metrics together: compa-ratio shows where you are; range penetration shows how far you can go."
                ]
              }
            ],
            "article": 7
          },
          {
            "id": "2-1-Q",
            "title": "Module Quiz: Salary Structures",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Salary Grades, Market Pricing, and Compa-Ratio. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      },
      {
        "id": "2-2",
        "title": "Benefits Strategy",
        "color": "#2E7D8C",
        "lessons": [
          {
            "id": "2-2-1",
            "title": "Designing a Benefits Strategy",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Define what a benefits strategy is and what it answers",
              "Understand the core vs voluntary benefits architecture",
              "Identify what your workforce actually values"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Most organizations offer benefits. Far fewer have a benefits strategy. The difference is the difference between spending significant budget on programmes employees barely notice — and investing deliberately in provisions that drive retention and wellbeing because they were designed for the specific workforce they serve."
              },
              {
                "t": "h",
                "v": "What a Benefits Strategy Answers"
              },
              {
                "t": "p",
                "v": "A benefits strategy defines which benefits to provide, at what level, to whom, and why — aligned to the talent objectives, workforce demographics, and Total Rewards philosophy. For every benefit, it asks: what employee need does this meet? What talent outcome does it support? How will we know if it is working?"
              },
              {
                "t": "box",
                "v": "For each benefit you offer, ask:\n1. What specific employee need does this meet?\n2. Which talent outcome does it support (retention, attraction, wellbeing, equity)?\n3. What is the current utilisation rate?\n4. When was it last reviewed against employee preferences?\n\nIf you cannot answer these, the benefit is a cost without a strategy.",
                "label": "The Benefits Strategy Audit Questions"
              },
              {
                "t": "h",
                "v": "Core vs Voluntary Benefits"
              },
              {
                "t": "p",
                "v": "Core benefits — provided universally — establish the baseline of protection: health insurance, life assurance, income protection, pension with employer contribution, and minimum paid leave. These are non-negotiable security provisions. Voluntary benefits extend the offering with employee-directed options at group rates: additional dental cover, technology schemes, cycle-to-work, financial coaching."
              },
              {
                "t": "scenario",
                "v": "Solaris Financial had not reviewed its benefits since 2019. The 2019 workforce was predominantly male, 35-55, office-based. By 2025 it had become much younger and more diverse. A preference survey revealed the top five priorities: enhanced parental leave (67%), mental health support (58%), flexibility tools (52%), student loan assistance (44%), financial coaching (41%). Reallocating 18% of budget from low-utilisation legacy benefits to these five areas improved benefits satisfaction from 41% to 73% within 12 months.",
                "title": "Solaris's Benefits Redesign",
                "org": "Solaris Financial"
              },
              {
                "t": "takeaways",
                "items": [
                  "A benefits strategy defines purpose, target audience, and success metrics — it is an investment framework, not a product catalogue.",
                  "Core benefits provide universal protection; voluntary benefits enable personalisation above the baseline.",
                  "Design for actual workforce preferences revealed through surveys and utilisation data.",
                  "Utilisation reviews prevent the portfolio from accumulating expensive, low-impact legacy programmes."
                ]
              }
            ],
            "article": 8
          },
          {
            "id": "2-2-2",
            "title": "Benefits Enrollment and Communication",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Design an effective enrollment process",
              "Apply the pre-enrollment communication principle",
              "Use post-enrollment data to continuously improve"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Open enrollment is the annual moment when employees make decisions about their financial protection and health coverage for the coming year. A well-designed process turns this into genuine decision-making. A poor one produces passive defaults that leave employees under-insured and the organization failing to deliver the value its benefits investment was intended to generate."
              },
              {
                "t": "h",
                "v": "Active vs Passive Enrollment"
              },
              {
                "t": "p",
                "v": "In passive enrollment, previous selections carry forward unless actively changed — simple but producing outdated selections. In active enrollment, employees must make a positive choice for each benefit each year. Active enrollment produces more intentional decisions but requires proportionally greater pre-communication and decision support to prevent the anxiety that complex choices create."
              },
              {
                "t": "h",
                "v": "The Pre-Enrollment Window Is as Important as the Window Itself"
              },
              {
                "t": "p",
                "v": "Employees who receive clear communication about what is changing, what is new, and how to make decisions in the four to six weeks before enrollment opens arrive informed and ready to choose. Those who receive nothing arrive confused and default. Pre-enrollment communication should include: a summary of changes, reminders for employees who have had life events, a clear timeline, and signposting to decision support tools."
              },
              {
                "t": "box",
                "v": "Enrollment design checklist:\n☑ Pre-enrollment communication begins 4-6 weeks before window opens\n☑ Decision support tools compare plan options and model costs\n☑ Multiple communication channels (email, manager briefing, intranet, app)\n☑ Support for new joiners experiencing enrollment for the first time\n☑ Post-enrollment analysis of completion rate, take-up changes, protection gaps",
                "label": "Enrollment Design Checklist"
              },
              {
                "t": "scenario",
                "v": "Palora Health's enrollment completion rate was 68% — nearly a third defaulting without review. Three problems: the window was only 10 days, the platform required a separate login, and the only communication was a single email. Changes: window extended to 21 days, SSO enabled, four communication channels, decision guide added. Completion rose to 91%. Accidental coverage gaps fell 67%.",
                "title": "Palora's Enrollment Transformation",
                "org": "Palora Health"
              },
              {
                "t": "takeaways",
                "items": [
                  "Active enrollment produces more intentional selections but requires strong pre-communication and decision support.",
                  "The four-to-six weeks before the window are as important as the window design itself.",
                  "Multi-channel communication reaches the full workforce — a single email approach misses significant proportions.",
                  "Post-enrollment analysis reveals completion gaps, take-up changes, and protection gaps — the blueprint for next year's improvements."
                ]
              }
            ],
            "article": 16
          },
          {
            "id": "2-2-3",
            "title": "Financial Wellbeing as a Reward Strategy",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Understand why financial wellbeing belongs in Total Rewards",
              "Design a financial wellbeing programme that works",
              "Measure financial wellbeing programme effectiveness"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Financial stress affects performance and engagement at all income levels — not only among lower earners. Research consistently shows that employees managing significant financial anxiety are less focused, more absent, and more likely to leave. Employers are uniquely positioned to help."
              },
              {
                "t": "h",
                "v": "The Four Dimensions"
              },
              {
                "t": "p",
                "v": "Financial wellbeing has four dimensions. Security covers income adequacy and emergency savings. Resilience is the capacity to absorb financial shocks. Literacy is the knowledge and skills to make good financial decisions. Confidence is the sense of control and direction over personal finances. Effective programmes address all four — not just emergency support."
              },
              {
                "t": "box",
                "v": "Financial wellbeing programme components:\n• Security: adequate salary, emergency savings tools, income protection\n• Resilience: EAP financial helplines, salary advance tools, hardship fund\n• Literacy: financial education, pension optimisation, budgeting tools\n• Confidence: one-to-one financial coaching, retirement planning sessions",
                "label": "The Four-Dimension Framework"
              },
              {
                "t": "h",
                "v": "What Works and What Does Not"
              },
              {
                "t": "p",
                "v": "Generic financial education — a one-size webinar on managing money — produces low engagement and minimal behaviour change. Effective programmes are personalised, practical, and timed to match employee financial decision moments: pension enrollment, benefits selection, salary review, major life events. Meeting employees at the moments when financial decisions are most live dramatically improves both engagement and behavioural outcome."
              },
              {
                "t": "scenario",
                "v": "Kestrel Group launched a financial wellbeing programme after finding financial stress was the second most common wellbeing concern, cutting across all salary bands. Four components: digital financial education platform, four employer-subsidised coaching sessions per employee annually, enhanced pension matching, and a hardship fund. Result: financial stress as a reported concern fell from 67% to 38%. Pension contribution opt-up participation rose from 22% to 41%.",
                "title": "Kestrel's Financial Wellbeing Programme",
                "org": "Kestrel Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Financial stress affects engagement and productivity at all income levels — it is a business issue, not only a welfare concern.",
                  "The four dimensions — security, resilience, literacy, confidence — require different interventions.",
                  "Effective education is personalised, practical, and delivered at relevant decision moments.",
                  "Measure programme effectiveness through financial wellbeing survey scores, pension participation rates, and EAP financial utilisation."
                ]
              }
            ],
            "article": 22
          },
          {
            "id": "2-2-Q",
            "title": "Module Quiz: Benefits Strategy",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Benefits Strategy, Enrollment, and Financial Wellbeing. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "Pay Equity & Job Evaluation",
    "subtitle": "Building fair, defensible, and equitable pay systems",
    "color": "#6B4C9A",
    "color2": "#8866BB",
    "bg": "#0C2340",
    "icon": "◉",
    "level": "Intermediate",
    "duration": "2–3 hours",
    "lessons_count": 6,
    "total_xp": 1200,
    "desc": "Master the principles and practice of job evaluation, understand how pay gaps develop and compound, and build the governance frameworks that make pay equity sustainable — not a one-time project.",
    "outcomes": [
      "Apply point-factor job evaluation methodology",
      "Conduct an adjusted pay equity analysis",
      "Identify the root causes of pay gaps in your organization",
      "Design governance frameworks that prevent gap recurrence",
      "Build the business case for pay equity investment"
    ],
    "modules": [
      {
        "id": "3-1",
        "title": "Job Evaluation",
        "color": "#6B4C9A",
        "lessons": [
          {
            "id": "3-1-1",
            "title": "What Job Evaluation Is and Why It Matters",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Define job evaluation and its purpose",
              "Understand the role-not-person principle",
              "Identify the four main evaluation methodologies"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Before you can pay fairly, you need a consistent answer to one question: how do these roles compare in size, complexity, and organizational value? Job evaluation provides that answer. Without it, grade decisions default to titles, political influence, or historical accident."
              },
              {
                "t": "h",
                "v": "The Core Principle: Role, Not Person"
              },
              {
                "t": "p",
                "v": "Job evaluation assesses the role — its complexity, scope, and accountability — not the person currently holding it. This distinction must be maintained rigorously. A brilliant employee in a junior role should be rewarded through performance pay. The grade itself must reflect the inherent value of the work, not the qualities of who currently does it."
              },
              {
                "t": "box",
                "v": "The most common evaluation error: scoring a role higher because the person in it is excellent, or lower because they are underperforming. Always evaluate the role as designed and described — not as performed by any specific individual.",
                "label": "Critical Warning"
              },
              {
                "t": "h",
                "v": "The Four Methods"
              },
              {
                "t": "p",
                "v": "Whole-job ranking orders all roles by overall judgment — fast but subjective, hard to scale above 50 roles. Job classification matches roles against predefined grade descriptions — more structured but struggles with hybrid roles. Market pricing uses salary data as the implicit measure of role size. Point-factor evaluation scores roles on defined compensable factors — the most rigorous and widely used in large organizations."
              },
              {
                "t": "scenario",
                "v": "Meridian Group acquired three firms with incompatible grade structures — a Grade 4 in legacy Meridian was equivalent to Grade 7 in one firm and Grade 3 in another. Implementing a common five-factor point-factor system across all 580 roles created a single eight-grade architecture enabling consistent career moves, pay decisions, and equity analysis across the combined organization.",
                "title": "Meridian's Grade Alignment",
                "org": "Meridian Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Job evaluation creates a consistent basis for grade decisions across all functions and levels.",
                  "The fundamental principle: evaluate the role, not the person holding it.",
                  "Point-factor evaluation produces the most rigorous, defensible, and auditable outcomes.",
                  "Without a consistent evaluation system, grade decisions are made by title, seniority, or political advocacy."
                ]
              }
            ],
            "article": 5
          },
          {
            "id": "3-1-2",
            "title": "Point-Factor Evaluation in Practice",
            "duration": "8 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Structure a point-factor evaluation exercise",
              "Apply compensable factors to real roles",
              "Translate scores into grades and manage appeals"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Point-factor evaluation is the most widely used job evaluation methodology in large organizations. It produces scores that can be compared across all functions and levels — creating a defensible, consistent basis for grade decisions that survives management challenge and legal scrutiny."
              },
              {
                "t": "h",
                "v": "Compensable Factors"
              },
              {
                "t": "p",
                "v": "A point-factor system defines compensable factors — the dimensions of a role that justify higher or lower pay. Typical factors: Knowledge and Technical Skill (depth and breadth of expertise required), Problem Solving and Complexity (degree of judgment, ambiguity, and innovation), Accountability and Impact (scope of decisions and consequences), People and Resource Management (scale and nature of leadership)."
              },
              {
                "t": "box",
                "v": "Each factor is defined at 4-5 levels with point values per level. A panel reviews the job description and assigns a level on each factor. Total points determine the grade band. This produces scores that are consistent across all functions, defensible under challenge, and comparable over time.",
                "label": "How Point-Factor Works"
              },
              {
                "t": "h",
                "v": "Governance: Panels, Calibration, and Appeals"
              },
              {
                "t": "p",
                "v": "Evaluation panels typically include 3-5 people from different functions, including HR. Panel composition prevents single-function bias. Calibration sessions compare scores across functions to catch inconsistency — do equivalent roles in Finance and HR score comparably? And every system needs a formal appeals process: a documented route through which employees or managers can challenge outcomes with additional evidence."
              },
              {
                "t": "scenario",
                "v": "Meridian Group's evaluation panel included five members: CPO, Finance Director, Operations VP, Head of C&B, external consultant. When a manager challenged a Grade 4 outcome for their 'Senior Director of Analytics' role (expecting Grade 6), the panel review confirmed: one direct report, limited budget authority, narrow accountability. Grade 4 was upheld with full documentation. Initial frustration gave way to acceptance once the evidence-based reasoning was shared clearly.",
                "title": "Meridian's Panel in Action",
                "org": "Meridian Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Compensable factors typically include: knowledge/skill, problem-solving, accountability, and people management.",
                  "Panel evaluation with diverse membership prevents single-function bias and strengthens defensibility.",
                  "Calibration sessions are essential — without them, 'Grade 4' can mean very different things in different functions.",
                  "Formal appeals processes protect the system's integrity and provide a legitimate outlet for genuine disagreements."
                ]
              }
            ],
            "article": 5
          },
          {
            "id": "3-1-3",
            "title": "Career Frameworks and Job Families",
            "duration": "6 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Understand what a career level framework provides",
              "Distinguish job families from grades",
              "Apply frameworks to career development conversations"
            ],
            "body": [
              {
                "t": "intro",
                "v": "A salary structure tells employees where they sit. A career level framework tells them what the journey looks like — what skills and capabilities define each level, and what progression from one level to the next actually requires."
              },
              {
                "t": "h",
                "v": "Job Families"
              },
              {
                "t": "p",
                "v": "A job family groups roles that share a common professional domain — Finance, HR, Technology, Operations, Commercial. Within each family, roles progress from junior to senior along defined career paths. Job families help employees understand where they sit in the professional landscape and what development leads toward progression."
              },
              {
                "t": "h",
                "v": "Career Level Frameworks"
              },
              {
                "t": "p",
                "v": "Career level frameworks define the skill, capability, and accountability expectations at each grade within a job family. They answer the question every ambitious employee asks: 'What do I need to do — and be — to get to the next level?' Without this clarity, promotion decisions feel arbitrary and development conversations are difficult to make specific."
              },
              {
                "t": "box",
                "v": "A career level framework for each job family should describe at each grade:\n1. Typical accountabilities and scope\n2. Technical skills and knowledge expected\n3. Behavioural standards demonstrated\n4. Contribution to team and organizational outcomes\n\nThis four-part structure makes development conversations concrete and progression decisions defensible.",
                "label": "Career Level Framework Components"
              },
              {
                "t": "scenario",
                "v": "Castleton Partners implemented a six-level career framework for its Consulting job family. In the year following implementation, promotion requests fell by 34% — not because fewer people deserved promotion, but because employees now understood where they actually stood and what genuine next-level performance looked like. Promotion decisions became faster, more consistent, and less contested.",
                "title": "Castleton's Career Framework",
                "org": "Castleton Partners"
              },
              {
                "t": "takeaways",
                "items": [
                  "Job families group roles by professional domain and define career pathways within each.",
                  "Career level frameworks define what is expected at each grade: accountabilities, skills, behaviours, contributions.",
                  "Without career level frameworks, promotion decisions feel arbitrary and development conversations lack specific direction.",
                  "Well-designed frameworks improve transparency, reduce grade inflation pressure, and make pay equity analysis more precise."
                ]
              }
            ],
            "article": 5
          },
          {
            "id": "3-1-Q",
            "title": "Module Quiz: Job Evaluation",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Job Evaluation methodology, point-factor practice, and career frameworks. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      },
      {
        "id": "3-2",
        "title": "Pay Equity Analysis",
        "color": "#6B4C9A",
        "lessons": [
          {
            "id": "3-2-1",
            "title": "Understanding Pay Gaps",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Distinguish unadjusted from adjusted pay gaps",
              "Identify root causes of pay inequity",
              "Understand how small decisions compound into significant gaps"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Pay gaps rarely appear suddenly. They compound gradually through small, repeated decisions that each seem reasonable in isolation — until they produce systematic inequity that is expensive to correct and damaging to trust when discovered."
              },
              {
                "t": "h",
                "v": "Two Different Gaps"
              },
              {
                "t": "p",
                "v": "The unadjusted gap compares average pay between groups without controlling for any factors. A large unadjusted gap may largely reflect occupational segregation — more men in senior roles — rather than within-role pay discrimination. The adjusted gap controls for grade, function, experience, and performance: what pay difference remains that cannot be explained by legitimate factors?"
              },
              {
                "t": "box",
                "v": "Unadjusted gap → reflects structural and representation issues (who is in which roles)\nAdjusted gap → reflects pay decision inequity (how comparable people are paid differently)\n\nBoth matter and require action — but different interventions address each.",
                "label": "The Two-Gap Framework"
              },
              {
                "t": "h",
                "v": "How Gaps Form"
              },
              {
                "t": "p",
                "v": "A negotiation-based offer imports whatever inequity existed at the candidate's previous employer. A merit increase applied 0.3% lower to a demographic group year after year compounds to a significant difference over a career. A promotion with a new title but no salary review leaves someone undercompensated at the new level. None is dramatic in isolation — together they produce systematic, significant inequity."
              },
              {
                "t": "scenario",
                "v": "Solaris Financial's unadjusted gender gap was 24%. Leadership attributed this to occupational segregation. But the adjusted analysis revealed a 6.3% residual gap representing $3.2M across 87 employees. Root causes: women were offered salaries 8% closer to range minimum at hire, and merit increases had averaged 0.4% lower in two functions over three consecutive years.",
                "title": "Solaris Financial's Gap Discovery",
                "org": "Solaris Financial"
              },
              {
                "t": "takeaways",
                "items": [
                  "The adjusted gap is the most actionable equity metric — it identifies pay decision inequity rather than structural representation issues.",
                  "Gaps form through small, repeated process failures — not single dramatic decisions.",
                  "The most impactful gap-creating moments: initial offer, annual merit allocation, and promotion pay review.",
                  "Understanding root causes is essential — individual corrections without process reform guarantee recurrence."
                ]
              }
            ],
            "article": 4
          },
          {
            "id": "3-2-2",
            "title": "Running a Pay Equity Review",
            "duration": "8 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Set up a pay equity analysis in structured steps",
              "Apply compa-ratio as an equity metric",
              "Present equity findings to leadership effectively"
            ],
            "body": [
              {
                "t": "intro",
                "v": "A pay equity review is a structured analytical process. Done well, it produces findings that are actionable, defensible, and specific enough to drive targeted interventions. The methodology determines whether findings create trust or generate defensiveness."
              },
              {
                "t": "h",
                "v": "Five Steps to an Equity Review"
              },
              {
                "t": "p",
                "v": "Step 1: Define scope — population, comparison groups, pay elements, data cut-off date. Step 2: Calculate compa-ratio for every employee (salary ÷ grade midpoint). Step 3: Compare average compa-ratios across demographic groups within the same grade and function. Step 4: Apply controls for tenure, performance, and time in role. Step 5: Quantify the adjusted gap and map to root causes."
              },
              {
                "t": "box",
                "v": "Using compa-ratio as the equity metric is more robust than comparing absolute salaries:\n• It removes grade differences (a Grade 5 and Grade 3 employee are not comparable)\n• It accounts for range widths (a £5K gap means different things in different grades)\n• It enables comparison across functions with different market rates\n• It can be tracked over time to show equity trend",
                "label": "Why Compa-Ratio for Equity Analysis"
              },
              {
                "t": "h",
                "v": "Presenting Findings"
              },
              {
                "t": "p",
                "v": "Present findings segmented by function, grade, and demographic — not as a single organization-wide figure, which obscures where interventions are needed. Always accompany gap findings with root cause analysis and a recommended action plan. A gap finding without a remediation pathway creates anxiety without direction — and is harder for leadership to act on."
              },
              {
                "t": "scenario",
                "v": "Palora Health's organization-level analysis showed a 0.8% adjusted gap — apparently fine. But segmented analysis revealed a 5.4% adjusted gap within the Finance function at Grades 5 and 6, concentrated in the last two hiring cohorts. Root cause: structured offer process had not been applied to Finance leadership hires, leaving managers to anchor offers to candidate salary history. The segmented finding enabled a targeted, defensible intervention.",
                "title": "Palora's Segmented Analysis",
                "org": "Palora Health"
              },
              {
                "t": "takeaways",
                "items": [
                  "Compa-ratio is the most robust equity metric — it removes grade and range width differences from the analysis.",
                  "Segment findings by function, grade, and demographic to identify where interventions are needed.",
                  "Always accompany gap findings with root cause analysis and a specific remediation plan.",
                  "Organization-level averages can mask significant function-level inequities — always examine the segments."
                ]
              }
            ],
            "article": 4
          },
          {
            "id": "3-2-3",
            "title": "Closing Gaps and Building Governance",
            "duration": "7 min",
            "xp": 80,
            "type": "lesson",
            "objectives": [
              "Design a pay equity remediation programme",
              "Build the governance controls that prevent recurrence",
              "Make the business case for pay equity investment"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Finding a pay gap is the beginning, not the end. The organizations that produce durable equity improvements are those that fix the processes that created the gap — not just the individual salaries that resulted from it."
              },
              {
                "t": "h",
                "v": "Two Types of Intervention"
              },
              {
                "t": "p",
                "v": "Individual corrections address the outcome: increasing specific salaries where inequity is documented. These are necessary — identified individuals should not wait for process reforms to benefit. But they are not sufficient. Process reforms address the cause: replacing negotiation-based offers with structured matrices, introducing merit guidelines with demographic audit steps, mandating salary reviews at promotion."
              },
              {
                "t": "box",
                "v": "Individual corrections alone = expensive cycle of gap → correction → re-formation.\nIndividual corrections + process reforms = durable equity.\n\nThe three highest-impact governance controls:\n1. Structured offer matrix (anchored to grade and experience, not salary history)\n2. Merit demographic audit (review distributions before communication)\n3. Mandatory promotion pay review (grade change must trigger salary assessment)",
                "label": "The Sustainability Equation"
              },
              {
                "t": "h",
                "v": "The Business Case"
              },
              {
                "t": "p",
                "v": "Pay equity delivers measurable business returns beyond the ethical and legal imperative: higher engagement scores among historically underpaid groups, lower voluntary turnover, better performance in regulated disclosure requirements, and reduced legal exposure. Quantifying these benefits alongside correction costs builds a compelling case for the governance investment to finance leadership."
              },
              {
                "t": "scenario",
                "v": "Solaris Financial's correction programme cost $3.2M in salary adjustments. Process reforms — structured offer matrix, merit demographic audit, mandatory promotion pay review — cost approximately $180K in HR team time. In the two review cycles following implementation, the adjusted pay gap held below 0.8%. The process reforms were sustaining the correction rather than allowing re-formation.",
                "title": "Solaris's Correction Programme",
                "org": "Solaris Financial"
              },
              {
                "t": "takeaways",
                "items": [
                  "Correction without governance reform is temporary — the same mechanisms will recreate the gap within 2-3 cycles.",
                  "The three highest-impact controls: structured offer matrix, merit demographic audit, mandatory promotion pay review.",
                  "Pay equity delivers ROI: higher engagement, lower turnover, regulatory readiness, reduced legal exposure.",
                  "Frame equity investment as retention and compliance programme — this language resonates with finance and board."
                ]
              }
            ],
            "article": 4
          },
          {
            "id": "3-2-Q",
            "title": "Module Quiz: Pay Equity Analysis",
            "duration": "5 min",
            "xp": 150,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Pay Gap Analysis, Equity Review Methodology, and Governance Design. Pass rate: 70% · 150 XP available."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "title": "Pay Transparency & Communication",
    "subtitle": "Building the governance and skills to communicate pay with confidence",
    "color": "#D4556E",
    "color2": "#E87088",
    "bg": "#0C2340",
    "icon": "◎",
    "level": "Intermediate",
    "duration": "2–3 hours",
    "lessons_count": 6,
    "total_xp": 900,
    "desc": "Navigate the shift to pay transparency with governance, manager enablement, and Total Reward Statements — and communicate rewards in ways that build trust, not anxiety.",
    "outcomes": [
      "Navigate EU Pay Transparency Directive and equivalent legislation",
      "Build a structured framework for internal pay transparency",
      "Create a Total Reward Statement for your organization",
      "Enable managers to have confident, accurate pay conversations",
      "Design a multi-channel, lifecycle-aware reward communication plan"
    ],
    "modules": [
      {
        "id": "4-1",
        "title": "Pay Transparency in Practice",
        "color": "#D4556E",
        "lessons": [
          {
            "id": "4-1-1",
            "title": "The Transparency Spectrum",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Describe the pay transparency spectrum",
              "Distinguish process from outcome transparency",
              "Assess where your organization currently sits"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Pay transparency is not a binary switch from secret to public. It is a spectrum — and the question is not whether to be transparent, but how, at what pace, and with what governance foundation in place first."
              },
              {
                "t": "h",
                "v": "The Spectrum"
              },
              {
                "t": "p",
                "v": "At one end, employees know only their own salary. At the other, every salary is visible to all. Between those extremes lies a broad range — and the right position depends on the organization's pay system maturity, culture, and regulatory environment. Most organizations find that internal range transparency (employees know their grade and range) is a practical, trust-building first step."
              },
              {
                "t": "box",
                "v": "Low → employee knows only own salary\nInternal → grade and salary range disclosed to employees\nExternal → ranges posted in job advertisements\nHigh → all individual salaries visible\n\nMost effective first step for most organizations: internal transparency with strong manager enablement.",
                "label": "The Transparency Spectrum"
              },
              {
                "t": "h",
                "v": "Process vs Outcome Transparency"
              },
              {
                "t": "p",
                "v": "Process transparency explains how pay decisions are made — the methodology, governance, and principles. Outcome transparency shares actual pay data — ranges, individual salaries, or aggregate gap statistics. Most organizations benefit most from high process transparency first: employees who understand how the system works trust it more and ask fewer anxious questions — even when pay levels themselves do not change."
              },
              {
                "t": "scenario",
                "v": "Almont Solutions implemented transparency in three stages over 18 months. Stage 1: published grade structure and role profiles internally. Stage 2: published salary ranges per grade with a market positioning explanation. Stage 3: trained all managers to have confident pay conversations. Result: 34% reduction in pay-related HR queries, 19-point improvement in pay fairness score, 12% improvement in offer acceptance rates.",
                "title": "Almont's Transparency Journey",
                "org": "Almont Solutions"
              },
              {
                "t": "takeaways",
                "items": [
                  "Pay transparency is a spectrum — organizations should move along it progressively, not in a single leap.",
                  "Process transparency (explaining how decisions are made) builds trust as effectively as outcome transparency.",
                  "Internal range sharing is a practical, trust-building first step with manageable governance requirements.",
                  "Publishing ranges without underlying governance amplifies problems rather than resolving them."
                ]
              }
            ],
            "article": 10
          },
          {
            "id": "4-1-2",
            "title": "Regulatory Requirements in 2026",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Understand EU Pay Transparency Directive requirements",
              "Identify equivalent legislation in other key markets",
              "Assess your organization's current compliance status"
            ],
            "body": [
              {
                "t": "intro",
                "v": "By 2026, pay range disclosure requirements are in effect or imminent across most major economies. Organizations that built governance proactively are navigating this smoothly. Those that did not are simultaneously trying to meet regulatory deadlines and fix the inequities that transparency will reveal."
              },
              {
                "t": "h",
                "v": "The EU Pay Transparency Directive"
              },
              {
                "t": "p",
                "v": "The Directive, being transposed into member state law, requires: providing salary range information to candidates before interview; giving employees access to their pay information relative to colleagues doing equivalent work; reporting gender pay gaps; and conducting joint pay assessments when gaps exceed 5%. Pay secrecy clauses in employment contracts are prohibited."
              },
              {
                "t": "box",
                "v": "EU Pay Transparency Directive — key obligations:\n• Salary range to candidates before interview stage\n• Employee right to access pay information by category\n• Gender pay gap reporting (100+ employees)\n• Joint pay assessment when gap exceeds 5%\n• No pay secrecy clauses in contracts\n\nNational transposition timelines vary — check your specific member state deadlines.",
                "label": "Directive Key Requirements"
              },
              {
                "t": "h",
                "v": "Other Markets"
              },
              {
                "t": "p",
                "v": "In the US, Colorado, California, New York, Washington, Illinois, and other states require salary ranges in job postings. The UK is consulting on mandatory disclosure requirements. Canada, Australia, and APAC markets have developing equivalent requirements. Global employers must track all applicable jurisdictions — reactive compliance consistently costs more than proactive preparation."
              },
              {
                "t": "scenario",
                "v": "Castleton Partners operates in the UK, Netherlands, and Germany. Their 2023 review concluded their existing structure would not survive regulatory scrutiny — too many inconsistencies, undocumented decisions. They invested 18 months in a full rebuild. When mandatory pay gap reports were due in 2026, they published proactively and used the disclosure as an employer brand asset, demonstrating equity commitment rather than managing regulatory embarrassment.",
                "title": "Castleton Navigates Regulation",
                "org": "Castleton Partners"
              },
              {
                "t": "takeaways",
                "items": [
                  "The EU Pay Transparency Directive requires range disclosure, employee pay access rights, gap reporting, and joint assessments.",
                  "US state laws (Colorado, California, New York, Washington) require ranges in job postings.",
                  "Global employers must track requirements across all operating jurisdictions.",
                  "Proactive compliance is significantly less costly than reactive remediation once disclosure reveals existing problems."
                ]
              }
            ],
            "article": 10
          },
          {
            "id": "4-1-3",
            "title": "Building the Governance Foundation",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Sequence transparency implementation correctly",
              "Apply the fix-first principle",
              "Enable managers before expanding transparency"
            ],
            "body": [
              {
                "t": "intro",
                "v": "The most common transparency mistake is publishing information about a pay system that cannot withstand scrutiny. Transparency amplifies what already exists — it makes strong, equitable systems more trusted and weak, inconsistent ones more visible. The sequence matters."
              },
              {
                "t": "h",
                "v": "Fix First, Then Disclose"
              },
              {
                "t": "p",
                "v": "Before expanding transparency: conduct a pay equity audit and address significant gaps. Ensure salary ranges are documented and market-aligned. Verify all employees are within their range or have documented resolution plans. Update midpoints to current market levels. This groundwork prevents transparency from surfacing unresolved problems in real time, in manager-employee conversations for which nobody is prepared."
              },
              {
                "t": "box",
                "v": "Transparency readiness checklist:\n☑ Pay equity audit completed and significant gaps addressed\n☑ All ranges documented and market-aligned\n☑ All employees within range or with resolution plans\n☑ Range midpoints updated to current market levels\n☑ Managers trained on grade structure, ranges, and merit logic\n☑ FAQ and communications plan prepared",
                "label": "Before You Publish Ranges"
              },
              {
                "t": "h",
                "v": "Manager Enablement Is Non-Negotiable"
              },
              {
                "t": "p",
                "v": "Employees experience transparency primarily through conversations with their manager. A well-designed transparency framework becomes worthless if the manager cannot explain how grades work, why two comparable people might be paid differently, or what influences merit increases. Manager preparation is the most important infrastructure investment in any transparency programme."
              },
              {
                "t": "scenario",
                "v": "Nova Tech published salary ranges without manager preparation. In two weeks, 340 manager-employee conversations were triggered. Sixty-seven percent of managers gave inaccurate answers or deflected entirely. Formal pay grievances rose 58% in the following quarter. A structured manager training programme was implemented. By month six, grievances had returned to below baseline and employee trust scores had measurably improved.",
                "title": "Nova Tech's Transparency Warning",
                "org": "Nova Tech"
              },
              {
                "t": "takeaways",
                "items": [
                  "The sequence: pay equity audit → address gaps → align ranges → train managers → then expand transparency.",
                  "Publishing without fixing first amplifies problems — transparency reveals what exists, not what you wish existed.",
                  "Manager enablement is the most important infrastructure investment in any transparency initiative.",
                  "A well-prepared transparency programme reduces HR queries, improves perceived fairness, and strengthens employer brand."
                ]
              }
            ],
            "article": 10
          },
          {
            "id": "4-1-Q",
            "title": "Module Quiz: Pay Transparency",
            "duration": "5 min",
            "xp": 75,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on the Transparency Spectrum, Regulatory Requirements, and Governance Foundation. Pass rate: 70% · 75 XP available."
              }
            ]
          }
        ]
      },
      {
        "id": "4-2",
        "title": "Reward Communication",
        "color": "#D4556E",
        "lessons": [
          {
            "id": "4-2-1",
            "title": "The Total Reward Statement",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Understand what a TRS contains and why it works",
              "Calculate the employer cost components to include",
              "Design a TRS that increases perceived value"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Research consistently shows employees underestimate the value of their total package by 20 to 35 percent when they think only about take-home salary. The Total Reward Statement closes that gap — increasing perceived value from investment already made, at no additional programme cost."
              },
              {
                "t": "h",
                "v": "What a TRS Contains"
              },
              {
                "t": "p",
                "v": "A Total Reward Statement is a personalised document showing each employee the complete monetary value of their package: base salary, bonus target, employer pension contributions, health insurance premium, life assurance, income protection, paid leave value, and the employer's cost of any other provisions. The key word is personalised — generic average-based estimates are discounted by employees."
              },
              {
                "t": "box",
                "v": "TRS example — employee on £60,000 base salary:\nBase salary: £60,000 · Bonus target (15%): £9,000\nEmployer pension (8%): £4,800 · Health insurance: £3,200\nLife assurance: £480 · Income protection: £240\nAnnual leave (25 days): £5,769\n\nTotal Remuneration: £73,489\nvs Base Salary alone: £60,000\n(employee likely perceived: ~£63,000)",
                "label": "TRS Worked Example"
              },
              {
                "t": "h",
                "v": "Maximising Impact"
              },
              {
                "t": "p",
                "v": "TRS documents should be distributed annually at a high-attention moment — near the merit review or bonus payment, when employees are already thinking about their compensation. Always pair distribution with a manager conversation: a TRS emailed without context is less than half as effective as one explained by a prepared manager in a brief conversation."
              },
              {
                "t": "scenario",
                "v": "Driftwood Media's engagement survey showed only 38% felt their total rewards were competitive — despite paying at P55 with above-market pension and comprehensive health cover. After introducing personalised TRS documents, perceived competitiveness rose to 64% in 12 months. No programmes changed. The return came entirely from making visible what was already invested.",
                "title": "Driftwood's Communication ROI",
                "org": "Driftwood Media"
              },
              {
                "t": "takeaways",
                "items": [
                  "Total Reward Statements increase perceived value from investment already made — they are cost-free improvements in perceived competitiveness.",
                  "Personalisation is essential — generic average-based figures are discounted and reduce trust.",
                  "Pair TRS distribution with a manager conversation — explained value is significantly more impactful than discovered value.",
                  "Distribute at high-attention moments: near merit review, bonus payment, or benefits enrollment window."
                ]
              }
            ],
            "article": 15
          },
          {
            "id": "4-2-2",
            "title": "Enabling Managers for Pay Conversations",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Understand why managers are the primary reward communication channel",
              "Design a manager enablement programme",
              "Prepare talking points for key pay conversation types"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Employees do not experience their employer's reward system — they experience their manager's explanation of it. The most sophisticated pay architecture becomes noise if the manager in the room cannot explain how grades work, why a specific pay decision was made, or what the future looks like."
              },
              {
                "t": "h",
                "v": "The Five Questions Every Manager Must Answer"
              },
              {
                "t": "p",
                "v": "Manager enablement for pay conversations covers five core capabilities: explaining how the grade structure and salary ranges work; describing what influences merit increase decisions; handling a smaller-than-expected increase with clarity and empathy; addressing a pay fairness concern with evidence rather than deflection; and describing what career progression means for pay trajectory."
              },
              {
                "t": "box",
                "v": "Five questions every manager should be able to answer confidently:\n1. How was my team member's grade determined?\n2. What is the salary range for their grade?\n3. Why did they receive this specific merit increase?\n4. What would it take for them to earn more?\n5. How does their pay compare to peers? (within policy limits)",
                "label": "Five Manager Questions"
              },
              {
                "t": "h",
                "v": "Building the Enablement Programme"
              },
              {
                "t": "p",
                "v": "Manager enablement runs on three tracks: Knowledge (understanding the grade structure, ranges, and merit matrix logic), Skills (practising pay conversations with scenarios and roleplay — including difficult conversations), and Resources (briefing packs, FAQ documents, talking points, and a clear escalation route to HR for complex situations)."
              },
              {
                "t": "scenario",
                "v": "Meridian Group's annual merit cycle generated 240+ HR escalations in the two weeks following salary letter distribution — managers unable to explain merit decisions. After implementing a manager briefing programme covering the merit matrix, prepared talking points, and 90-minute roleplay workshops, HR escalations fell to 34 in the following cycle. Manager pay conversation confidence scores improved 28 points.",
                "title": "Meridian's Enablement Programme",
                "org": "Meridian Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Employees experience reward communication primarily through managers — manager capability is the most important communication infrastructure.",
                  "The three enablement tracks: knowledge (understanding the system), skills (having the conversations), resources (tools to support).",
                  "HR escalations following merit cycles are the most reliable indicator of manager pay conversation capability.",
                  "Roleplay practice for difficult conversations is as important as knowledge of the system — most managers need both."
                ]
              }
            ],
            "article": 15
          },
          {
            "id": "4-2-3",
            "title": "Building a Reward Communication Calendar",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Design a multi-channel reward communication plan",
              "Identify lifecycle touchpoints for reward communication",
              "Measure communication effectiveness"
            ],
            "body": [
              {
                "t": "intro",
                "v": "A reward that employees cannot see is functionally equivalent to one that does not exist. Effective reward communication is multi-channel, multi-touch, and lifecycle-aware — meeting employees with relevant information at the moments that matter most, not once a year at benefits enrollment."
              },
              {
                "t": "h",
                "v": "Lifecycle Touchpoints"
              },
              {
                "t": "p",
                "v": "Reward information is most impactful when relevant to the employee's current moment. Key touchpoints: offer stage (complete package explanation, expectation setting), onboarding (benefits orientation beyond payroll setup), annual merit cycle (pre-communication and post-decision manager conversation), benefits enrollment window (pre-enrollment decision support), and major life events (parental leave, promotion, significant salary change)."
              },
              {
                "t": "box",
                "v": "Reward communication calendar:\nJan: Total Reward Statements distributed + manager briefings\nFeb: Benefits awareness campaign (utilisation focus)\nApr: Merit letters + manager pay conversations\nJun: Mid-year development and pay trajectory check-ins\nSep: Open enrollment pre-communication begins\nOct: Open enrollment window\nDec: Year-end bonus and recognition communications",
                "label": "Annual Communication Calendar"
              },
              {
                "t": "h",
                "v": "Measuring Effectiveness"
              },
              {
                "t": "p",
                "v": "Four indicators reveal whether reward communication is working: Awareness (can employees name their benefits?), Comprehension (can they explain how pay decisions are made?), Satisfaction (do they feel well-informed and fairly treated?), Utilisation (are they using the programmes available?). Track these quarterly and use the data to continuously improve the communication plan."
              },
              {
                "t": "scenario",
                "v": "Palora Health invested £85,000 in communication improvements — personalised TRS documents, an enrollment decision guide, and manager training — without changing the benefits programme itself. Perceived benefit quality ratings rose from 33% to 61% favorable in 12 months. Total benefits spend unchanged. The return came entirely from making visible what was already being invested.",
                "title": "Palora's Communication Investment",
                "org": "Palora Health"
              },
              {
                "t": "takeaways",
                "items": [
                  "Multi-channel, multi-touch communication dramatically outperforms annual-only approaches in perceived value and utilisation.",
                  "Lifecycle-aware communication meets employees when information is most relevant — not when HR finds it convenient to send.",
                  "Measure effectiveness on four dimensions: awareness, comprehension, satisfaction, and utilisation.",
                  "Communication investment generates returns from budget already spent — one of the highest-return actions in Total Rewards."
                ]
              }
            ],
            "article": 15
          },
          {
            "id": "4-2-Q",
            "title": "Module Quiz: Reward Communication",
            "duration": "5 min",
            "xp": 75,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Total Reward Statements, Manager Enablement, and Communication Calendars. Pass rate: 70% · 75 XP available."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "HR Analytics & Career Development",
    "subtitle": "Data-driven reward decisions and a career roadmap for future TR leaders",
    "color": "#5B4CC0",
    "color2": "#7B6DE0",
    "bg": "#0C2340",
    "icon": "◈",
    "level": "Advanced",
    "duration": "2–3 hours",
    "lessons_count": 6,
    "total_xp": 900,
    "desc": "Build the analytical capability to turn pay data into strategic insight — and the career development framework to grow as a Total Rewards professional who leads, not just administers.",
    "outcomes": [
      "Build and interpret a compensation analytics dashboard",
      "Model turnover cost to justify reward investment",
      "Apply predictive analytics to identify flight risk",
      "Design a structured personal development plan for a TR career",
      "Articulate the capabilities that define future TR leadership"
    ],
    "modules": [
      {
        "id": "5-1",
        "title": "Analytics for Total Rewards",
        "color": "#5B4CC0",
        "lessons": [
          {
            "id": "5-1-1",
            "title": "Essential C&B Metrics",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Define the six essential C&B metrics",
              "Build a compensation analytics dashboard",
              "Interpret metric trends to identify action priorities"
            ],
            "body": [
              {
                "t": "intro",
                "v": "The HR professional who presents a salary adjustment as a cost is easy to say no to. The one who presents it as an investment — with quantified return, risk model, and competitive context — is far harder to decline. The difference is analytics."
              },
              {
                "t": "h",
                "v": "The Six Essential Metrics"
              },
              {
                "t": "p",
                "v": "Average compa-ratio by grade and function is the primary market positioning indicator. Compa-ratio distribution (not just the average — the full spread) reveals compression, inequality, and structural ceiling issues that averages hide. Voluntary turnover rate by grade and performance band is the lagging indicator connecting pay positioning to talent outcomes."
              },
              {
                "t": "p",
                "v": "Merit differentiation ratio measures whether your merit process is genuinely differentiating performance or distributing a flat inflation adjustment. Adjusted pay equity gap tracked over time shows whether equity is improving or drifting between correction programmes. Benefits utilisation by type and segment reveals where programme investment is generating take-up and where it is generating only cost."
              },
              {
                "t": "box",
                "v": "The C&B Analytics Dashboard — six metrics:\n1. Average compa-ratio by grade and function\n2. Compa-ratio distribution (histogram, not mean)\n3. Voluntary turnover by grade and performance band\n4. Merit differentiation ratio (highest vs lowest category)\n5. Adjusted pay equity gap tracked quarterly\n6. Benefits utilisation by type and segment",
                "label": "The Six Essential Metrics"
              },
              {
                "t": "scenario",
                "v": "Meridian Group's quarterly dashboard flagged: average compa-ratio in Digital had declined from 0.94 to 0.88 over 18 months while voluntary turnover in Digital had risen from 8% to 17% annually. The team presented leadership with a single-slide analysis connecting these metrics to a £320K cost estimate for a targeted market adjustment. Leadership approved within two weeks — a decision that would have taken months without the analytical case.",
                "title": "Meridian's Analytics Decision",
                "org": "Meridian Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Six essential metrics: compa-ratio distribution, voluntary turnover by segment, merit differentiation, adjusted equity gap, benefits utilisation.",
                  "Distributions are more revealing than averages — compression at 0.84 is invisible when the average is 0.97.",
                  "Build dashboards that answer the questions leadership needs to act on — not just the metrics HR finds interesting.",
                  "Analytics without a recommended action is an observation. Strategic analytics professionals deliver decisions."
                ]
              }
            ],
            "article": 23
          },
          {
            "id": "5-1-2",
            "title": "Pay Equity Dashboard and Predictive Analytics",
            "duration": "6 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Build a pay equity monitoring dashboard",
              "Apply turnover cost modelling",
              "Identify flight risk using compensation data indicators"
            ],
            "body": [
              {
                "t": "intro",
                "v": "A pay equity audit produces a point-in-time snapshot. A pay equity dashboard provides continuous monitoring — turning equity from a periodic project into an ongoing governance discipline. And a turnover cost model turns reward investment from a cost conversation into an investment conversation."
              },
              {
                "t": "h",
                "v": "Pay Equity Dashboard Design"
              },
              {
                "t": "p",
                "v": "Track: adjusted pay gap by function, grade, and demographic over time (is it improving or worsening after corrections?); compa-ratio distribution by demographic group within each grade (are certain groups systematically positioned lower?); merit increase distribution by demographic group controlling for performance rating (are any groups consistently receiving lower increases?)."
              },
              {
                "t": "box",
                "v": "Dashboard design principles:\n• Show trends over time, not just point-in-time snapshots\n• Segment by function, grade, and demographic simultaneously\n• Include both gap size and number of employees affected\n• Flag significant changes automatically for review\n• Show actions taken and their measurable impact",
                "label": "Equity Dashboard Principles"
              },
              {
                "t": "h",
                "v": "Turnover Cost Modelling"
              },
              {
                "t": "p",
                "v": "Total turnover cost for professional roles typically ranges from 50 to 150 percent of annual salary — covering recruitment fees, onboarding investment, vacancy productivity loss, replacement learning curve, and knowledge loss. When this is quantified, the investment case for market adjustments, retention awards, or pay equity corrections becomes mathematically straightforward."
              },
              {
                "t": "scenario",
                "v": "Palora Health modelled three merit budget scenarios. The 4.5% scenario (£480K incremental) was presented alongside projected replacement costs from the additional 14 departures the 3% scenario would likely trigger: £1.62M. The 3.4x return on the higher budget made the investment case straightforward — and changed the conversation from 'can we afford this?' to 'can we afford not to?'",
                "title": "Palora's Budget Business Case",
                "org": "Palora Health"
              },
              {
                "t": "takeaways",
                "items": [
                  "A pay equity dashboard converts equity from a periodic project to an ongoing governance discipline.",
                  "Track adjusted gap trends over time — a worsening gap after a correction programme is an early warning signal.",
                  "Turnover cost for professional roles: typically 50-150% of annual salary — use this to frame reward investment as prevention.",
                  "Four flight risk indicators: below-target compa-ratio, high performance rating, stale salary, low engagement score."
                ]
              }
            ],
            "article": 23
          },
          {
            "id": "5-1-3",
            "title": "Communicating Analytics to Leadership",
            "duration": "5 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Lead with business implication not methodology",
              "Structure an analytics presentation for senior leaders",
              "Convert data findings into decisions"
            ],
            "body": [
              {
                "t": "intro",
                "v": "The most technically excellent analysis is worthless if it does not produce a decision. Analytics communication is as important as analytical quality — and the two skills are equally rarely combined."
              },
              {
                "t": "h",
                "v": "Lead With Business Implication"
              },
              {
                "t": "p",
                "v": "'We are projecting 14 additional Engineering departures over six months at a replacement cost of £490,000' changes the conversation faster than 'our average compa-ratio in Engineering Grade 4 is 0.87.' The data supports the implication — but the implication must come first, in language that a CFO who has never heard of compa-ratio can immediately understand."
              },
              {
                "t": "h",
                "v": "Three Principles of Analytics Communication"
              },
              {
                "t": "p",
                "v": "First: lead with the business implication, not the methodology. Second: give leaders a specific decision to make with a recommendation — not just information to note. Third: visualise wherever possible. A chart showing compa-ratio trends over three years communicates more quickly and more memorably than a table of the same data. Visualisation is not decoration — it is argument."
              },
              {
                "t": "box",
                "v": "Analytics presentation structure:\n1. The business implication (lead — what this means for the organization)\n2. The evidence (what the data shows, simply)\n3. The context (how it compares to target or prior periods)\n4. The recommendation (a specific decision you are asking leadership to make)\n5. The alternative (what happens if the recommendation is not taken)",
                "label": "The Five-Part Analytics Presentation"
              },
              {
                "t": "scenario",
                "v": "Meridian Group's C&B analyst presented the Digital compa-ratio decline. Original draft: 15 slides of compa-ratio distributions, regression outputs, and statistical significance tests. Revised version: one slide — 'Digital pay has declined relative to market by 7% over 18 months. We project 6-8 additional departures this year at a replacement cost of £420K-£560K. A targeted £275K market adjustment addresses 80% of the gap. Decision required: approve the adjustment in Q2 budget?' Approved in 48 hours.",
                "title": "Meridian's One-Slide Analysis",
                "org": "Meridian Group"
              },
              {
                "t": "takeaways",
                "items": [
                  "Lead with business implication — the financial and organizational impact — not the analytical methodology.",
                  "Structure: business implication → evidence → context → recommendation → consequence of inaction.",
                  "Visualisation is argument — charts communicate faster and more memorably than tables of equivalent data.",
                  "Give leaders a specific decision to make: analytics professionals who seek decisions get budgets approved; those who share information get data filed."
                ]
              }
            ],
            "article": 23
          },
          {
            "id": "5-1-Q",
            "title": "Module Quiz: Analytics for Total Rewards",
            "duration": "5 min",
            "xp": 75,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on C&B Metrics, Equity Dashboard Design, and Analytics Communication. Pass rate: 70% · 75 XP available."
              }
            ]
          }
        ]
      },
      {
        "id": "5-2",
        "title": "Building Your Total Rewards Career",
        "color": "#5B4CC0",
        "lessons": [
          {
            "id": "5-2-1",
            "title": "Transitioning into Total Rewards",
            "duration": "5 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Identify the skills required to enter the TR specialism",
              "Build a portfolio before the role change",
              "Plan a realistic transition timeline"
            ],
            "body": [
              {
                "t": "intro",
                "v": "Total Rewards is one of the most technically demanding and strategically valued HR specialisms — and one of the most accessible for generalists who invest deliberately in the right preparation. The transition is achievable, but it rewards a specific kind of effort: building evidence before you need it."
              },
              {
                "t": "h",
                "v": "The Three Skill Clusters"
              },
              {
                "t": "p",
                "v": "Technical foundations: salary structure design, market benchmarking methodology, incentive plan design, and benefits programme management. Analytical skills: Excel at intermediate-to-advanced level, comfort with percentiles and distributions, and the ability to build a financial model for a people investment. Advisory skills: translating complex compensation decisions into business language and building credibility with senior non-HR stakeholders."
              },
              {
                "t": "box",
                "v": "Portfolio projects you can complete before the role change:\n• Build a sample salary structure using publicly available market data\n• Run a mock pay equity analysis using anonymised organization data\n• Design a case-study incentive plan for a fictional company\n• Build a one-page turnover cost model with a merit investment ROI calculation\n• Analyse compa-ratio distribution from accessible salary data\n\nEach becomes evidence you can describe in an interview.",
                "label": "Pre-Role-Change Portfolio Projects"
              },
              {
                "t": "h",
                "v": "Making the Move"
              },
              {
                "t": "p",
                "v": "Most successful transitions begin with volunteering — taking on a C&B task within your current HR role. Annual merit review coordination, benefits renewal support, and salary benchmarking assistance all provide real exposure and visible portfolio output. The formal role change typically follows 12-18 months of deliberate exposure and structured learning."
              },
              {
                "t": "scenario",
                "v": "Taiwo volunteered for the merit review coordination in her HR Generalist role. Over 18 months she completed Rewardology Academy courses, built a sample salary structure, and taught herself Power BI for visualisation. When a C&B Manager role opened internally, she was hired ahead of external C&B candidates because her portfolio demonstrated she could already do the work. She was promoted to Head of Reward 18 months later.",
                "title": "Taiwo's Transition Story",
                "org": "Fictional Example"
              },
              {
                "t": "takeaways",
                "items": [
                  "Technical, analytical, and advisory skills must all be deliberately built — they are not developed in generalist roles by default.",
                  "Portfolio projects — sample structures, mock analyses, case-study incentive plans — are the most effective interview preparation.",
                  "Most transitions begin with volunteering on compensation work within an existing HR role.",
                  "The formal role change follows 12-18 months of deliberate exposure — not the other way around."
                ]
              }
            ],
            "article": 12
          },
          {
            "id": "5-2-2",
            "title": "The Future Total Rewards Professional",
            "duration": "5 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Understand how the TR role is evolving",
              "Identify the skills that differentiate future TR leaders",
              "Plan capability development across all three dimensions"
            ],
            "body": [
              {
                "t": "intro",
                "v": "The Total Rewards role is at an inflection point. Regulatory expansion, data proliferation, AI tools, and rising workforce expectations are simultaneously making the specialism more complex, more visible, and more strategically important. Those who thrive will develop across three dimensions: technical depth, analytical sophistication, and genuine human capability."
              },
              {
                "t": "h",
                "v": "How the Role Is Evolving"
              },
              {
                "t": "p",
                "v": "A decade ago, C&B was primarily administrative and technical: run the merit cycle, manage benefits renewal, benchmark salaries annually. These remain necessary — but they are no longer sufficient as a definition of the role's strategic value. Today's senior TR professionals advise on M&A reward integration, build the business case for equity governance, present to RemCos, and navigate complex multi-jurisdiction regulatory environments."
              },
              {
                "t": "box",
                "v": "The value shift in Total Rewards:\nPast → accurate administration and technical compliance\nPresent → data-driven analysis and operational excellence\nFuture → strategic advisory, predictive insight, and measurable business impact\n\nAll three levels are required in 2026. The question is where you spend most of your time — and whether your analytical and advisory skills match your technical depth.",
                "label": "The Value Shift"
              },
              {
                "t": "h",
                "v": "The Human Skills That Matter Most"
              },
              {
                "t": "p",
                "v": "As analytical tools become more powerful, the human capabilities that differentiate exceptional C&B professionals become more, not less, important. Empathy — understanding the employee perspective on pay decisions. Ethical judgment — navigating the power asymmetries inherent in pay. Communication — translating complexity into language that builds trust rather than anxiety. These cannot be automated or outsourced."
              },
              {
                "t": "scenario",
                "v": "Taiwo and James both started as C&B Analysts in 2018. Six years on, Taiwo is Head of Global Reward at a listed company; James is a Senior C&B Analyst. Differentiators: Taiwo built Python and Power BI skills, joined the M&A integration team, presented to the RemCo, spent six months in an HRBP role. James deepened technical expertise but stayed within C&B team, avoiding exposure that felt uncomfortable. Neither path is wrong — but senior reward leadership requires the breadth Taiwo deliberately pursued.",
                "title": "Two Paths from the Same Start",
                "org": "Fictional Comparison"
              },
              {
                "t": "takeaways",
                "items": [
                  "The TR role has shifted from technical administration to strategic advisory — both are now required.",
                  "Analytics capability is the fastest-growing differentiator: from descriptive reporting to predictive and prescriptive insight.",
                  "Human skills — empathy, ethical judgment, clear communication — are the non-automatable core of future TR leadership.",
                  "Breadth (business partnership, cross-functional exposure, advisory capability) now matters as much as technical depth."
                ]
              }
            ],
            "article": 25
          },
          {
            "id": "5-2-3",
            "title": "Building Your TR Portfolio and Development Plan",
            "duration": "5 min",
            "xp": 75,
            "type": "lesson",
            "objectives": [
              "Design a structured 12-month development plan",
              "Identify the most valuable portfolio projects to prioritise",
              "Build visibility for your analytical work with senior stakeholders"
            ],
            "body": [
              {
                "t": "intro",
                "v": "The professionals who accelerate fastest in Total Rewards treat their career as a portfolio to be built — not a role to be performed. Each project, each presentation, each analytical output is evidence of capability that compounds over time."
              },
              {
                "t": "h",
                "v": "The T-Shaped Profile"
              },
              {
                "t": "p",
                "v": "The most effective C&B professionals are T-shaped: deep expertise in technical and analytical foundations, combined with broad business understanding, communication capability, and strategic orientation. Building both depth and breadth is the deliberate work of a 5-10 year career — not something that happens by performing a standard role description."
              },
              {
                "t": "box",
                "v": "12-month capability development framework:\n1. Technical: complete one structured C&B qualification or course series\n2. Analytics: build one new capability (Power BI, pay equity model, turnover cost model)\n3. Strategic: seek one cross-functional project exposure (M&A, strategy, finance)\n4. Communication: present one C&B analysis to a senior leadership audience\n5. Advisory: find one external mentor from the C&B professional community\n\nCommit to all five. Completing three of five will produce measurable career progress.",
                "label": "12-Month Development Framework"
              },
              {
                "t": "h",
                "v": "Making Your Work Visible"
              },
              {
                "t": "p",
                "v": "The fastest career developers in C&B are those whose analytical work becomes visible to senior decision-makers. Presenting a market competitiveness analysis at a leadership meeting. Writing a one-page equity insight for the HR Director. Building a dashboard the CFO actually uses. Invisible excellent work does not accelerate careers in the way that visible analytical output does."
              },
              {
                "t": "scenario",
                "v": "Six months after completing Rewardology Academy courses, participant data shows that professionals who implemented at least three of the five framework actions were 2.4x more likely to secure a career advancement within 12 months than those who completed courses without implementation. Knowledge compounds when applied. The portfolio is built one project, one presentation, one analysis at a time.",
                "title": "From Learning to Advancement",
                "org": "Rewardology Academy"
              },
              {
                "t": "takeaways",
                "items": [
                  "The T-shaped profile: deep technical and analytical expertise + broad business, communication, and strategic capability.",
                  "12-month framework: qualification, new analytical skill, cross-functional exposure, senior presentation, external mentorship.",
                  "Visibility of analytical work accelerates career development — make your best work visible to decision-makers.",
                  "Knowledge compounds when applied. Completing this course is the beginning — the portfolio is what produces career change."
                ]
              }
            ],
            "article": 25
          },
          {
            "id": "5-2-Q",
            "title": "Module Quiz: Building Your TR Career",
            "duration": "5 min",
            "xp": 75,
            "type": "quiz",
            "body": [
              {
                "t": "quiz_intro",
                "v": "10 questions on Transitioning into TR, Future TR Professional, and Portfolio Development. Pass rate: 70% · 75 XP available."
              }
            ]
          }
        ]
      }
    ]
  }
];

export function allLessons(course: Course): { lesson: CourseLesson; mod: CourseModule }[] {
  const out: { lesson: CourseLesson; mod: CourseModule }[] = [];
  course.modules.forEach((m) => m.lessons.forEach((l) => out.push({ lesson: l, mod: m })));
  return out;
}

export function findLesson(courseId: number, lessonId: string) {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, mod, lesson };
  }
  return null;
}
