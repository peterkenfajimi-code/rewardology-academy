export type CourseBlock = {
  t: "intro" | "h" | "p" | "box" | "scenario" | "takeaways";
  v?: string | string[];
  label?: string;
  title?: string;
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
    id: 1,
    title: "Total Rewards Foundations",
    subtitle: "Your complete introduction to the world of Total Rewards",
    color: "#C8963E",
    color2: "#E2AC50",
    bg: "#0C2340",
    icon: "◈",
    level: "Beginner",
    duration: "3–4 hours",
    lessons_count: 8,
    total_xp: 1200,
    desc: "Learn what Total Rewards really means, how compensation and benefits work together, and why the best HR professionals think in systems — not silos.",
    outcomes: [
      "Define Total Rewards and explain its five core pillars",
      "Distinguish between base pay, variable pay, and total cash compensation",
      "Describe how employee benefits protect and support the workforce",
      "Explain the role of wellbeing, recognition, and career development in a reward strategy",
      "Apply a Total Rewards lens to evaluate an organization's employee value proposition",
    ],
    modules: [
      {
        id: "1-1",
        title: "Introduction to Total Rewards",
        color: "#C8963E",
        lessons: [
          {
            id: "1-1-1",
            title: "What Total Rewards Means",
            duration: "8 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define Total Rewards in your own words",
              "Understand why Total Rewards goes beyond salary",
              "Recognise the difference between financial and non-financial rewards",
            ],
            body: [
              { t: "intro", v: "When most people hear the word 'rewards,' they think about pay. But the professionals who build reward systems know that pay is only one part of a much larger picture — and often not the most powerful part." },
              { t: "h", v: "The Full Definition" },
              { t: "p", v: "Total Rewards refers to the complete set of financial and non-financial value that an organization provides to its employees in exchange for their time, skills, effort, and contribution. It is the organization's answer to a fundamental employee question: 'Why should I give my best here?'" },
              { t: "p", v: "A payslip answers part of that question. But employees also ask about security, growth, belonging, flexibility, recognition, and purpose. Total Rewards is the framework that helps organizations design intentional answers to all of those questions — not just the financial ones." },
              { t: "box", label: "Key Concept", v: "Total Rewards = Financial rewards (pay, bonuses, benefits) + Non-financial rewards (recognition, career growth, flexibility, culture, wellbeing)" },
              { t: "h", v: "Why This Matters for HR Professionals" },
              { t: "p", v: "Organizations that think about rewards narrowly — as salary and benefits only — often struggle to understand why highly paid employees leave, or why teams with average pay show exceptional engagement. The answer is almost always found in the non-financial dimensions: recognition, growth, and wellbeing." },
              { t: "scenario", label: "Scenario", title: "Nova Tech's Retention Problem", v: "Nova Tech is losing mid-level engineers despite paying market-rate salaries. Exit interviews reveal engineers feel underappreciated, see no clear promotion path, and find the environment stressful. From a Total Rewards perspective, Nova Tech does not have a compensation problem — it has a recognition, career development, and wellbeing problem. Increasing salary alone would not solve it." },
              { t: "takeaways", v: ["Total Rewards is the complete financial and non-financial value employees receive.", "Salary attracts people; the full rewards experience keeps them and drives their best performance.", "HR professionals who understand Total Rewards can solve problems that salary increases alone cannot."] },
            ],
            quiz: { q: "A colleague says: 'Our salary is competitive, so our Total Rewards must be strong.' What is the most accurate response?", opts: ["Agree — salary is the most important part of Total Rewards.", "Disagree — Total Rewards includes non-financial elements like recognition, wellbeing, and career growth that salary alone cannot represent.", "Agree — if salary is competitive, employees will always be satisfied.", "Disagree — Total Rewards only includes legally required benefits."], ans: 1, exp: "Competitive salary is important, but Total Rewards is a broader concept that includes wellbeing, recognition, career development, flexibility, and work experience." },
          },
          {
            id: "1-1-2",
            title: "The Five Pillars of Total Rewards",
            duration: "10 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Name and describe all five pillars of Total Rewards",
              "Explain what belongs within each pillar",
              "Understand how the pillars work together as a system",
            ],
            body: [
              { t: "intro", v: "Total Rewards is represented as five interconnected pillars. Together, they create an employee experience that is greater than any single element alone. Understanding each pillar — and how they relate — is the foundation of professional reward design." },
              { t: "h", v: "Pillar 1: Compensation" },
              { t: "p", v: "Compensation is all direct financial pay provided in exchange for work. It includes base salary, hourly wages, shift allowances, bonuses, commissions, profit sharing, and long-term incentives such as equity awards." },
              { t: "box", label: "Pillar 1", v: "Compensation → Base pay · Variable pay · Incentives · Equity · Allowances" },
              { t: "h", v: "Pillar 2: Benefits" },
              { t: "p", v: "Benefits are indirect rewards that protect employees and support their quality of life. Health insurance, retirement plans, paid leave, life insurance, disability coverage, parental leave, and employee assistance programs all fall here." },
              { t: "box", label: "Pillar 2", v: "Benefits → Health cover · Retirement · Paid leave · Life insurance · Wellbeing programs" },
              { t: "h", v: "Pillar 3: Wellbeing" },
              { t: "p", v: "Wellbeing extends beyond traditional benefits to encompass physical, mental, financial, and social health. It includes mental health programs, stress management, financial education, ergonomic workplaces, and social connection initiatives." },
              { t: "box", label: "Pillar 3", v: "Wellbeing → Physical · Mental · Financial · Social" },
              { t: "h", v: "Pillar 4: Recognition" },
              { t: "p", v: "Recognition is the acknowledgment of employee contribution, effort, achievement, or behavior. It can be formal — structured awards, service milestones — or informal: a sincere thank-you, a manager's acknowledgment in a meeting." },
              { t: "box", label: "Pillar 4", v: "Recognition → Formal awards · Peer recognition · Manager appreciation · Milestone programs" },
              { t: "h", v: "Pillar 5: Career Development" },
              { t: "p", v: "Career development rewards employees' investment in growth. It includes learning programs, mentoring, job rotation, promotion pathways, leadership development, and skills-building resources." },
              { t: "box", label: "Pillar 5", v: "Career Development → Learning · Mentoring · Promotion paths · Skills programs · Leadership opportunities" },
              { t: "scenario", label: "Putting It Together", title: "Designing for a Diverse Workforce", v: "Meridian Bank has a workforce spanning three generations. Graduate recruits rank career development and mental health support highest. Mid-career managers prioritise compensation, flexibility, and health benefits. Senior leaders value recognition, retirement security, and meaningful work. A strong Total Rewards strategy addresses all five pillars — weighted differently by workforce segment." },
              { t: "takeaways", v: ["The five pillars are: Compensation, Benefits, Wellbeing, Recognition, and Career Development.", "Each pillar meets different employee needs — financial security, health, growth, meaning, and appreciation.", "Effective reward design requires intentional decisions across all five pillars, not just pay."] },
            ],
            quiz: { q: "Which of the five pillars would a mental health support program most directly belong to?", opts: ["Compensation", "Benefits", "Wellbeing", "Recognition"], ans: 2, exp: "Mental health programs support physical, mental, financial, and social health — this is the Wellbeing pillar." },
          },
          {
            id: "1-1-3",
            title: "The Employee Value Proposition",
            duration: "9 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define the Employee Value Proposition (EVP)",
              "Explain how Total Rewards makes the EVP tangible",
              "Identify signs of a weak EVP-rewards connection",
            ],
            body: [
              { t: "intro", v: "Every organization makes an implicit promise to its employees: 'Here is what you will experience and receive in return for your contribution.' The Employee Value Proposition — or EVP — is that promise made explicit. And Total Rewards is what makes the promise real." },
              { t: "h", v: "What Is the EVP?" },
              { t: "p", v: "The Employee Value Proposition is the full package of reasons why a talented person would choose to join, stay, and give their best to an organization. It communicates not just what employees will be paid, but what they will experience: the culture, the growth, the leadership, the work itself, and the recognition they will receive." },
              { t: "box", label: "EVP Formula", v: "EVP = What the organization promises employees it will deliver in exchange for their contribution — backed by real reward programs, culture, and experience." },
              { t: "h", v: "How Total Rewards Brings the EVP to Life" },
              { t: "p", v: "An EVP without a reward system to support it is marketing. An organization may say it values work-life balance, but if the benefits program offers no flexible working, the EVP is hollow. Total Rewards is the operational backbone of the EVP — every compensation decision, benefit design, wellbeing initiative, and recognition moment either strengthens or weakens the promise." },
              { t: "scenario", label: "Case Study", title: "When the EVP and Rewards Disconnect", v: "Greenfield Capital marketed itself as 'a place where high performers are recognised and rewarded.' But its bonus plan hadn't been updated in five years, its recognition program had almost no participation, and promotion rates were low. New talent joined expecting the EVP — and quickly discovered the reality. Turnover within 18 months ran at 35%. The fix required aligning reward programs with the EVP promise." },
              { t: "takeaways", v: ["The EVP is the organization's promise to employees about what they will receive and experience.", "Total Rewards operationalises that promise through real programs and decisions.", "A gap between EVP claims and reward reality destroys trust and drives turnover."] },
            ],
            quiz: { q: "A company's EVP claims it 'develops future leaders,' but it has no formal learning programs and rarely promotes internally. What does this indicate?", opts: ["A strong EVP that just needs better communication.", "A well-designed reward strategy.", "A disconnect between the EVP promise and the actual Total Rewards experience.", "Evidence that career development is not important to employees."], ans: 2, exp: "When an organization's EVP claims do not match its actual reward programs and practices, there is a credibility gap that erodes trust, engagement, and retention." },
          },
          {
            id: "1-1-Q",
            title: "Module Quiz: Introduction to Total Rewards",
            duration: "5 min",
            xp: 150,
            type: "quiz",
            quiz_questions: [
              { q: "What is the most accurate definition of Total Rewards?", opts: ["Salary and bonus payments only.", "The full financial and non-financial value employees receive from work.", "A benefits enrollment form.", "A performance management system."], ans: 1, exp: "Total Rewards is the complete package of financial and non-financial value — including pay, benefits, wellbeing, recognition, and career development." },
              { q: "Which of the five pillars focuses on acknowledging employee contribution and effort?", opts: ["Compensation", "Benefits", "Wellbeing", "Recognition"], ans: 3, exp: "Recognition is dedicated to acknowledging and appreciating employees for their contributions, behaviors, and achievements." },
              { q: "What does the Employee Value Proposition (EVP) represent?", opts: ["The annual payroll budget.", "The organization's complete promise of value to employees in exchange for their contribution.", "A salary survey report.", "A legal employment contract."], ans: 1, exp: "The EVP is the full set of reasons why a talented person would join, stay, and give their best to an organization." },
              { q: "Nova Tech pays competitive salaries but has very high turnover. Which Total Rewards area is most likely underdeveloped?", opts: ["Compensation", "Non-financial rewards such as recognition, wellbeing, and career development", "Payroll administration", "Market benchmarking"], ans: 1, exp: "High turnover despite competitive pay strongly suggests deficiencies in non-financial rewards." },
              { q: "Which statement best describes a strong Total Rewards strategy?", opts: ["Pay the highest salary in the market.", "Design pay, benefits, wellbeing, recognition, and career programs that align with workforce needs and business goals.", "Focus only on legally required benefits.", "Let each manager decide rewards independently."], ans: 1, exp: "A strong Total Rewards strategy is holistic, intentional, and aligned — addressing all five pillars in service of both employee and business needs." },
            ],
          },
        ],
      },
      {
        id: "1-2",
        title: "Compensation Fundamentals",
        color: "#2E7D8C",
        lessons: [
          {
            id: "1-2-1",
            title: "Base Pay Explained",
            duration: "9 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define base pay and explain its purpose",
              "Understand how base pay is structured and positioned",
              "Recognise the difference between base pay and total cash",
            ],
            body: [
              { t: "intro", v: "Base pay is the foundation of every employee's compensation. It is predictable, contractual, and the benchmark against which all other pay is measured. Understanding base pay — what it is, how it is set, and why it matters — is the starting point for any compensation professional." },
              { t: "h", v: "What Is Base Pay?" },
              { t: "p", v: "Base pay is the fixed, regular payment an employee receives for performing their job. It does not vary with individual performance in the short term. This predictability is deliberate — base pay provides financial stability and represents the organization's view of the value of the role." },
              { t: "p", v: "Base pay is expressed as an annual salary for most professional and managerial roles, and as an hourly rate for hourly and shift workers. Both forms have the same essential purpose: to establish a reliable income floor." },
              { t: "box", label: "Base Pay", v: "Fixed · Contractual · Role-based · Paid regardless of short-term results · The foundation of total compensation" },
              { t: "h", v: "How Is Base Pay Determined?" },
              { t: "p", v: "In well-run organizations, base pay is determined through three inputs: (1) job evaluation — assessing the internal value of the role; (2) market pricing — comparing the role to external salary data; and (3) salary structure — the organization's defined pay ranges that translate job levels into compensation bands." },
              { t: "scenario", label: "In Practice", title: "Setting Base Pay at Almont Solutions", v: "Almont Solutions is hiring a Senior HR Analyst. Job evaluation places the role at Grade 4. Market data shows the median is $78,000. Their Grade 4 range runs from $68,000 to $94,000, midpoint $81,000. A candidate with 4 years of experience receives $76,000 — below midpoint, reflecting solid but not extensive experience. A candidate with 8 years and a specialist certification receives $83,000 — above midpoint, reflecting premium skills." },
              { t: "h", v: "Base Pay vs Total Cash" },
              { t: "p", v: "Total cash includes base pay plus any cash variable elements: bonuses, commissions, allowances, and incentive payments. When reviewing pay competitiveness, always specify which figure you are comparing — the difference can be substantial." },
              { t: "takeaways", v: ["Base pay is fixed, contractual compensation for performing a role.", "It is determined by job value, market data, and salary structure — with individual factors influencing range positioning.", "Base pay is the foundation of total cash, which also includes variable and incentive elements."] },
            ],
            quiz: { q: "An employee's annual salary is $70,000. They also receive a $10,000 performance bonus. What is their base pay?", opts: ["$80,000", "$70,000", "$10,000", "It depends on their job grade."], ans: 1, exp: "Base pay is the fixed salary — $70,000. The bonus is variable pay. Together they make up total cash of $80,000, but base pay alone is $70,000." },
          },
          {
            id: "1-2-2",
            title: "Variable Pay & Incentives",
            duration: "10 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define variable pay and name its main forms",
              "Explain what makes an effective incentive plan",
              "Understand the concept of line of sight",
            ],
            body: [
              { t: "intro", v: "While base pay rewards the role, variable pay rewards the result. It is the part of compensation that flexes — rising when performance is strong, reducing when it is not. For organizations, variable pay is one of the most powerful tools in the compensation toolkit." },
              { t: "h", v: "What Is Variable Pay?" },
              { t: "p", v: "Variable pay is compensation that changes based on performance, results, or defined outcomes. Unlike base pay, it is not guaranteed. It must be earned against targets, thresholds, or conditions set in advance." },
              { t: "p", v: "Variable pay takes many forms: annual bonuses, sales commissions, profit-sharing, spot awards, and long-term incentives such as equity awards or deferred bonuses." },
              { t: "box", label: "Forms of Variable Pay", v: "Annual bonus · Sales commission · Profit sharing · Spot awards · Long-term incentives (equity, deferred bonus) · Gainsharing" },
              { t: "h", v: "What Makes an Effective Incentive Plan?" },
              { t: "p", v: "Effective plans share four characteristics: (1) Clarity — employees understand exactly what they need to do to earn the incentive. (2) Measurability — performance can be tracked objectively. (3) Achievability — targets are challenging but realistic. (4) Alignment — the plan rewards behaviors and results that actually matter to the business." },
              { t: "scenario", label: "Key Concept", title: "Line of Sight", v: "Line of sight is the degree to which an employee can connect their day-to-day actions to the incentive outcome. A customer service agent whose bonus is linked to company-wide profit has low line of sight. The same agent whose bonus is linked to their individual customer satisfaction score has strong line of sight — they understand exactly how their work affects their reward." },
              { t: "takeaways", v: ["Variable pay rewards performance and results, and must be earned — it is not guaranteed.", "Effective incentive plans are clear, measurable, achievable, and aligned to business goals.", "Line of sight — the employee's ability to connect their actions to the incentive — is critical to motivation."] },
            ],
            quiz: { q: "What does 'line of sight' mean in the context of incentive design?", opts: ["The ability for a manager to observe their team at work.", "The degree to which an employee can connect their actions to the incentive outcome.", "The distance between the minimum and maximum of a salary range.", "The process of publishing salary grades internally."], ans: 1, exp: "Line of sight refers to how clearly an employee can see the connection between their individual work and the incentive they may earn. High line of sight is essential for motivation." },
          },
          {
            id: "1-2-3",
            title: "Total Cash & Pay Equity",
            duration: "9 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Understand total cash compensation and how it is calculated",
              "Define pay equity and explain why it matters",
              "Identify common sources of pay inequity",
            ],
            body: [
              { t: "intro", v: "Compensation professionals need two frameworks running simultaneously: one that measures the totality of pay (total cash), and one that evaluates whether pay is fair (pay equity). Both are essential for making good reward decisions and building workforce trust." },
              { t: "h", v: "Total Cash Compensation" },
              { t: "p", v: "Total cash compensation is the sum of all cash pay elements an employee receives: base salary plus any cash variable pay. It gives a more complete picture than base pay alone — especially for roles where incentives make up a significant portion of annual earnings." },
              { t: "box", label: "Formula", v: "Total Cash = Base Pay + Variable Cash (bonuses + commissions + allowances + other cash incentives)" },
              { t: "h", v: "What Is Pay Equity?" },
              { t: "p", v: "Pay equity is the principle that employees should receive fair pay for comparable work — with differences explained by legitimate factors such as role complexity, skills, experience, performance, and market value. It does not mean everyone must be paid identically; it means differences should be explainable and free from unfair bias." },
              { t: "scenario", label: "Common Sources of Inequity", title: "How Pay Gaps Develop", v: "Pay inequity rarely happens through dramatic decisions. It accumulates through small, inconsistent choices: a hiring offer negotiated above the range, a merit increase applied differently across teams, a promotion without a pay review. Over years, these decisions compound into meaningful gaps that are hard to explain and difficult to correct." },
              { t: "h", v: "Why Pay Equity Matters" },
              { t: "p", v: "Employees who believe they are paid unfairly disengage, underperform, and eventually leave. Organizations with strong pay equity cultures report higher trust scores, better engagement, and lower turnover. Increasingly, pay equity is also a legal concern — many jurisdictions require pay gap reporting." },
              { t: "takeaways", v: ["Total cash = base pay + all cash variable pay — always compare like-for-like when benchmarking.", "Pay equity means pay differences are fair, explainable, and free from bias.", "Pay inequity usually accumulates through small, inconsistent decisions over time — governance prevents it."] },
            ],
            quiz: { q: "An employee earns a base salary of $65,000 and receives a $8,000 annual bonus and a $2,000 transport allowance. What is their total cash compensation?", opts: ["$65,000", "$73,000", "$75,000", "$67,000"], ans: 2, exp: "Total cash = base pay ($65,000) + bonus ($8,000) + allowance ($2,000) = $75,000." },
          },
          {
            id: "1-2-Q",
            title: "Module Quiz: Compensation Fundamentals",
            duration: "5 min",
            xp: 150,
            type: "quiz",
            quiz_questions: [
              { q: "Which statement best describes base pay?", opts: ["Variable compensation that changes with performance.", "Fixed, contractual compensation for performing a role.", "A one-time payment for exceptional results.", "Only the employer's pension contribution."], ans: 1, exp: "Base pay is fixed, regular, and contractual — it does not change based on individual performance in the short term." },
              { q: "An employee earns $60,000 base salary and a $12,000 annual bonus. What is their total cash compensation?", opts: ["$60,000", "$12,000", "$72,000", "$48,000"], ans: 2, exp: "Total cash = base pay + variable cash = $60,000 + $12,000 = $72,000." },
              { q: "What does line of sight mean in incentive design?", opts: ["How far a manager can see the employee's desk.", "The employee's ability to connect their actions to the incentive outcome.", "The distance between minimum and maximum salary.", "A reporting structure in HR."], ans: 1, exp: "Line of sight is critical to incentive motivation — employees must see how their work directly affects their potential reward." },
              { q: "Which of the following is the most common cause of pay inequity?", opts: ["A formal salary structure with defined ranges.", "Regular market benchmarking.", "Small, inconsistent pay decisions that accumulate over time.", "A documented merit increase policy."], ans: 2, exp: "Pay gaps usually develop gradually through inconsistent decisions: uneven hiring offers, unsystematic merit increases, and promotions without pay reviews." },
              { q: "When benchmarking pay, why is it important to compare like-for-like data?", opts: ["It is a legal requirement in all countries.", "Comparing base pay against total cash — or vice versa — produces misleading conclusions.", "All compensation data is identical regardless of definition.", "Market surveys always define pay in the same way."], ans: 1, exp: "Different compensation elements can vary significantly. Mixing definitions in benchmarking leads to incorrect competitive positioning." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Compensation & Benefits Essentials",
    subtitle: "Practical skills in salary structures, market pricing, and benefits design",
    color: "#2E7D8C",
    color2: "#0E8A82",
    bg: "#071C22",
    icon: "◉",
    level: "Beginner",
    duration: "4–5 hours",
    lessons_count: 8,
    total_xp: 1200,
    desc: "Go deeper into the technical and strategic sides of Compensation & Benefits. Learn how salary structures work, how to use market data, how to design benefits employees value, and how incentive plans succeed or fail.",
    outcomes: [
      "Explain the purpose of salary grades and ranges in pay design",
      "Read and interpret basic salary survey data",
      "Design the framework for a basic benefits strategy",
      "Describe what makes an incentive plan effective or ineffective",
      "Apply market pricing and internal equity thinking to real pay decisions",
    ],
    modules: [
      {
        id: "2-1",
        title: "Introduction to C&B",
        color: "#2E7D8C",
        lessons: [
          {
            id: "2-1-1",
            title: "What C&B Covers",
            duration: "8 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define the Compensation & Benefits function",
              "Understand the full scope of C&B work",
              "Distinguish C&B from broader HR functions",
            ],
            body: [
              { t: "intro", v: "Compensation & Benefits — often abbreviated to C&B — is the specialist HR function responsible for designing, managing, and governing an organization's pay and reward programs. It sits at the intersection of business strategy, finance, people management, and data analysis." },
              { t: "h", v: "The Scope of C&B" },
              { t: "p", v: "C&B covers a wide range of responsibilities. On the compensation side: salary structure design, job evaluation, market pricing, incentive plan design, executive remuneration, merit review cycles, and pay equity analysis. On the benefits side: health and insurance programs, retirement plans, leave administration, wellness programs, vendor management, and enrollment communications." },
              { t: "box", label: "C&B Scope", v: "Compensation: pay structures · job evaluation · market pricing · incentives · pay equity · executive pay\nBenefits: health insurance · retirement · leave · wellness · vendor management · enrollment" },
              { t: "h", v: "How C&B Connects to the Business" },
              { t: "p", v: "C&B is not an administrative function — it is a strategic one. Pay and benefits represent one of the largest cost lines in most organizations, often 60–70% of total operating costs for professional services firms. Every C&B decision has a financial impact, a talent impact, and a culture impact." },
              { t: "scenario", label: "In Context", title: "C&B at a Growing Company", v: "Palora Health has grown from 50 to 400 employees in three years. Early on, pay decisions were informal and negotiation-driven. Now, inconsistencies have created compression issues, equity concerns, and manager frustration. Palora's first dedicated C&B hire must build salary structures from scratch, run a pay equity audit, redesign the bonus plan, and create a benefits enrollment framework — all in year one." },
              { t: "takeaways", v: ["C&B covers salary structures, market pricing, incentives, benefits, and reward governance.", "It is a strategic function — pay and benefits are among the largest cost lines in any organization.", "C&B professionals translate data and reward principles into decisions that affect every employee."] },
            ],
            quiz: { q: "Which of the following is most accurately described as a Compensation & Benefits responsibility?", opts: ["Recruiting candidates for open roles.", "Designing salary grades and running pay equity analysis.", "Managing employee disciplinary procedures.", "Coordinating workplace health and safety."], ans: 1, exp: "Designing salary grades and running pay equity analysis are core C&B responsibilities. Recruiting, disciplinary management, and health & safety sit in other HR functions." },
          },
          {
            id: "2-1-2",
            title: "The Role of a C&B Professional",
            duration: "9 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Understand the day-to-day work of a C&B professional",
              "Identify the key skills required in C&B roles",
              "Understand career pathways into C&B",
            ],
            body: [
              { t: "intro", v: "What does a Compensation & Benefits professional actually do? The answer varies by organization size and seniority, but the through-line is consistent: C&B professionals analyse data, design systems, advise stakeholders, and ensure reward decisions are fair, competitive, and defensible." },
              { t: "h", v: "Day-to-Day Responsibilities" },
              { t: "p", v: "At the analyst level, C&B work is largely data-driven. A typical week might include: running salary benchmarking on a group of roles, supporting the annual merit review cycle by preparing manager guidelines, reviewing job descriptions to assess grade appropriateness, and responding to pay queries from HR business partners." },
              { t: "p", v: "At more senior levels, the work becomes more strategic and advisory: designing a new incentive plan for a business unit, presenting a pay equity analysis to the executive team, building a business case for a benefits enhancement, or advising on how to harmonise two pay structures in a merger." },
              { t: "box", label: "Core C&B Activities", v: "Salary benchmarking · Merit review support · Job evaluation · Benefits administration · Pay equity review · Incentive plan design · Manager and leader advisory" },
              { t: "h", v: "Key Skills for C&B Success" },
              { t: "p", v: "Strong Excel skills are baseline. Comfort with data, percentiles, regression analysis, and statistical interpretation are increasingly important. But C&B professionals must also communicate complex ideas simply, navigate politically sensitive pay conversations with discretion, and earn trust with managers who may resist pay governance." },
              { t: "scenario", label: "Skills in Practice", title: "The Annual Pay Review", v: "Every April, Kestrel Group runs its annual merit review. The C&B analyst prepares a data pack showing every employee's compa-ratio, performance rating, last increase date, and recommended range. They build guidelines for 200 managers, check every recommendation against policy, flag anomalies, and escalate exceptions for approval. The cycle requires analytical precision, clear written communication, and the ability to push back diplomatically." },
              { t: "takeaways", v: ["C&B analysts work with salary data, benchmarking, merit reviews, and job evaluation day to day.", "Key skills include data analysis, clear communication, discretion, and ethical judgment.", "Entry into C&B typically comes from HR generalist, finance, or analytics backgrounds."] },
            ],
            quiz: { q: "Which skill set is most important for an entry-level C&B analyst?", opts: ["Recruitment and interviewing skills.", "Data analysis, salary benchmarking, and clear communication.", "Performance coaching and employee counselling.", "Workplace health and safety compliance."], ans: 1, exp: "C&B analysts work primarily with pay data, salary surveys, and compensation models. Data analysis and communication are the foundational skills." },
          },
          {
            id: "2-1-Q",
            title: "Module Quiz: Introduction to C&B",
            duration: "5 min",
            xp: 150,
            type: "quiz",
            quiz_questions: [
              { q: "What is the primary focus of the Compensation & Benefits function?", opts: ["Managing employee recruitment and selection.", "Designing and governing pay, incentive, and benefits programs.", "Handling employee relations and disciplinary issues.", "Coordinating learning and development programs."], ans: 1, exp: "C&B designs and manages salary structures, incentives, benefits plans, and reward governance." },
              { q: "Why is C&B considered a strategic HR function rather than just administrative?", opts: ["Because it involves filling in payroll forms.", "Because pay and benefits affect business cost, talent decisions, and culture.", "Because C&B professionals attend leadership meetings.", "Because it is legally required."], ans: 1, exp: "C&B decisions directly affect the organization's largest cost lines, talent attraction and retention, and the culture employees experience." },
              { q: "Which of the following is a core day-to-day responsibility of a C&B analyst?", opts: ["Interviewing candidates for open roles.", "Running salary benchmarking and supporting merit reviews.", "Delivering leadership coaching programs.", "Managing office facilities."], ans: 1, exp: "Salary benchmarking and merit review support are central analyst-level C&B responsibilities." },
              { q: "What combination of skills is most valued in a C&B professional?", opts: ["Creative writing and event management.", "Data analysis, market knowledge, communication, and ethical judgment.", "Social media management and branding.", "Supply chain and logistics expertise."], ans: 1, exp: "C&B professionals need technical skills (data, benchmarking) combined with communication, discretion, and ethical judgment." },
              { q: "Which background is most commonly associated with entering a C&B career?", opts: ["Marketing and brand management.", "HR generalist, finance, or data analytics roles.", "Customer service operations.", "Legal and compliance roles."], ans: 1, exp: "Most C&B professionals come from HR generalist, finance, or analytical backgrounds." },
            ],
          },
        ],
      },
      {
        id: "2-2",
        title: "Salary Structures",
        color: "#6B4C9A",
        lessons: [
          {
            id: "2-2-1",
            title: "Salary Grades & Bands",
            duration: "10 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Define salary grades and understand why they are used",
              "Distinguish between narrow grades and broad bands",
              "Understand how job evaluation feeds into grading",
            ],
            body: [
              { t: "intro", v: "A salary grade is a grouping of jobs that have been assessed as having similar internal value and complexity. Grades are the backbone of a salary structure — they organize the entire workforce into a logical framework that makes pay decisions consistent, fair, and defensible." },
              { t: "h", v: "What Is a Salary Grade?" },
              { t: "p", v: "Think of a salary grade as a pay level. An organization might have 8–12 grades running from the most junior roles to the most senior. Each grade has an associated salary range. When a role is placed in Grade 5, that tells you immediately what pay range applies — without needing to negotiate from scratch for every hire." },
              { t: "p", v: "Grades are populated through job evaluation — assessing the relative size or value of each role. Jobs with similar scores are grouped into the same grade, regardless of function. A Grade 6 Finance Analyst and a Grade 6 HR Business Partner may have very different jobs, but they've been assessed as comparable in complexity, impact, and skill requirements." },
              { t: "box", label: "Salary Grade Anatomy", v: "Grade → a level in the pay hierarchy\nEach grade has a salary range: minimum | midpoint | maximum\nJobs are placed into grades through job evaluation\nGrades apply consistently across functions and departments" },
              { t: "h", v: "Narrow Grades vs Broad Bands" },
              { t: "p", v: "Narrow grade structures have many grades with relatively small differences between them — precise, but administratively complex. Broad band structures have fewer, wider grades — simpler, but requiring stronger manager judgment to use fairly. Most modern organizations use 6–10 grades covering the full workforce." },
              { t: "scenario", label: "Example", title: "Grading at Meridian Group", v: "Meridian Group uses 9 salary grades. Grades 1–3 cover individual contributors and junior specialists. Grades 4–6 cover senior specialists, team leads, and managers. Grades 7–9 cover senior managers, directors, and executives. Job evaluation panels assess each role against four factors — knowledge, complexity, accountability, and impact — and the score determines the grade. Once graded, the salary range is automatic." },
              { t: "takeaways", v: ["Salary grades group roles of similar value and complexity into a consistent pay hierarchy.", "Grades are assigned through job evaluation, not negotiation or title alone.", "Narrow grades offer precision; broad bands offer flexibility — most organizations use a middle approach."] },
            ],
            quiz: { q: "What is the primary purpose of a salary grade?", opts: ["To rank employees by their performance rating.", "To group roles of similar value into a consistent level that determines the applicable salary range.", "To set the exact salary for every employee.", "To list all employees by their years of service."], ans: 1, exp: "Salary grades group roles of similar internal value and complexity, allowing a consistent salary range to be applied to all roles within the same grade." },
          },
          {
            id: "2-2-2",
            title: "Range Design: Min, Mid & Max",
            duration: "10 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Explain the three points of a salary range",
              "Calculate compa-ratio and range penetration",
              "Understand how range spread affects pay progression",
            ],
            body: [
              { t: "intro", v: "Every salary range has three anchor points: minimum, midpoint, and maximum. These three numbers do more work than they appear to. They communicate the organization's pay philosophy, set expectations for career progression, and provide the reference points for almost every compensation decision." },
              { t: "h", v: "The Three Range Points" },
              { t: "p", v: "The minimum is the lowest pay the organization will offer for a role in this grade — typically representing a new or developing employee. The midpoint is the target rate, representing a fully competent, experienced employee performing well. The maximum is the ceiling for the grade — an employee at maximum is typically highly experienced, and reaching it signals that pay progression now depends on moving to a higher grade." },
              { t: "box", label: "Range Points", v: "Minimum → New or developing employee\nMidpoint → Fully competent, target market rate\nMaximum → Highly experienced; ceiling of the grade" },
              { t: "h", v: "Compa-Ratio" },
              { t: "p", v: "Compa-ratio measures an employee's pay relative to the range midpoint. Formula: Employee Salary ÷ Range Midpoint. A compa-ratio of 1.00 means exactly at midpoint. A compa-ratio of 0.85 means paid at 85% of midpoint — below market reference. A compa-ratio of 1.15 means paid at 115% of midpoint — above market reference." },
              { t: "box", label: "Compa-Ratio Formula", v: "Compa-Ratio = Employee Salary ÷ Range Midpoint\n\n< 1.00 = Below midpoint   = 1.00 = At midpoint   > 1.00 = Above midpoint" },
              { t: "h", v: "Range Penetration" },
              { t: "p", v: "Range penetration measures how far an employee has progressed through the full range from minimum to maximum. Formula: (Employee Salary − Minimum) ÷ (Maximum − Minimum). A result of 0% means the employee is at minimum. 50% means exactly at midpoint. 100% means at maximum." },
              { t: "scenario", label: "Worked Example", title: "Calculating at Kestrel Group", v: "An employee earns $72,000. Grade range: min $60,000, mid $80,000, max $100,000.\n\nCompa-ratio: $72,000 ÷ $80,000 = 0.90 → They are at 90% of midpoint, below market reference.\n\nRange penetration: ($72,000 − $60,000) ÷ ($100,000 − $60,000) = $12,000 ÷ $40,000 = 30%\n\nConclusion: This employee has significant room for pay progression and is currently paid below market reference — a strong candidate for a meaningful merit increase." },
              { t: "takeaways", v: ["Minimum, midpoint, and maximum are the three anchor points of every salary range.", "Compa-ratio = Employee Salary ÷ Midpoint — shows pay position relative to market reference.", "Range penetration shows how far an employee has moved through the full range (min to max)."] },
            ],
            quiz: { q: "An employee earns $85,000. Their salary range midpoint is $100,000. What is their compa-ratio?", opts: ["0.85", "1.15", "1.00", "85%"], ans: 0, exp: "Compa-ratio = $85,000 ÷ $100,000 = 0.85. This means the employee is paid at 85% of the market reference midpoint — below the target rate." },
          },
          {
            id: "2-2-3",
            title: "Market Pricing Fundamentals",
            duration: "10 min",
            xp: 80,
            type: "lesson",
            objectives: [
              "Explain what market pricing is and why it is used",
              "Understand how to read salary survey data",
              "Apply percentile thinking to compensation decisions",
            ],
            body: [
              { t: "intro", v: "Organizations do not set salaries in isolation. They compete for talent in labor markets — and those markets have prices. Market pricing is the process of understanding those prices, comparing them to current pay levels, and making informed decisions about competitiveness." },
              { t: "h", v: "What Is Market Pricing?" },
              { t: "p", v: "Market pricing is the systematic comparison of internal jobs to external salary data for equivalent roles in the relevant labor market. Market data comes from salary surveys that aggregate pay data from participating organizations and report it in percentile form." },
              { t: "box", label: "Key Percentiles", v: "P25 → Below market (bottom quartile)\nP50 → Market median (most common target)\nP75 → Above market (upper quartile)\nP90 → Highly competitive positioning" },
              { t: "h", v: "Job Matching: The Critical Step" },
              { t: "p", v: "The most important step in market pricing is job matching — identifying which survey job most closely corresponds to your internal role. The match must be based on responsibilities, scope, and level — not on title. A 'Senior Manager' at one organization may do the work of a 'Team Lead' at another. Matching by title gives you the wrong data; matching by content gives you a meaningful comparison." },
              { t: "scenario", label: "Reading Survey Data", title: "Benchmarking the HR Director Role", v: "Palora Health is reviewing pay for its HR Director. The C&B analyst finds a matching survey job:\n\nP25: $130,000 | P50: $155,000 | P75: $178,000\n\nPalora's HR Director earns $148,000 — approximately the 45th percentile, slightly below the market median. If Palora's strategy is P50, this employee may be due a market adjustment to around $155,000. If the strategy is P75, there is a larger gap to address." },
              { t: "h", v: "Choosing a Market Position" },
              { t: "p", v: "Organizations must decide where they want to position their pay relative to the market. Most target P50 for standard roles. Some target P75 for business-critical or hard-to-fill roles. The positioning decision should flow from business strategy and affordability, not from what feels generous." },
              { t: "takeaways", v: ["Market pricing compares internal pay to external salary survey data for equivalent roles.", "Job matching must be based on responsibilities and scope — not title.", "Market positioning strategy defines where the organization targets its pay (P50, P75, etc.)."] },
            ],
            quiz: { q: "An internal role pays $90,000. Market survey data shows P25: $85,000, P50: $100,000, P75: $115,000. Where does this role sit in the market?", opts: ["Above P75 (highly competitive)", "Between P25 and P50 (below median)", "Exactly at P50 (market median)", "Below P25 (significantly below market)"], ans: 1, exp: "$90,000 falls between P25 ($85,000) and P50 ($100,000) — below the market median. If the organization targets P50, a market adjustment may be warranted." },
          },
          {
            id: "2-2-Q",
            title: "Module Quiz: Salary Structures",
            duration: "5 min",
            xp: 150,
            type: "quiz",
            quiz_questions: [
              { q: "What is the primary purpose of salary grades in a pay structure?", opts: ["To rank employees by seniority.", "To group roles of similar value and complexity into consistent pay levels.", "To set bonuses based on performance.", "To determine annual leave entitlements."], ans: 1, exp: "Salary grades organize roles of similar internal value into consistent levels, each with a salary range — creating fairness and predictability in pay decisions." },
              { q: "An employee earns $78,000. Their grade midpoint is $90,000. What is their compa-ratio (rounded to 2 decimal places)?", opts: ["0.87", "1.15", "1.00", "0.78"], ans: 0, exp: "Compa-ratio = $78,000 ÷ $90,000 = 0.87. This employee is below the market reference midpoint." },
              { q: "What does a salary range midpoint typically represent?", opts: ["The minimum acceptable salary for any employee.", "The target pay for a fully competent, experienced employee in the role.", "The maximum salary a grade can ever pay.", "The average salary of all employees in the company."], ans: 1, exp: "The midpoint is the target market rate — typically aligned to P50 of survey data — representing fair pay for full competence." },
              { q: "In market pricing, why must job matching be based on responsibilities rather than titles?", opts: ["Job titles are legally protected terms.", "Titles vary significantly between organizations — matching by content ensures meaningful comparison.", "Survey data is organised by title only.", "Responsibilities are easier to measure than titles."], ans: 1, exp: "A 'Senior Manager' at one company may do the work of a 'Team Lead' at another. Matching by title produces misleading market data; matching by content is accurate." },
              { q: "An organization decides to set salary ranges at the P75 market percentile. What does this mean?", opts: ["They will pay below the majority of competitors.", "They will pay above 75% of organizations in the market.", "They will pay exactly at the market average.", "They will pay the same as all competitors."], ans: 1, exp: "Targeting P75 means the organization's pay will be higher than 75% of the market — positioning them as an above-market payer." },
            ],
          },
        ],
      },
    ],
  },
  {"id": 3, "title": "Pay Equity & Job Evaluation", "subtitle": "Build the analytical skills to create fair, defensible pay systems", "color": "#6B4C9A", "color2": "#8B6CB8", "bg": "#100818", "icon": "◎", "level": "Beginner", "duration": "4–5 hours", "lessons_count": 8, "total_xp": 1200, "desc": "Learn how to evaluate jobs fairly, design career levels, analyze pay gaps, and build the governance systems that keep reward decisions equitable and legally defensible. A critical skill set for any HR professional serious about fairness.", "outcomes": ["Explain the purpose and principles of job evaluation", "Apply point-factor and whole-job methods to assess role size", "Design a basic job family and career level framework", "Run a structured pay equity analysis using salary data", "Identify common sources of pay gaps and how to close them", "Build governance systems that prevent future pay inequity"], "modules": [{"id": "3-1", "title": "Job Evaluation Essentials", "color": "#6B4C9A", "lessons": [{"id": "3-1-1", "title": "What Job Evaluation Is and Why It Matters", "duration": "9 min", "xp": 80, "type": "lesson", "objectives": ["Define job evaluation and explain its purpose in reward design", "Understand the difference between evaluating a job and evaluating a person", "Identify the main job evaluation methods used in practice"], "body": [{"t": "intro", "v": "Before you can pay people fairly, you need to understand the relative size and complexity of every role in your organization. That is what job evaluation does. It is one of the most foundational — and most misunderstood — tools in the compensation professional's toolkit."}, {"t": "h", "v": "The Core Principle: Evaluate the Job, Not the Person"}, {"t": "p", "v": "Job evaluation assesses the inherent size, complexity, and value of a role — not the performance, experience, or personal qualities of the individual currently in it. This distinction is critical. Two employees may hold the same job title at Grade 5, but if one is a high performer and the other is still developing, that difference is handled through pay positioning within the grade — not through changing the grade itself."}, {"t": "p", "v": "This principle protects fairness. If job grades were influenced by the person rather than the role, pay structures would become inconsistent, politically influenced, and indefensible. Job evaluation creates an objective framework that applies consistently across all functions, levels, and teams."}, {"t": "box", "label": "Key Principle", "v": "Job evaluation assesses the ROLE — its responsibilities, complexity, and impact.\nPerformance management assesses the PERSON — their contribution and results.\nThese are related but must be kept separate."}, {"t": "h", "v": "Why Organizations Use Job Evaluation"}, {"t": "p", "v": "Without job evaluation, pay decisions default to negotiation power, market pressure, and manager preference. Over time, this creates a patchwork of pay levels that are hard to explain, hard to defend, and frequently unfair. Job evaluation provides the internal logic that holds a pay structure together."}, {"t": "p", "v": "Specifically, job evaluation enables salary grading — grouping roles of similar size into the same pay band. It supports career frameworks — defining the progression from junior to senior to leadership levels. It underpins pay equity analysis — comparing roles that may have different titles but comparable complexity. And it makes promotion decisions more defensible — because there is an agreed framework for assessing whether a role has genuinely grown to the next level."}, {"t": "scenario", "label": "In Context", "title": "Why Driftwood Media Needed Job Evaluation", "v": "Driftwood Media had grown from 40 to 280 employees over four years. Pay had been set through a mix of negotiation, market offers, and manager requests — with no consistent logic. By year four, a Digital Marketing Manager earned more than a Finance Manager at a higher level of accountability. A junior developer was on the same salary as a senior one. The HR team could not explain pay levels to employees, and three grievances had been raised about unfair pay. The fix required a full job evaluation exercise before any salary structure work could begin."}, {"t": "h", "v": "The Main Evaluation Methods"}, {"t": "p", "v": "There are four primary methods. Whole-job ranking is the simplest: jobs are ordered from smallest to largest based on overall judgment. Classification places jobs into predefined grade descriptions and asks which description best fits each role. Market pricing compares roles to external salary data rather than evaluating them internally. Point-factor evaluation assigns numerical scores to defined job characteristics — this is the most rigorous method and the one most large organizations use."}, {"t": "box", "label": "Evaluation Methods at a Glance", "v": "Ranking → Simple ordering from smallest to largest role\nClassification → Match roles to predefined grade descriptions\nMarket Pricing → Use external pay data as the primary reference\nPoint-Factor → Score roles on defined factors; most rigorous method"}, {"t": "takeaways", "v": ["Job evaluation assesses the role, not the person — this distinction is essential for fairness.", "It provides the internal logic that holds salary structures, career levels, and pay equity together.", "The four main methods are ranking, classification, market pricing, and point-factor evaluation."]}], "quiz": {"q": "A high-performing employee asks why they are in the same salary grade as a lower-performing colleague in the same role. What is the most accurate explanation?", "opts": ["The grading system is broken and needs to be revised immediately.", "Job evaluation grades the role, not the individual — performance differences are reflected in pay positioning within the grade, not in the grade itself.", "High performers should always be in a higher grade than low performers.", "Grades should be adjusted based on performance ratings."], "ans": 1, "exp": "Job evaluation grades the role based on its responsibilities and complexity. Performance differences are managed through pay positioning within the salary range — for example, a higher compa-ratio for strong performers — not through changing the grade."}}, {"id": "3-1-2", "title": "Point-Factor Evaluation in Practice", "duration": "11 min", "xp": 80, "type": "lesson", "objectives": ["Understand the structure of a point-factor evaluation system", "Apply scoring logic to common evaluation factors", "Understand how point scores translate into salary grades"], "body": [{"t": "intro", "v": "Point-factor evaluation is the gold standard of job sizing methods. It replaces subjective judgment with structured criteria, producing scores that can be compared across all roles in the organization. Understanding how it works — even at a basic level — is essential for anyone working in compensation or HR advisory."}, {"t": "h", "v": "How Point-Factor Systems Work"}, {"t": "p", "v": "A point-factor system defines a set of compensable factors — the dimensions along which job size is measured. Each factor is divided into levels, and each level has a point value. Evaluators review a job description and score the role on each factor. The total score determines the grade."}, {"t": "p", "v": "The factors typically cover: Knowledge and Technical Skill (what the role requires the person to know), Problem Solving and Complexity (how novel and difficult the thinking required is), Accountability and Impact (the extent and significance of the role's influence on results), and People and Resource Management (the scope of leadership or coordination responsibility). Some frameworks also include Working Conditions for roles with physical or environmental demands."}, {"t": "box", "label": "Common Point-Factor Dimensions", "v": "Knowledge & Technical Skill → Depth and breadth of expertise required\nProblem Solving & Complexity → Novelty, ambiguity, analytical demand\nAccountability & Impact → Scope and consequence of decisions\nPeople & Resources → Leadership, coordination, budget responsibility\nWorking Conditions → Physical, environmental, or safety demands (where applicable)"}, {"t": "h", "v": "A Worked Scoring Example"}, {"t": "p", "v": "Consider two roles: a Data Entry Clerk and a Senior Finance Analyst. On Knowledge, the clerk scores Level 2 (basic knowledge, clear procedures) while the analyst scores Level 4 (specialist technical knowledge, professional qualification). On Problem Solving, the clerk scores Level 1 (routine tasks, prescribed methods) while the analyst scores Level 4 (analytical problems with multiple variables). On Accountability, the clerk scores Level 1 (individual outputs, supervised) while the analyst scores Level 3 (significant financial analysis, some autonomy). The total point scores might be 85 for the clerk and 320 for the analyst — placing them in very different grades."}, {"t": "scenario", "label": "Governance Example", "title": "The Evaluation Panel at Meridian Group", "v": "Meridian Group conducts evaluations through a panel of three: a senior HR leader, a business representative from outside the affected team, and a C&B specialist. Decisions are documented with the rationale for each factor score. When a manager challenges a grade decision, the panel review process provides a clear evidence base for the outcome. This prevents grade inflation driven by manager advocacy rather than role content."}, {"t": "h", "v": "From Points to Grades"}, {"t": "p", "v": "Once all roles are scored, the organization defines grade boundaries — point score ranges that correspond to each grade. For example, Grade 3 might cover roles scoring 150–220 points, Grade 4 covers 221–310 points, and so on. This means any new role created in the organization can be evaluated and placed into the structure without requiring a special decision — the framework does the work."}, {"t": "p", "v": "The boundaries are set by analyzing the distribution of scores and looking for natural breaks, while also ensuring the structure makes business sense. A role that scores at the top of Grade 5 but is genuinely senior might be reviewed to see if the job description fully captures the accountability. The system guides decisions — it does not replace human judgment entirely."}, {"t": "takeaways", "v": ["Point-factor systems score roles on defined dimensions — knowledge, complexity, accountability, and people management.", "Scores are totalled and mapped to grade boundaries, creating a consistent and defensible grading framework.", "Evaluation should be conducted by a panel with documented rationale, not by managers alone."]}], "quiz": {"q": "A role scores 280 points in a point-factor evaluation. Grade 4 covers 221–310 points and Grade 5 covers 311–400 points. Which grade should this role be assigned?", "opts": ["Grade 5, because the role is high-scoring.", "Grade 4, because 280 points falls within the 221–310 range.", "The grade cannot be determined without a market pricing exercise.", "Grade 3, to allow room for progression."], "ans": 1, "exp": "Point-factor evaluation is objective — if a role scores 280 points and Grade 4 covers 221–310, the role belongs in Grade 4. The grade is determined by the score, not by market comparisons or assumptions about progression."}}, {"id": "3-1-3", "title": "Job Families & Career Level Frameworks", "duration": "9 min", "xp": 80, "type": "lesson", "objectives": ["Define job families and explain their role in career architecture", "Understand how career levels describe progression within a function", "See how job families and levels connect to grades and pay ranges"], "body": [{"t": "intro", "v": "Job evaluation tells you how big a role is relative to others. Job families and career level frameworks tell employees how they can grow. Together, these two tools create the architecture that makes reward systems both fair and motivating."}, {"t": "h", "v": "What Are Job Families?"}, {"t": "p", "v": "A job family is a grouping of roles that share a common type of work, professional discipline, or functional purpose. Finance, Technology, Human Resources, Sales, Operations, and Legal are examples of job families. Within each family, roles share broadly similar skill sets, knowledge bases, and career pathways — even though they differ significantly in level and scope."}, {"t": "p", "v": "Job families serve several purposes. They make career progression visible — an employee in the Technology family can see the path from Junior Developer to Principal Architect. They help HR apply consistent evaluation criteria within a function. They support workforce planning by allowing the organization to analyze talent supply and demand within each discipline."}, {"t": "box", "label": "Job Family Example: Human Resources", "v": "Level 1 → HR Coordinator (Grade 2–3)\nLevel 2 → HR Advisor / Recruiter (Grade 3–4)\nLevel 3 → HR Business Partner / HR Manager (Grade 4–5)\nLevel 4 → Senior HR Business Partner / C&B Manager (Grade 5–6)\nLevel 5 → HR Director (Grade 7–8)\nLevel 6 → Chief People Officer (Grade 9)"}, {"t": "h", "v": "Career Levels: The Vertical Dimension"}, {"t": "p", "v": "Career levels describe the expected scope, complexity, independence, and impact at each stage of progression within a job family. They answer the question: 'What does it actually mean to move from Level 2 to Level 3 in this function?' Good level definitions go beyond titles and pay — they describe the nature of the work, the decision-making authority, the stakeholder complexity, and the contribution expected."}, {"t": "p", "v": "Common level archetypes include: Individual Contributor (applies skills to defined tasks), Senior Individual Contributor (works with greater complexity and autonomy), Specialist or Team Lead (deep expertise or coordination of small teams), Manager (accountability for a team's performance), Senior Manager or Director (strategic scope, multiple teams or broader accountability), and Executive or VP (organization-wide or business unit accountability)."}, {"t": "scenario", "label": "Case Study", "title": "Career Architecture at Castleton Partners", "v": "Castleton Partners redesigned its career framework after several years of title inflation. Employees had been promoted into manager titles without taking on genuine people leadership. The new framework defined six levels across each job family, with clear descriptions of scope, independence, and impact at each level. Promotions now required evidence of working at the next level — not just time served or performance ratings. Within 18 months, both internal mobility and employee engagement scores had improved significantly."}, {"t": "h", "v": "Connecting Families, Levels, and Pay"}, {"t": "p", "v": "The power of this framework is in its connection to grading. Each career level maps to one or two salary grades. This means an employee can see both their career path — the qualitative progression of scope and impact — and their pay trajectory — the grade and range they can expect at each level. This transparency reduces speculation, grievances, and the perception that pay decisions are arbitrary."}, {"t": "takeaways", "v": ["Job families group roles by professional discipline, creating clear career pathways within each function.", "Career levels define the scope, complexity, and impact expected at each stage of progression.", "When connected to grades and salary ranges, this framework makes pay and progression visible and defensible."]}], "quiz": {"q": "An employee asks why they received a promotion in title but no grade change. What is the most likely explanation?", "opts": ["The salary structure has an error that needs to be corrected.", "The promotion moved them within the same career level — the role did not grow to the next grade.", "Promotions never result in grade changes.", "The job family framework is not working correctly."], "ans": 1, "exp": "Titles can change without a grade change if the role's complexity, scope, and accountability remain within the same career level and grade band. A grade change requires the role to genuinely move to the next level of the career architecture."}}, {"id": "3-1-Q", "title": "Module Quiz: Job Evaluation Essentials", "duration": "5 min", "xp": 150, "type": "quiz", "quiz_questions": [{"q": "What is the fundamental principle that distinguishes job evaluation from performance management?", "opts": ["Job evaluation is done annually; performance management is done monthly.", "Job evaluation assesses the role's complexity and accountability; performance management assesses the individual's contribution.", "Job evaluation determines bonuses; performance management determines salary grades.", "They are the same process with different names."], "ans": 1, "exp": "Job evaluation sizes the role based on its inherent responsibilities, complexity, and impact. Performance management assesses how well the individual performs within that role. Keeping these separate protects fairness and consistency in grading."}, {"q": "In a point-factor evaluation, what determines which salary grade a role is assigned to?", "opts": ["The manager's preference for where the role should sit.", "The market salary for the role at the 50th percentile.", "The total point score, which is mapped to defined grade boundary ranges.", "The job title and number of direct reports only."], "ans": 2, "exp": "Point-factor evaluation produces a numerical score that is mapped to grade boundaries. If Grade 4 covers 221–310 points and the role scores 285, it is placed in Grade 4 — objectively, consistently, and regardless of the job title."}, {"q": "Which of the following best describes a job family?", "opts": ["A group of employees who share the same manager.", "A collection of roles sharing a common professional discipline and career pathway.", "A salary band that applies to all roles at the same level.", "A list of all jobs in the organization ranked by seniority."], "ans": 1, "exp": "A job family groups roles by shared professional discipline — such as Finance, HR, or Technology — and defines the career levels within that discipline, from entry-level to executive."}, {"q": "Why is it important that job evaluation panels include representatives from outside the team being evaluated?", "opts": ["To reduce the time needed for evaluation.", "To add more people to the process for compliance purposes.", "To prevent grade inflation driven by team advocates rather than objective role content.", "To ensure all managers are involved in pay decisions."], "ans": 2, "exp": "Panels that include only the manager or team representative are vulnerable to advocacy bias — evaluating the person rather than the role, or inflating grades to improve pay competitiveness. External panel members maintain objectivity."}, {"q": "An organization's career framework shows that Level 3 in the Finance job family maps to Grades 4 and 5. A Finance Manager is currently in Grade 3. What does this suggest?", "opts": ["The Finance Manager is correctly placed.", "The Finance Manager may be graded below their career level — worth investigating through job evaluation.", "Grade 3 is the correct grade for a Finance Manager in all organizations.", "Career levels and grades are not connected."], "ans": 1, "exp": "If the framework maps Level 3 Finance roles to Grades 4–5 but the employee is in Grade 3, there may be a grading anomaly. This warrants a job evaluation review to determine whether the role is appropriately sized and graded."}]}]}, {"id": "3-2", "title": "Pay Equity Analysis", "color": "#B84B4B", "lessons": [{"id": "3-2-1", "title": "Understanding Pay Gaps", "duration": "9 min", "xp": 80, "type": "lesson", "objectives": ["Define pay equity and distinguish it from pay equality", "Understand the difference between unadjusted and adjusted pay gaps", "Identify the most common causes of pay gaps in organizations"], "body": [{"t": "intro", "v": "Pay equity is one of the most important — and most misunderstood — concepts in modern HR. Getting it right requires more than good intentions. It requires clean data, rigorous analysis, honest conversation, and sustained governance. This lesson builds the foundation."}, {"t": "h", "v": "Pay Equity vs Pay Equality"}, {"t": "p", "v": "Pay equality means everyone receives the same pay. Pay equity means everyone receives fair pay — with differences that are legitimate, explainable, and free from unfair bias. These are very different things. Two employees in the same role at the same grade may be paid differently because one has significantly more relevant experience, a specialist qualification, or has received consistent high-performance ratings over several years. Those differences can be equitable — as long as they are documented, justifiable, and applied consistently."}, {"t": "p", "v": "Pay inequity occurs when pay differences exist that cannot be explained by legitimate job-related factors. If two employees are in the same role, with similar experience and performance, and one is paid 15% more without a clear business reason, that is a pay equity concern — regardless of who those employees are or what demographic characteristics they hold."}, {"t": "box", "label": "Key Distinction", "v": "Pay EQUALITY → Everyone earns the same\nPay EQUITY → Differences are fair, documented, and explainable\n\nThe goal is equity, not equality. Legitimate differences in pay are acceptable — unexplained ones are not."}, {"t": "h", "v": "Unadjusted vs Adjusted Pay Gaps"}, {"t": "p", "v": "The unadjusted pay gap compares the average or median pay of two groups — for example, men and women — without controlling for any factors. This is the figure most commonly reported in pay gap publications. It is important, but it does not tell the whole story. A large unadjusted gap may reflect differences in the types of roles each group tends to hold, not unfair pay within the same role."}, {"t": "p", "v": "The adjusted pay gap controls for relevant factors — role, grade, experience, performance, location, and tenure — and asks: after accounting for all of these factors, is there still a pay difference? If yes, this is the more concerning finding, because it suggests pay differences exist that cannot be explained by legitimate job-related criteria."}, {"t": "scenario", "label": "Example", "title": "Understanding the Difference at Solaris Financial", "v": "Solaris Financial reports an unadjusted gender pay gap of 22%. This sounds alarming. But analysis shows that women represent 78% of the workforce in the lower-paid Customer Service function and only 14% of the senior Technology and Trading roles. When the analysis is adjusted to compare men and women within the same role and grade, the gap falls to 3.2%. That 3.2% is the focus for pay equity action — it represents pay differences that cannot be explained by role, grade, or level."}, {"t": "h", "v": "How Pay Gaps Develop"}, {"t": "p", "v": "Pay gaps rarely appear overnight. They accumulate through small, inconsistent decisions made across years. Hiring offers that are negotiation-driven rather than range-based. Merit increases applied inconsistently across teams. Promotions without accompanying pay reviews. Exceptions approved for some employees but not requested for others. Each individual decision may seem reasonable in isolation. Cumulatively, they create gaps that are hard to explain and expensive to correct."}, {"t": "takeaways", "v": ["Pay equity means fair and explainable differences — not identical pay for everyone.", "The adjusted pay gap (controlling for role, grade, and experience) is more actionable than the unadjusted gap.", "Pay gaps develop gradually through small, inconsistent decisions — governance is the most effective prevention."]}], "quiz": {"q": "After controlling for role, grade, experience, and performance, an organization finds a 4.1% pay gap between two groups. What does this finding most likely indicate?", "opts": ["The gap is small enough to ignore.", "The gap reflects legitimate differences in role type across the two groups.", "A pay equity concern — differences remain that cannot be explained by legitimate job-related factors.", "The salary structure needs to be redesigned from scratch."], "ans": 2, "exp": "An adjusted pay gap that persists after controlling for legitimate factors (role, grade, experience, performance) suggests unexplained pay differences that warrant investigation and likely remediation. Even a small adjusted gap is significant."}}, {"id": "3-2-2", "title": "Running a Pay Equity Review", "duration": "11 min", "xp": 80, "type": "lesson", "objectives": ["Understand the step-by-step process of a pay equity review", "Know what data is needed and how to prepare it", "Apply compa-ratio and peer comparison analysis to identify concerns"], "body": [{"t": "intro", "v": "Knowing that pay equity matters is the starting point. Knowing how to actually conduct a pay equity review is the professional skill. This lesson walks through the process from data preparation to findings and recommendations — the same process used by compensation teams in organizations of all sizes."}, {"t": "h", "v": "Step 1: Define the Scope and Comparator Groups"}, {"t": "p", "v": "A pay equity review begins with a clear scope. What population are you reviewing? What comparison groups are you analyzing — for example, gender, ethnicity, age band, or employment type? What time period does the data cover? Defining scope prevents scope creep and ensures the analysis is focused and actionable."}, {"t": "p", "v": "Comparator groups should be meaningful. Comparing employees across very different functions or levels without controlling for role size will produce misleading results. The most useful comparisons are within the same grade and job family — employees doing broadly equivalent work at the same level."}, {"t": "box", "label": "Pay Equity Review Scope Checklist", "v": "✓ Define the employee population (all employees, one function, one country)\n✓ Identify the comparison groups (gender, tenure band, employment type)\n✓ Agree which pay elements to include (base pay, total cash, or both)\n✓ Confirm the data cut-off date\n✓ Identify who needs access to the data (confidentiality protocols)"}, {"t": "h", "v": "Step 2: Gather and Clean the Data"}, {"t": "p", "v": "The data needed for a pay equity review typically includes: employee ID, job title, job family, salary grade, base salary, total cash compensation, gender or other relevant demographic data (where legally permitted and ethically appropriate), years of service, years in current role, last performance rating, and location or country."}, {"t": "p", "v": "Data quality is everything in this analysis. Inconsistent job titles, missing grades, outdated performance ratings, and incorrect tenure data will all distort the findings. Before any analysis begins, run data quality checks: look for blanks, outliers, inconsistent formats, and roles with no grade assigned. Clean data produces trustworthy findings; dirty data produces noise."}, {"t": "h", "v": "Step 3: Analyze Compa-Ratios by Group"}, {"t": "p", "v": "Once the data is clean, the primary analysis tool is the compa-ratio. Calculate each employee's compa-ratio (salary divided by grade midpoint). Then compare the average compa-ratio across your comparison groups — for example, the average compa-ratio for Group A vs Group B within the same grade and job family."}, {"t": "p", "v": "A meaningful difference in average compa-ratios within the same grade and function is a finding worth investigating. It does not automatically mean unfair pay — there may be legitimate explanations such as tenure differences, performance rating distributions, or recently hired employees who have not yet received increases. But it is the starting point for a deeper look."}, {"t": "scenario", "label": "Worked Example", "title": "Compa-Ratio Analysis at Kestrel Group", "v": "In Grade 4 of Kestrel Group's Finance function, the analysis shows:\n\nGroup A (12 employees) → Average compa-ratio: 0.96\nGroup B (8 employees) → Average compa-ratio: 0.88\n\nThe 8-point gap in compa-ratio between the two groups — within the same grade and function — flags a potential equity concern. Deeper analysis reveals that Group B employees have on average 2 fewer years of tenure and slightly lower average performance ratings. When tenure and performance are held constant, the gap narrows to 3 points. That residual 3-point gap — unexplained by legitimate factors — is the focus for remediation."}, {"t": "h", "v": "Step 4: Identify, Quantify, and Prioritize Findings"}, {"t": "p", "v": "Not all gaps require the same response. Prioritize findings by size of gap, number of employees affected, and the degree to which the gap is unexplained. Small gaps within noise levels may be monitored rather than remediated immediately. Larger unexplained gaps — particularly those affecting multiple employees or concentrated in one group — require prompt action and a clear remediation plan."}, {"t": "takeaways", "v": ["A pay equity review requires clean, comprehensive data — role, grade, pay, tenure, performance, and where appropriate, demographic information.", "Compa-ratio analysis by group within the same grade and function is the core analytical tool.", "Not all gaps indicate inequity — the focus should be on differences that remain after controlling for legitimate job-related factors."]}], "quiz": {"q": "In a pay equity review, employees in the same grade and job family show a 9-point average compa-ratio gap between two groups. Deeper analysis shows that 6 points are explained by tenure and performance differences. What should HR focus on?", "opts": ["The full 9-point gap, as all differences are concerning.", "The 6-point gap explained by legitimate factors — this is where the problem lies.", "The residual 3-point gap that remains after controlling for tenure and performance — this is unexplained and requires investigation.", "No action is needed, as most of the gap is explained."], "ans": 2, "exp": "The analytical goal is to separate explained differences (legitimate) from unexplained ones. The 6-point gap attributable to tenure and performance is justifiable. The 3-point residual — unexplained by any legitimate factor — is the pay equity concern that warrants investigation and potential remediation."}}, {"id": "3-2-3", "title": "Closing Gaps & Building Governance", "duration": "10 min", "xp": 80, "type": "lesson", "objectives": ["Understand the options for remediating pay equity gaps", "Build a sustainable pay equity governance framework", "Communicate pay equity work to employees and leaders effectively"], "body": [{"t": "intro", "v": "Identifying a pay gap is only half the job. The harder and more consequential half is deciding what to do about it — and then building the systems that prevent new gaps from forming. This is where pay equity work becomes truly strategic."}, {"t": "h", "v": "Remediating Pay Gaps"}, {"t": "p", "v": "When an unexplained pay gap is confirmed, the organization must decide on a remediation approach. The most direct option is a targeted pay adjustment — increasing the pay of affected employees to close the identified gap. This is typically prioritized for employees with the largest unexplained gap and the strongest case for inequity."}, {"t": "p", "v": "Remediation should be sequenced thoughtfully. In most organizations, pay equity corrections are phased over one to two years, with the largest and most urgent cases addressed first. Budget for corrections should be ring-fenced and treated separately from merit review cycles — combining them risks diluting the equity correction or creating perverse incentives in the merit process."}, {"t": "box", "label": "Remediation Principles", "v": "✓ Address the largest unexplained gaps first\n✓ Ring-fence budget separately from merit and promotion cycles\n✓ Document the rationale for every correction\n✓ Review corrected employees in the following cycle to confirm the fix holds\n✓ Do not wait for perfect data — act on confirmed cases now"}, {"t": "h", "v": "Root Cause Analysis: Fixing the System, Not Just the Symptoms"}, {"t": "p", "v": "Correcting individual gaps without fixing the system that created them is like mopping the floor while leaving the tap running. Effective pay equity governance requires root cause analysis: why did these gaps develop in the first place?"}, {"t": "p", "v": "Common root causes include: no formal salary range for offers, meaning new hires are paid based on negotiation; merit increases that are applied at manager discretion without clear guidelines; promotions without a formal pay review step; no regular pay equity monitoring; and lack of manager training on pay decisions. Each of these is a process gap that can be closed with appropriate governance."}, {"t": "scenario", "label": "Building Governance", "title": "Palora Health's Pay Equity Framework", "v": "After completing its first pay equity review, Palora Health identified three systemic causes of gaps: negotiation-based offers, inconsistent merit guidance, and no promotion pay policy. They responded by: (1) introducing salary range midpoints as a hiring target, with approvals required for offers above the 60th percentile of the range; (2) publishing merit increase guidelines tied to compa-ratio and performance, reducing manager discretion; and (3) implementing a mandatory pay review at every promotion, with HR sign-off required. Two years later, their second pay equity review found gaps 60% smaller than the first."}, {"t": "h", "v": "Communicating Pay Equity Work"}, {"t": "p", "v": "Employees increasingly expect organizations to be transparent about pay equity. The question is not whether to communicate — but how much, to whom, and at what level of detail. At minimum, organizations should be able to explain their pay equity commitment, the analysis they have conducted, and the actions they are taking. Employees do not need individual salary data to believe the organization takes fairness seriously; they need to see that the process exists, is rigorous, and produces real action."}, {"t": "p", "v": "Leaders also need equipping. Managers who cannot explain why pay decisions are made — or who are surprised by pay equity findings — are a governance risk. Regular manager briefings, pay decision training, and clear escalation paths for pay concerns all contribute to a culture where equity is maintained, not just audited."}, {"t": "takeaways", "v": ["Remediate confirmed gaps with targeted adjustments — ring-fenced from the merit cycle, documented, and monitored.", "Root cause analysis is essential — fix the processes that created gaps, not just the individual cases.", "Communicate clearly: employees need to see commitment, process, and action — not necessarily every data point."]}], "quiz": {"q": "An organization completes a pay equity review and finds confirmed unexplained gaps. They correct the individual cases but make no changes to hiring, merit, or promotion processes. What is the most likely outcome?", "opts": ["The pay equity problem is fully resolved and will not return.", "New gaps will develop over time through the same processes that created the original ones.", "The salary structure will automatically prevent new gaps from forming.", "Managers will change their behavior without any policy guidance."], "ans": 1, "exp": "Correcting individual gaps without addressing the root cause processes is temporary. The same hiring, merit, and promotion practices that created the original gaps will generate new ones. Sustainable pay equity requires governance reform, not just point-in-time corrections."}}, {"id": "3-2-Q", "title": "Module Quiz: Pay Equity Analysis", "duration": "5 min", "xp": 150, "type": "quiz", "quiz_questions": [{"q": "What is the key difference between pay equality and pay equity?", "opts": ["Pay equality means all employees receive the same base salary; pay equity is a legal term only.", "Pay equality means identical pay for everyone; pay equity means pay differences are fair, documented, and based on legitimate factors.", "They mean the same thing and can be used interchangeably.", "Pay equity applies only to gender differences; pay equality covers all demographic groups."], "ans": 1, "exp": "Pay equality requires identical pay for all, which is neither practical nor always fair. Pay equity requires that differences in pay are legitimate, explainable, and free from bias — a more nuanced and actionable standard."}, {"q": "What is an adjusted pay gap?", "opts": ["The pay gap before any analysis has been conducted.", "The gap between the highest and lowest salary in the organization.", "The pay gap that remains after controlling for legitimate factors such as role, grade, experience, and performance.", "The total cost of correcting all pay inequities in the organization."], "ans": 2, "exp": "The adjusted pay gap isolates the unexplained portion of the pay difference after accounting for legitimate job-related factors. It is more actionable than the unadjusted gap, which may simply reflect occupational segregation rather than unfair pay within equivalent roles."}, {"q": "In a pay equity analysis, employees in the same grade and job family show an average compa-ratio of 1.02 for Group A and 0.91 for Group B. What should be the next analytical step?", "opts": ["Immediately increase all Group B salaries to match Group A.", "Investigate whether legitimate factors such as tenure, performance, or time in role explain the 11-point gap.", "Disband the salary grade structure and rebuild it from scratch.", "Report the finding as a legal violation immediately."], "ans": 1, "exp": "A gap in compa-ratios between groups is a signal for investigation, not an immediate finding of inequity. The next step is to determine how much of the gap is explained by legitimate factors (tenure, performance, time in role) and how much remains unexplained after controlling for those factors."}, {"q": "Which of the following is a root cause of pay gaps, rather than just a symptom?", "opts": ["Two employees in the same role are paid differently.", "Hiring offers are made based on candidate negotiation rather than a defined salary range.", "The organization's average compa-ratio is below 1.00.", "A pay equity report shows a 5% gap."], "ans": 1, "exp": "Negotiation-based offers are a systemic root cause — they produce pay levels based on individual leverage rather than role value and market data. Addressing this process prevents future gaps from forming, rather than just correcting existing ones."}, {"q": "When remediating pay equity gaps, why should the correction budget be ring-fenced from the merit review cycle?", "opts": ["Because pay equity corrections are not legally required and should be kept separate.", "To ensure equity corrections are not diluted by merit pool competition, and to prevent perverse incentives in the merit process.", "Because merit increases are more important than equity corrections.", "To make the budgeting process simpler for the finance team."], "ans": 1, "exp": "Combining equity corrections with the merit pool risks two problems: (1) the correction budget is competed away by general merit decisions, and (2) managers may adjust merit recommendations to influence equity outcomes. Ring-fencing protects the integrity of both processes."}]}]}]},
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
