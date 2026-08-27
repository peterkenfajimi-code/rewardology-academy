export type QuizCentreQuestion = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

export type QuizCentreQuiz = {
  id: number;
  title: string;
  category: string;
  color: string;
  bg: string;
  icon: string;
  xp: number;
  desc: string;
  questions: QuizCentreQuestion[];
};

export const QUIZ_CENTRE: QuizCentreQuiz[] = [
  {
    "id": 1,
    "title": "Total Rewards Foundations",
    "category": "Total Rewards Fundamentals",
    "color": "#C8963E",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Master the five pillars of Total Rewards and the employee value proposition.",
    "questions": [
      {
        "q": "Which statement best describes Total Rewards?",
        "opts": [
          "The full combination of financial and non-financial value employees receive from work.",
          "A structured approach to managing payroll costs and tax efficiency across the workforce, a consideration that's easy to overlook when reviewing the decision quickly.",
          "A programme that consolidates all HR data into one reporting system for management, which tends to hold true across most comparable organisations in this context.",
          "A framework that focuses primarily on base pay and external salary benchmarking, though this can vary depending on the specific circumstances and business context."
        ],
        "ans": 0,
        "exp": "Total Rewards combines pay, benefits, wellbeing, recognition, career growth and work experience."
      },
      {
        "q": "Which item is usually considered a non-cash reward?",
        "opts": [
          "A performance-related commission earned on revenue closed during the sales period.",
          "Career development opportunity.",
          "A monthly overtime payment calculated from hours worked beyond the standard contracted week.",
          "An annual base salary paid each month in return for time and attendance."
        ],
        "ans": 1,
        "exp": "Career development creates employee value without being a direct cash payment."
      },
      {
        "q": "Why should Total Rewards align with business strategy?",
        "opts": [
          "So benefits costs can be minimised without reviewing employee needs or market data, though this can vary depending on the specific circumstances and business context.",
          "So compensation decisions are delegated to finance rather than the HR function, a detail that matters most when reviewing the full range of available options.",
          "So reward investments support attraction, retention, performance and workforce priorities.",
          "So HR teams can reduce the number of salary bands required across the organisation, which is worth bearing in mind when comparing this to the other alternatives."
        ],
        "ans": 2,
        "exp": "Rewards should reinforce the talent and performance outcomes the business needs."
      },
      {
        "q": "Which option best reflects a balanced Total Rewards approach?",
        "opts": [
          "Benchmarking compensation annually against one competitor and replicating their approach, a detail that matters most when reviewing the full range of available options.",
          "Delegating all reward decisions to line managers without centralised governance or data, which is worth bearing in mind when comparing this to the other alternatives.",
          "Prioritising base salary above all other elements to maximise talent attraction in every market, something that often gets missed when looking only at the surface-level detail.",
          "Designing pay, benefits, wellbeing, recognition and growth programs around employee and business needs."
        ],
        "ans": 3,
        "exp": "A balanced approach considers multiple reward pillars and aligns them with strategy and workforce needs."
      },
      {
        "q": "What is the Employee Value Proposition most closely connected to?",
        "opts": [
          "The organization's complete promise of value to employees.",
          "The formal summary of performance ratings issued during the annual appraisal cycle.",
          "The financial model used to calculate total workforce cost as a percentage of revenue.",
          "The documented list of compliance requirements HR must meet in each operating region."
        ],
        "ans": 0,
        "exp": "The EVP explains why employees should join, stay and contribute, and Total Rewards makes that promise tangible."
      },
      {
        "q": "Which reward pillar most directly supports employee health security?",
        "opts": [
          "Career development programmes designed to build specialist expertise over time.",
          "Employee benefits.",
          "Performance-related pay tied to individual and team results throughout the year.",
          "Recognition schemes that acknowledge contribution and effort beyond the standard role."
        ],
        "ans": 1,
        "exp": "Benefits such as health insurance, leave and life insurance help protect employees from risk."
      },
      {
        "q": "Which is a common mistake in Total Rewards design?",
        "opts": [
          "Consulting employees about what they value before changing benefits or pay programmes, at least according to how this is typically approached in most similar situations.",
          "Reviewing salary structures against published market data at regular defined intervals, regardless of the specific design choices made elsewhere in the reward framework.",
          "Treating rewards as isolated programs instead of an integrated employee value system.",
          "Training managers to discuss reward decisions clearly and confidently with their teams, a consideration that's easy to overlook when reviewing the decision quickly."
        ],
        "ans": 2,
        "exp": "Rewards are stronger when compensation, benefits, wellbeing, recognition and career growth work together."
      },
      {
        "q": "Which group would most likely value career development as part of Total Rewards?",
        "opts": [
          "Employees in fixed-term roles who do not expect to remain beyond their contract period.",
          "Employees approaching retirement who are most concerned with pension security.",
          "Employees who are new to the organisation and focused primarily on their starting salary.",
          "Employees at all stages who want to build skills and progress."
        ],
        "ans": 3,
        "exp": "Career development can be valuable across employee groups, although needs differ by career stage."
      },
      {
        "q": "Why is communication important in Total Rewards?",
        "opts": [
          "It helps employees understand the value and purpose of reward programs.",
          "It allows HR to standardise all reward programmes across different workforce segments.",
          "It reduces the administrative cost of processing pay changes and benefits renewals.",
          "It ensures compliance with statutory reporting obligations under relevant employment law."
        ],
        "ans": 0,
        "exp": "Even well-designed rewards can be undervalued if employees do not understand them."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "Total Rewards is primarily a financial planning tool used by the finance function.",
          "Total Rewards is broader than compensation and benefits.",
          "Total Rewards is a recent term used specifically for voluntary employee benefits programmes.",
          "Total Rewards is focused mainly on executive pay design and long-term incentive plans."
        ],
        "ans": 1,
        "exp": "Compensation and benefits are key components, but Total Rewards also includes wellbeing, recognition, growth and work experience."
      }
    ]
  },
  {
    "id": 2,
    "title": "Compensation Basics",
    "category": "Compensation Fundamentals",
    "color": "#2E7D8C",
    "bg": "#071C22",
    "icon": "◉",
    "xp": 150,
    "desc": "Understand base pay, salary ranges, variable pay, and compensation governance.",
    "questions": [
      {
        "q": "What best describes compensation?",
        "opts": [
          "A reporting framework for tracking statutory benefit obligations and employer contributions.",
          "A structured approach to managing employee wellbeing, recognition and career development.",
          "All forms of direct financial reward provided for work performed.",
          "A set of governance policies covering how employees are promoted and evaluated annually."
        ],
        "ans": 2,
        "exp": "Compensation includes base pay, allowances, bonuses, commissions and other financial rewards."
      },
      {
        "q": "Which item is an example of variable pay?",
        "opts": [
          "A health insurance benefit provided as part of the standard employment package.",
          "A statutory pension contribution made by the employer on behalf of all eligible employees.",
          "A fixed monthly salary paid to every employee at the same rate regardless of output.",
          "A performance bonus linked to business results."
        ],
        "ans": 3,
        "exp": "Variable pay changes based on performance, results or defined targets."
      },
      {
        "q": "What is a salary range?",
        "opts": [
          "A minimum, midpoint and maximum pay framework for a role or grade.",
          "A summary of the performance rating scale used during annual review conversations.",
          "A document that outlines the mandatory benefits available to each employee group.",
          "A record of all salary changes made to an individual employee's pay over their career."
        ],
        "ans": 0,
        "exp": "Salary ranges define pay boundaries and target positioning for jobs or grades."
      },
      {
        "q": "What does the salary midpoint usually represent?",
        "opts": [
          "The highest salary the organisation is willing to pay for any role within that grade.",
          "The target market or fully competent pay point for the grade.",
          "The average bonus payout distributed to employees after a strong performance year.",
          "The statutory minimum wage required by employment law in the relevant jurisdiction."
        ],
        "ans": 1,
        "exp": "Midpoint is commonly used as the reference rate for a fully competent employee."
      },
      {
        "q": "What is pay compression?",
        "opts": [
          "When bonus payments are consolidated into base salary at the start of a new cycle, at least according to how this is typically approached in most similar situations.",
          "When performance ratings are distributed too narrowly across a team or department, regardless of the specific design choices made elsewhere in the reward framework.",
          "When pay differences between new and experienced employees become too small.",
          "When a salary structure contains too many grades for the size of the organisation, a consideration that's easy to overlook when reviewing the decision quickly."
        ],
        "ans": 2,
        "exp": "Compression often happens when new hire pay rises faster than pay for existing employees."
      },
      {
        "q": "Which factor should normally influence compensation decisions?",
        "opts": [
          "The number of years the role has existed within the current organisational structure.",
          "The average salary of all employees at the same career stage regardless of function.",
          "The preferences of the most recently appointed department head or business leader.",
          "Role responsibilities, market value, performance, skills and affordability."
        ],
        "ans": 3,
        "exp": "Sound compensation decisions consider multiple legitimate business and people factors."
      },
      {
        "q": "What is total cash compensation?",
        "opts": [
          "Base salary plus cash incentives or bonuses.",
          "The monetary value of all non-cash benefits provided within the total reward package.",
          "The full employer cost of providing benefits, pension and insurance to each employee.",
          "The sum of all payroll deductions made from an employee's gross salary each month."
        ],
        "ans": 0,
        "exp": "Total cash usually includes fixed cash pay plus variable cash pay."
      },
      {
        "q": "Which situation could create internal equity concerns?",
        "opts": [
          "Salary increases applied consistently through a structured merit review and governance process.",
          "A new hire is paid much more than experienced peers without a clear reason.",
          "Two employees in different functions receiving different salaries reflecting different market rates.",
          "A longer-serving employee paid above the range midpoint after sustained strong performance."
        ],
        "ans": 1,
        "exp": "Large unexplained pay differences among comparable employees may create equity concerns."
      },
      {
        "q": "What is one purpose of compensation governance?",
        "opts": [
          "To ensure compensation data is shared with external vendors and specialist consultants.",
          "To delegate all pay decisions to individual managers without a centralised approval process.",
          "To create consistent rules for offers, increases, promotions and exceptions.",
          "To reduce the frequency of market benchmarking exercises and salary survey subscriptions."
        ],
        "ans": 2,
        "exp": "Governance improves consistency, fairness and budget discipline."
      },
      {
        "q": "Which statement is accurate?",
        "opts": [
          "Base pay increases automatically each year at a rate linked to the consumer price index.",
          "Base pay and incentive pay are calculated using the same formula and reviewed together.",
          "Incentive pay is fixed each year and paid regardless of business or personal performance.",
          "Base pay is fixed compensation, while incentives are usually variable."
        ],
        "ans": 3,
        "exp": "Base pay is fixed; incentives depend on performance, results or targets."
      }
    ]
  },
  {
    "id": 3,
    "title": "Benefits Basics",
    "category": "Benefits Management",
    "color": "#3A7D44",
    "bg": "#071A0C",
    "icon": "◧",
    "xp": 150,
    "desc": "Learn employee benefits design, utilization, enrollment and communication.",
    "questions": [
      {
        "q": "What best describes employee benefits?",
        "opts": [
          "Indirect rewards that support employee security, wellbeing or quality of life.",
          "The statutory minimum paid leave entitlement defined by employment law in each country.",
          "The fixed salary paid each month as part of a standard employment arrangement, something that often gets missed when looking only at the surface-level detail.",
          "The variable bonus distributed at year end based on company and individual performance."
        ],
        "ans": 0,
        "exp": "Benefits include programs like health cover, retirement, leave, insurance and wellness support."
      },
      {
        "q": "Which benefit most directly supports long-term financial security?",
        "opts": [
          "A flexible working arrangement that allows employees to adjust their hours each week.",
          "Retirement or pension plan.",
          "A health insurance policy covering primary care, specialist visits and hospitalisation.",
          "An employee recognition programme that acknowledges sustained high performance publicly."
        ],
        "ans": 1,
        "exp": "Retirement and pension benefits help employees prepare for future financial needs."
      },
      {
        "q": "What should a benefits strategy balance?",
        "opts": [
          "The views of the most senior employees and the organisation's most recently hired cohort.",
          "The number of benefit categories available and the volume of policy documentation required.",
          "Employee needs, market practice, affordability and business priorities.",
          "The preferences of HR leadership, the current benefits vendor and the payroll processing team."
        ],
        "ans": 2,
        "exp": "Effective benefits strategy balances workforce value, competitiveness and sustainable cost."
      },
      {
        "q": "Why might employees undervalue a benefits program?",
        "opts": [
          "The benefits are communicated too frequently and employees feel overwhelmed by information.",
          "The benefits are identical to those offered by every comparable employer in the market.",
          "The benefit is too generous and is treated as an entitlement rather than additional value.",
          "They do not understand the coverage, cost or value."
        ],
        "ans": 3,
        "exp": "Poor communication often causes employees to overlook valuable benefits."
      },
      {
        "q": "What is benefit utilization?",
        "opts": [
          "How much or how often eligible employees use a benefit.",
          "The process of enrolling employees into benefit programmes at the start of employment.",
          "The proportion of the total reward budget allocated to benefits versus base pay programmes.",
          "The method used to calculate the employer's statutory contribution to each benefit type."
        ],
        "ans": 0,
        "exp": "Utilization helps HR understand whether a benefit is being used and valued."
      },
      {
        "q": "Which is a common benefits governance question?",
        "opts": [
          "What colour scheme should the annual benefits communication campaign use this year?",
          "Who is eligible and what costs are shared by employer and employee?",
          "How many job levels does the organisation need to support a consistent benefits framework?",
          "What market salary percentile should the organisation target for each professional grade?"
        ],
        "ans": 1,
        "exp": "Eligibility, cost sharing, vendor management and plan rules are core benefits governance issues."
      },
      {
        "q": "What is a practical goal of benefits enrollment communication?",
        "opts": [
          "To reduce the number of vendors the organisation uses for each benefit category.",
          "To standardise all benefit selections so that every employee receives the same package.",
          "To help employees make informed choices before deadlines.",
          "To ensure that benefits spending remains within the prior year's total allocation."
        ],
        "ans": 2,
        "exp": "Enrollment communication should make choices, deadlines and actions clear."
      },
      {
        "q": "Which program is commonly linked to employee wellbeing?",
        "opts": [
          "A career development framework outlining the skills required to move between grade levels.",
          "A structured salary benchmarking process conducted against relevant published market surveys.",
          "A job evaluation panel that assigns point scores to roles across the organisation.",
          "Employee assistance or mental health support."
        ],
        "ans": 3,
        "exp": "Employee assistance and mental health resources support wellbeing."
      },
      {
        "q": "Why should benefits be reviewed periodically?",
        "opts": [
          "Employee needs, vendor performance, costs and market practices can change.",
          "A periodic review reduces the need for employee communication about available programmes.",
          "Regular reviews allow the organisation to add benefits even when employee needs are stable.",
          "Benefits programmes perform better when governance structures are removed or simplified."
        ],
        "ans": 0,
        "exp": "Regular review keeps benefits relevant, competitive and sustainable."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "Benefits are primarily relevant for entry-level roles and less important at senior levels.",
          "Benefits can support attraction, retention and wellbeing when well designed.",
          "Benefits are a statutory obligation that requires no strategic thinking or intentional design.",
          "Benefits play a minor role in reward strategy compared with the impact of variable pay."
        ],
        "ans": 1,
        "exp": "Benefits are a core part of Total Rewards and can strengthen the employee value proposition."
      }
    ]
  },
  {
    "id": 4,
    "title": "Salary Structures",
    "category": "Salary Structure Design",
    "color": "#6B4C9A",
    "bg": "#100818",
    "icon": "◎",
    "xp": 150,
    "desc": "Build knowledge of grades, ranges, spread, governance and pay progression.",
    "questions": [
      {
        "q": "What is the main purpose of a salary structure?",
        "opts": [
          "To provide a fixed list of salaries for every employee regardless of market movement.",
          "To document every salary change made in the organisation over the past five years.",
          "To organize pay decisions using grades, ranges and rules.",
          "To ensure all employees receive the same pay level irrespective of role or contribution."
        ],
        "ans": 2,
        "exp": "Salary structures support consistent and fair pay decisions."
      },
      {
        "q": "Which elements are normally found in a salary range?",
        "opts": [
          "Annual performance rating, probation period and employment contract type.",
          "Grade label, department code and line manager's approval threshold.",
          "Market percentile, job evaluation score and benefits cost per employee.",
          "Minimum, midpoint and maximum."
        ],
        "ans": 3,
        "exp": "The three core range points are minimum, midpoint and maximum."
      },
      {
        "q": "What does range spread measure?",
        "opts": [
          "The width of the salary range from minimum to maximum.",
          "The difference between an employee's base salary and their total cash compensation.",
          "The typical pay increase awarded during the annual merit and salary review cycle.",
          "The number of employees who fall above or below the published salary midpoint."
        ],
        "ans": 0,
        "exp": "Range spread shows how wide a pay range is."
      },
      {
        "q": "An employee paid below the range minimum should usually be:",
        "opts": [
          "Placed on a performance improvement plan regardless of their actual performance level.",
          "Reviewed for possible adjustment, data accuracy and role fit.",
          "Regraded to a lower salary level to restore consistency with the published structure.",
          "Retained at the current salary until they formally request a pay review themselves."
        ],
        "ans": 1,
        "exp": "Below-range pay should be reviewed carefully to understand whether correction is needed."
      },
      {
        "q": "Which statement best describes a salary grade?",
        "opts": [
          "A compliance category used to determine statutory benefit entitlements and deductions.",
          "A fixed pay point that every employee in a given function must receive uniformly.",
          "A grouping of roles with similar internal value or level.",
          "A ranking of individual employees based on their most recent performance appraisal score."
        ],
        "ans": 2,
        "exp": "Grades group jobs of similar value, scope or level."
      },
      {
        "q": "Why are salary structures reviewed over time?",
        "opts": [
          "Because salary data becomes publicly available and requires formal correction each year.",
          "Because external auditors require a complete rebuild of the structure on a fixed schedule.",
          "Because structures need to be redesigned every time a new employee joins the organisation.",
          "Because jobs, markets and business needs change."
        ],
        "ans": 3,
        "exp": "Outdated ranges can weaken competitiveness and fairness."
      },
      {
        "q": "What is range penetration used to understand?",
        "opts": [
          "How far an employee's pay has moved through the salary range.",
          "How the total payroll budget compares to the organisation's overall operating costs.",
          "How closely the organisation's pay is aligned with the statutory minimum wage threshold.",
          "How many employees have been promoted out of a salary grade in a given time period."
        ],
        "ans": 0,
        "exp": "Range penetration measures salary position between minimum and maximum."
      },
      {
        "q": "Which situation suggests possible pay progression concern?",
        "opts": [
          "A mid-tenure employee receiving a modest merit increase following a standard review cycle, something that often gets missed when looking only at the surface-level detail.",
          "A fully experienced strong performer remains far below midpoint for years without explanation.",
          "A senior employee whose salary sits slightly above the midpoint after a series of increases, at least according to how this is typically approached in most similar situations.",
          "A recently hired employee who starts at the range minimum while building role familiarity, regardless of the specific design choices made elsewhere in the reward framework."
        ],
        "ans": 1,
        "exp": "Long-term position far below midpoint may require review, especially for experienced strong performers."
      },
      {
        "q": "Which is a good salary structure governance practice?",
        "opts": [
          "Removing formal salary grades to give managers complete flexibility over all pay decisions.",
          "Updating salary structures in response to individual employee requests without broader review.",
          "Defining approval rules for offers, promotions and exceptions.",
          "Relying on verbal agreements rather than documented rules to handle exceptions and promotions."
        ],
        "ans": 2,
        "exp": "Approval rules support consistency and control."
      },
      {
        "q": "What can happen when salary ranges are poorly managed?",
        "opts": [
          "Employees consistently reach the top of their ranges within the first two years of joining.",
          "Managers develop clearer understanding of how pay decisions should be governed and applied.",
          "Market survey data becomes less relevant as internal pay decisions drive the structure.",
          "Pay inequity, compression and budget inconsistency."
        ],
        "ans": 3,
        "exp": "Weak range governance can create fairness, competitiveness and cost issues."
      }
    ]
  },
  {
    "id": 5,
    "title": "Pay Equity",
    "category": "Pay Equity",
    "color": "#B84B4B",
    "bg": "#1C0808",
    "icon": "◈",
    "xp": 150,
    "desc": "Understand fairness, data analysis, governance and how to close pay gaps.",
    "questions": [
      {
        "q": "What does pay equity mean?",
        "opts": [
          "Pay differences should be fair, explainable and based on legitimate factors.",
          "All employees within the same organisation should receive an identical base salary.",
          "Pay levels should be adjusted annually to match the median income in each geography.",
          "Pay equity refers specifically to closing the gap between the highest and lowest earners."
        ],
        "ans": 0,
        "exp": "Pay equity allows legitimate differences but challenges unfair or unexplained gaps."
      },
      {
        "q": "Which factor may legitimately explain pay differences?",
        "opts": [
          "The department's budget surplus at the start of the financial year when the hire was made.",
          "Relevant experience, skills, performance or role scope.",
          "The length of time since the role was last reviewed by the job evaluation panel.",
          "The employee's willingness to accept a lower salary than their peers during negotiation."
        ],
        "ans": 1,
        "exp": "Pay differences should be tied to relevant job or employee factors."
      },
      {
        "q": "What is a common source of pay inequity?",
        "opts": [
          "A salary structure with clearly defined ranges, midpoints and governance approval rules.",
          "A merit review process that uses calibrated performance ratings across comparable roles.",
          "Inconsistent starting offers without internal equity checks.",
          "A regular benchmarking exercise comparing internal pay to relevant external market data."
        ],
        "ans": 2,
        "exp": "Uncontrolled offers can create gaps that grow over time."
      },
      {
        "q": "Which data is useful for a basic pay equity review?",
        "opts": [
          "Benefits utilisation rates, leave history and the number of training days taken per year, a detail that matters most when reviewing the full range of available options.",
          "Social media profile, academic credentials and prior employer reputation data, which is worth bearing in mind when comparing this to the other alternatives.",
          "Recruitment source, interview score and the hiring manager's overall satisfaction rating, something that often gets missed when looking only at the surface-level detail.",
          "Job, grade, salary, location, tenure, performance and relevant demographics where legally appropriate."
        ],
        "ans": 3,
        "exp": "Pay equity analysis depends on clean job, pay and workforce data."
      },
      {
        "q": "Why should pay equity analysis be handled carefully?",
        "opts": [
          "It involves sensitive employee and compensation information.",
          "It can only be conducted by an external consultant with specialist statistical expertise.",
          "It requires a minimum sample size of five hundred employees before results are meaningful.",
          "It must be completed within a single financial quarter to remain legally valid and defensible."
        ],
        "ans": 0,
        "exp": "Pay equity work involves confidential data and should follow legal and ethical standards."
      },
      {
        "q": "Which action helps prevent future inequity?",
        "opts": [
          "Delegating all pay decisions to department heads without a centralised governance process.",
          "Clear salary ranges, hiring guidelines and approval controls.",
          "Adjusting salaries primarily based on employee feedback and informal peer comparison requests.",
          "Removing structured performance ratings to reduce the influence of manager subjectivity."
        ],
        "ans": 1,
        "exp": "Governance reduces inconsistent decisions and unmanaged exceptions."
      },
      {
        "q": "What does an unexplained pay gap indicate?",
        "opts": [
          "A natural variation in pay reflecting the normal distribution of employee tenure and skills.",
          "A structural feature of most salary frameworks that requires no further investigation.",
          "A potential issue requiring deeper analysis.",
          "A definitive confirmation that salary decisions were made on a discriminatory basis."
        ],
        "ans": 2,
        "exp": "A gap is a signal for further review, not an automatic conclusion."
      },
      {
        "q": "How can pay transparency increase pressure on pay equity?",
        "opts": [
          "It allows employees to negotiate salary increases directly with each other rather than HR.",
          "It simplifies the job evaluation process by removing the need for formal grade definitions.",
          "It reduces the administrative burden on HR teams managing compensation programmes.",
          "Employees may compare ranges and ask for explanations of differences."
        ],
        "ans": 3,
        "exp": "Transparent information often increases the need for clear, fair and explainable pay systems."
      },
      {
        "q": "Which is the best beginner pay equity starting point?",
        "opts": [
          "Compare employees in similar roles or grades and investigate unusual gaps.",
          "Commission an external legal review before conducting any internal compensation analysis.",
          "Run a full multivariate regression analysis across the entire workforce before taking any action.",
          "Publish all individual salaries internally so employees can self-identify and report concerns."
        ],
        "ans": 0,
        "exp": "Peer comparisons within similar work groups are a practical starting point."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "Pay equity initiatives are most effective when led by finance rather than HR professionals.",
          "Pay equity supports fairness, trust and better reward governance.",
          "Pay equity removes the ability to differentiate reward based on legitimate performance factors.",
          "Pay equity is primarily a legal compliance exercise with limited strategic relevance."
        ],
        "ans": 1,
        "exp": "Fair and explainable pay supports both compliance and employee trust."
      }
    ]
  },
  {
    "id": 6,
    "title": "Job Evaluation",
    "category": "Job Evaluation",
    "color": "#C8963E",
    "bg": "#1A1000",
    "icon": "◉",
    "xp": 150,
    "desc": "Evaluate roles fairly using point-factor methods, job families, and governance.",
    "questions": [
      {
        "q": "What does job evaluation assess?",
        "opts": [
          "The employee's suitability for promotion to the next available level in the grade structure.",
          "The financial value the role generates for the organisation based on revenue attribution.",
          "The relative value of a job, not the personal worth of the employee.",
          "The performance contribution of the current role holder over the most recent review period."
        ],
        "ans": 2,
        "exp": "Job evaluation focuses on role content, accountability, complexity and impact."
      },
      {
        "q": "Which document is most useful before evaluating a job?",
        "opts": [
          "A copy of the employee's most recent performance appraisal and development plan.",
          "A summary of the department's headcount budget for the current financial year.",
          "A record of the salary paid to the most recent person who held the same job title.",
          "A current job description."
        ],
        "ans": 3,
        "exp": "A job description provides the duties, responsibilities and context needed for evaluation."
      },
      {
        "q": "Which is a typical job evaluation factor?",
        "opts": [
          "Problem-solving or accountability.",
          "The seniority of the manager the role reports to and their own grade within the structure.",
          "The physical location of the role and the commute time required to reach the office.",
          "The employee's educational background and any professional certifications they currently hold."
        ],
        "ans": 0,
        "exp": "Common factors include knowledge, problem-solving, accountability, impact and working conditions."
      },
      {
        "q": "Why should job evaluation decisions be documented?",
        "opts": [
          "To meet a statutory requirement that applies in every jurisdiction the organisation operates in.",
          "To support consistency, transparency and future review.",
          "To give individual managers the flexibility to adjust grades informally if circumstances change.",
          "To allow the HR team to revisit and revise scores privately without broader stakeholder oversight."
        ],
        "ans": 1,
        "exp": "Documentation helps explain and defend grade decisions."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "Job evaluation is the primary tool used to assess succession planning and talent readiness, at least according to how this is typically approached in most similar situations.",
          "Job evaluation and performance management both address the same underlying question, regardless of the specific design choices made elsewhere in the reward framework.",
          "Job evaluation evaluates role size; performance management evaluates employee contribution.",
          "Job evaluation determines what an employee should be paid at their next review conversation, a consideration that's easy to overlook when reviewing the decision quickly."
        ],
        "ans": 2,
        "exp": "The two processes are related but distinct."
      },
      {
        "q": "What risk comes from relying only on job titles?",
        "opts": [
          "Titles provide sufficient information to determine salary structures without further evaluation.",
          "Job titles consistently and accurately reflect the complexity of roles across all organisations.",
          "Relying on job titles simplifies governance and reduces time spent on formal evaluation.",
          "Different organizations or departments may use titles inconsistently."
        ],
        "ans": 3,
        "exp": "Titles can be misleading; role content matters more."
      },
      {
        "q": "A point-factor method typically uses:",
        "opts": [
          "Defined factors, levels and scoring.",
          "A single holistic judgement made by the most senior person present in the evaluation session.",
          "A ranking of roles from most to least complex without assigning any numerical scores.",
          "A comparison of market salary data against the employee's current pay position in range."
        ],
        "ans": 0,
        "exp": "Point-factor systems score jobs against defined compensable factors."
      },
      {
        "q": "Who should ideally participate in job evaluation governance?",
        "opts": [
          "The individual employee whose role is being evaluated, alongside their direct line manager.",
          "Trained HR/rewards professionals and relevant business stakeholders.",
          "External legal counsel who can confirm compliance with relevant employment legislation.",
          "Senior finance leaders who can assess the budget impact of any proposed grade change."
        ],
        "ans": 1,
        "exp": "Evaluation benefits from trained reviewers and informed stakeholders."
      },
      {
        "q": "Which outcome can job evaluation support?",
        "opts": [
          "Identifying which employees are eligible for inclusion in the annual succession planning process.",
          "Determining the specific bonus amount payable to each employee at the end of the year.",
          "Fair grading and salary structure alignment.",
          "Calculating the statutory benefits contribution owed by the employer for each grade level."
        ],
        "ans": 2,
        "exp": "Job evaluation helps map roles into levels and pay grades."
      },
      {
        "q": "When should a role be considered for re-evaluation?",
        "opts": [
          "Whenever a new person is appointed to the role following an internal or external hire.",
          "At fixed three-year intervals regardless of any change to the role's actual content or scope.",
          "When the employee in the role requests a higher salary at their annual review conversation.",
          "When responsibilities, scope or accountability change significantly."
        ],
        "ans": 3,
        "exp": "Significant role changes may affect job level and grade."
      }
    ]
  },
  {
    "id": 7,
    "title": "Market Pricing",
    "category": "Market Pay",
    "color": "#0E8A82",
    "bg": "#071A18",
    "icon": "◧",
    "xp": 150,
    "desc": "Use salary surveys, percentiles, and job matching to benchmark competitively.",
    "questions": [
      {
        "q": "What is market pricing?",
        "opts": [
          "Comparing jobs to external pay data for similar work.",
          "Calculating the internal value of a role using a structured job evaluation methodology.",
          "Analysing payroll costs as a proportion of total operating revenue for budget planning purposes.",
          "Reviewing salary ranges annually to ensure they remain consistent with the grade structure."
        ],
        "ans": 0,
        "exp": "Market pricing helps organizations understand external pay competitiveness."
      },
      {
        "q": "What is the most important principle in job matching?",
        "opts": [
          "Match by the number of direct reports the role manages in the current structure.",
          "Match by responsibilities, scope and level.",
          "Match by the qualification level typically held by people in comparable roles externally.",
          "Match by the salary band the role sits in internally and the grade it is assigned to."
        ],
        "ans": 1,
        "exp": "Job content is more reliable than title alone."
      },
      {
        "q": "What does the 50th percentile usually represent?",
        "opts": [
          "The average bonus pay received by comparable employees across the relevant industry sector.",
          "The upper quartile pay level used by organisations that lead the market on compensation.",
          "The market median.",
          "The threshold below which an organisation's starting salaries are considered non-competitive."
        ],
        "ans": 2,
        "exp": "The 50th percentile is the median point of the market data."
      },
      {
        "q": "Which issue can weaken market pricing quality?",
        "opts": [
          "Reviewing and refreshing market data on an annual cycle to reflect current pay movement.",
          "Documenting the job matching rationale so decisions can be reviewed and defended later.",
          "Using multiple salary surveys from credible, well-established sources in the relevant market.",
          "Matching jobs poorly or using outdated data."
        ],
        "ans": 3,
        "exp": "Poor matches and stale data can lead to incorrect pay conclusions."
      },
      {
        "q": "Why is external competitiveness important?",
        "opts": [
          "It helps attract and retain talent in relevant labor markets.",
          "It allows the organisation to benchmark benefits costs rather than base pay levels.",
          "It determines the statutory minimum pay level applicable in each operating jurisdiction.",
          "It replaces the need for a structured job evaluation approach across the organisation."
        ],
        "ans": 0,
        "exp": "Competitive pay helps organizations compete for talent."
      },
      {
        "q": "Which is a good market pricing practice?",
        "opts": [
          "Benchmark roles once at initial structure design and avoid any subsequent refreshes.",
          "Use multiple relevant data sources where possible.",
          "Rely primarily on internal salary history to set pay levels for each new hire.",
          "Apply a single national average pay figure uniformly across all locations and functions."
        ],
        "ans": 1,
        "exp": "Multiple relevant sources can improve confidence in market conclusions."
      },
      {
        "q": "What is market positioning strategy?",
        "opts": [
          "Agreeing the frequency of pay review conversations between managers and their direct reports.",
          "Selecting the salary survey provider the organisation will subscribe to each financial year.",
          "Choosing a target pay position such as median or above median.",
          "Determining which job families will be included in the annual benchmarking cycle."
        ],
        "ans": 2,
        "exp": "Organizations may target a percentile based on talent strategy and affordability."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "Market pricing replaces the need for internal pay structures or grading frameworks.",
          "Market pricing should take precedence over internal equity in most compensation decisions.",
          "Market pricing is only relevant when an organisation is actively recruiting for scarce roles.",
          "Market pricing should be balanced with internal equity."
        ],
        "ans": 3,
        "exp": "Pay decisions should consider both market competitiveness and internal fairness."
      },
      {
        "q": "Why might a company target above the market median for some roles?",
        "opts": [
          "The role may be critical, scarce or difficult to hire.",
          "The organisation's philosophy is to target above median for all roles without exception.",
          "The role's salary budget was underspent in the previous cycle and requires reallocation.",
          "The role is straightforward and widely available in the relevant labour market."
        ],
        "ans": 0,
        "exp": "Critical or scarce roles may justify a stronger market position."
      },
      {
        "q": "What should HR check when a new hire requires a high market offer?",
        "opts": [
          "Whether the relevant market survey included this specific role title in its published dataset.",
          "Whether internal compression or equity issues may be created.",
          "Whether the recruiting manager has budget authority to issue an offer at this level.",
          "Whether the candidate's previous employer used the same job evaluation methodology."
        ],
        "ans": 1,
        "exp": "High offers can create internal pay pressure if not managed carefully."
      }
    ]
  },
  {
    "id": 8,
    "title": "Incentives & Variable Pay",
    "category": "Variable Pay",
    "color": "#B84B4B",
    "bg": "#1C0808",
    "icon": "◎",
    "xp": 150,
    "desc": "Design effective incentive plans with clear measures, thresholds and governance.",
    "questions": [
      {
        "q": "What is variable pay?",
        "opts": [
          "A fixed monthly cash payment made to all employees regardless of role or contribution.",
          "A structured recognition programme that acknowledges individual and team effort publicly.",
          "Compensation that varies based on performance, results or defined conditions.",
          "A statutory employer contribution calculated as a percentage of each employee's base salary."
        ],
        "ans": 2,
        "exp": "Variable pay is linked to outcomes, performance or targets."
      },
      {
        "q": "Which plan is most likely a sales incentive?",
        "opts": [
          "A career development programme providing access to training, mentoring and qualifications.",
          "A structured benefits package covering health, retirement and life insurance for all employees.",
          "A merit increase framework linked to performance ratings reviewed during the annual cycle.",
          "Commission based on sales results."
        ],
        "ans": 3,
        "exp": "Sales commissions reward sales performance or revenue generation."
      },
      {
        "q": "What does line of sight mean in incentive design?",
        "opts": [
          "Employees understand and can influence the measured results.",
          "The direct reporting relationship between an employee and their immediate line manager.",
          "The communication process through which incentive plan design decisions are announced.",
          "The degree of visibility employees have into the organisation's financial performance data."
        ],
        "ans": 0,
        "exp": "Incentives work better when employees see how their actions affect outcomes."
      },
      {
        "q": "Which feature should an incentive plan clearly define?",
        "opts": [
          "The internal governance framework that governs how job grades are assigned and reviewed.",
          "Eligibility, measures, targets, payout formula and timing.",
          "The organisation's approach to base salary benchmarking and annual merit review cycles.",
          "The HR team's preferred format for collecting and storing payroll and benefits data annually."
        ],
        "ans": 1,
        "exp": "Clear rules reduce confusion and disputes."
      },
      {
        "q": "Which is a risk of poorly designed incentives?",
        "opts": [
          "They tend to improve employee satisfaction in the short term regardless of overall design quality.",
          "They reduce the administrative cost of running annual compensation and benefits review cycles.",
          "They may encourage unintended behavior or narrow focus.",
          "They make salary structures less relevant by replacing base pay as the primary retention tool."
        ],
        "ans": 2,
        "exp": "Incentives can backfire if measures are too narrow or poorly aligned."
      },
      {
        "q": "What is a performance threshold?",
        "opts": [
          "The highest performance rating achievable within the organisation's standard review framework.",
          "The target payout amount distributed when an employee achieves exactly one hundred percent.",
          "The governance approval level required before a new incentive scheme can be communicated.",
          "The minimum performance level required before payout begins."
        ],
        "ans": 3,
        "exp": "Thresholds define the minimum result needed for incentive eligibility or payout."
      },
      {
        "q": "Which measure would be most relevant for a customer service incentive?",
        "opts": [
          "Customer satisfaction or service quality scores.",
          "The employee's average performance rating over the three most recent review cycles.",
          "Total revenue generated by the business unit over the relevant measurement period.",
          "The number of applications submitted to open roles within the relevant function."
        ],
        "ans": 0,
        "exp": "Measures should align with the role's intended outcomes."
      },
      {
        "q": "Why should incentives be affordable?",
        "opts": [
          "Employees should repay any variable pay received in the previous cycle if targets are missed.",
          "Payout promises must be financially sustainable.",
          "Incentive plans are funded by external investors and do not affect the operational budget.",
          "Affordability is primarily a concern for benefits programmes rather than incentive plans."
        ],
        "ans": 1,
        "exp": "An incentive plan loses credibility if the organization cannot fund earned payouts."
      },
      {
        "q": "Which statement is most accurate?",
        "opts": [
          "A good incentive plan offers large payouts with minimal connection to business performance.",
          "A good incentive plan is administered entirely by employees rather than the HR or finance team.",
          "A good incentive plan is clear, measurable, aligned and governed.",
          "A good incentive plan is redesigned every quarter to reflect the latest business priorities."
        ],
        "ans": 2,
        "exp": "Clarity, measurable goals and governance are central to effective incentives."
      },
      {
        "q": "Which incentive design question should HR ask first?",
        "opts": [
          "What is the simplest structure that can be implemented before the next payroll cycle?",
          "How large should the maximum payout be relative to each participant's base salary?",
          "How many employees across the organisation should be included in the eligible population?",
          "What behavior or outcome should this plan encourage?"
        ],
        "ans": 3,
        "exp": "Purpose should drive plan design."
      }
    ]
  },
  {
    "id": 9,
    "title": "Rewards Communication",
    "category": "Rewards Communication",
    "color": "#3A7D44",
    "bg": "#071A0C",
    "icon": "◈",
    "xp": 150,
    "desc": "Communicate pay, benefits and Total Rewards clearly across the employee lifecycle.",
    "questions": [
      {
        "q": "Why is rewards communication important?",
        "opts": [
          "It helps employees understand the purpose, value and rules of reward programs.",
          "It enables the organisation to reduce the cost of benefits and compensation programmes.",
          "It allows managers to avoid answering individual questions about pay and total rewards.",
          "It gives HR teams the evidence needed to justify changes to the salary structure annually."
        ],
        "ans": 0,
        "exp": "Clear communication improves understanding and trust."
      },
      {
        "q": "What is a total rewards statement?",
        "opts": [
          "A formal legal document outlining the terms of the employment contract in full detail.",
          "A summary of the value of pay, benefits and other rewards.",
          "A monthly payslip showing gross salary, deductions and net pay for each period.",
          "A performance appraisal summary covering contribution, ratings and development goals."
        ],
        "ans": 1,
        "exp": "Total rewards statements show employees the broader value of their rewards package."
      },
      {
        "q": "Which communication style is best for explaining benefits to employees?",
        "opts": [
          "A presentation designed for HR and finance teams that uses technical compensation terminology.",
          "A single annual email sent to all employees regardless of their circumstances or needs.",
          "Clear, practical language with examples and actions.",
          "Dense policy-style text that covers every possible scenario and exception in full detail."
        ],
        "ans": 2,
        "exp": "Simple explanations and examples help employees make informed choices."
      },
      {
        "q": "Why should managers be trained in reward communication?",
        "opts": [
          "They conduct pay equity audits and present findings to the board and executive leadership.",
          "They are responsible for designing salary structures and setting market positioning strategy.",
          "They approve all benefits enrolment decisions and manage relationships with external vendors.",
          "They often answer employee questions about pay and benefits."
        ],
        "ans": 3,
        "exp": "Managers need consistent guidance for sensitive pay and benefits conversations."
      },
      {
        "q": "Which message is most useful during benefits enrollment?",
        "opts": [
          "A clear explanation of choices, eligibility, deadlines and support contacts.",
          "A comparison of the organisation's benefits against those offered by three named competitors.",
          "A detailed breakdown of the organisation's total payroll cost and benefits spend for the year.",
          "A reminder that benefits choices made this cycle are fixed and cannot be changed at any point."
        ],
        "ans": 0,
        "exp": "Enrollment messages should help employees act correctly and on time."
      },
      {
        "q": "What is one risk of poor rewards communication?",
        "opts": [
          "The organisation may need to redesign its salary structure sooner than originally planned.",
          "Employees may undervalue or misunderstand programs.",
          "HR teams may spend more time on payroll processing and less on strategic reward design.",
          "The total cost of benefits and compensation programmes increases in the absence of communication."
        ],
        "ans": 1,
        "exp": "Lack of understanding can reduce perceived value and trust."
      },
      {
        "q": "Which communication channel can be useful for explaining complex rewards topics?",
        "opts": [
          "A comprehensive technical policy document distributed once at the start of the financial year.",
          "A mandatory training module that covers compensation governance rather than employee content.",
          "A mix of FAQs, webinars, manager guides, infographics and employee statements.",
          "A single Q&A session held centrally for the entire workforce without any follow-up materials."
        ],
        "ans": 2,
        "exp": "Multiple channels support different learning preferences and complexity levels."
      },
      {
        "q": "Which statement should HR avoid?",
        "opts": [
          "Using real examples from the organisation's salary structure to illustrate how ranges work.",
          "Providing clear written guidance to managers ahead of annual pay review conversations.",
          "Explaining the factors that influence salary decisions during structured manager briefings.",
          "Making promises about pay outcomes that are not approved or funded."
        ],
        "ans": 3,
        "exp": "Unapproved promises damage trust and create risk."
      },
      {
        "q": "What does good rewards communication support?",
        "opts": [
          "Trust, understanding and better employee decisions.",
          "A reduction in the number of market surveys the organisation needs to purchase annually.",
          "A simplified governance structure that allows faster approval of salary and benefits changes.",
          "An increase in the proportion of base pay allocated to fixed rather than variable compensation."
        ],
        "ans": 0,
        "exp": "Communication helps employees understand what exists, why it exists and how to use it."
      },
      {
        "q": "When should rewards communication happen?",
        "opts": [
          "During the annual pay review cycle only, when employees are most focused on compensation, which tends to hold true across most comparable organisations in this context.",
          "Across the employee lifecycle, including hiring, onboarding, review and enrollment moments.",
          "At the beginning of each calendar year alongside the publication of the financial results, though this can vary depending on the specific circumstances and business context.",
          "When significant regulatory or legislative changes require a formal response from the HR team, a detail that matters most when reviewing the full range of available options."
        ],
        "ans": 1,
        "exp": "Rewards messages are most effective when repeated at relevant moments."
      }
    ]
  },
  {
    "id": 10,
    "title": "Career Readiness",
    "category": "Total Rewards Career",
    "color": "#2E7D8C",
    "bg": "#071C22",
    "icon": "◉",
    "xp": 150,
    "desc": "Test your readiness to work in Total Rewards with scenario-based career questions.",
    "questions": [
      {
        "q": "Which skill is especially important for a rewards analyst?",
        "opts": [
          "Experience managing vendor relationships and negotiating benefits renewal contracts.",
          "Expertise in graphic design and brand communication for internal HR campaign materials.",
          "Data analysis and spreadsheet confidence.",
          "Knowledge of employment law across multiple jurisdictions and statutory compliance frameworks."
        ],
        "ans": 2,
        "exp": "Rewards analysts work with pay data, surveys, budgets and workforce information."
      },
      {
        "q": "Why is business acumen important in Total Rewards?",
        "opts": [
          "It allows rewards professionals to present findings in a more engaging and creative way.",
          "It enables rewards professionals to make pay decisions without referencing governance frameworks.",
          "It reduces the need to engage with HR business partners or other stakeholders across the team.",
          "Rewards decisions affect cost, talent, performance and competitiveness."
        ],
        "ans": 3,
        "exp": "Rewards professionals must connect people programs to business priorities."
      },
      {
        "q": "Which portfolio item would help an aspiring rewards professional?",
        "opts": [
          "A sample salary structure with compa-ratio analysis.",
          "A collection of job advertisements reviewed and summarised for a recruitment assignment.",
          "A presentation on employee engagement survey trends prepared for a generalist HR project.",
          "A written summary of the organisation's approach to talent acquisition and graduate hiring."
        ],
        "ans": 0,
        "exp": "A practical, anonymized portfolio shows applied compensation capability."
      },
      {
        "q": "Why is confidentiality essential in Total Rewards?",
        "opts": [
          "Rewards data is published in statutory reports and must be handled with formal legal protocols.",
          "Rewards professionals handle sensitive pay, performance and employee data.",
          "Confidentiality requirements apply specifically to executive pay and not to broader workforce data.",
          "Rewards professionals are required to sign non-disclosure agreements with external vendors."
        ],
        "ans": 1,
        "exp": "Sensitive reward information must be handled ethically and securely."
      },
      {
        "q": "Which learning path is most useful for a beginner?",
        "opts": [
          "Focus initially on long-term incentive plan design and executive compensation governance, at least according to how this is typically approached in most similar situations.",
          "Begin with advanced statistical modelling techniques before covering foundational pay concepts, regardless of the specific design choices made elsewhere in the reward framework.",
          "Start with salary structures, benefits, job evaluation, market pricing and pay equity basics.",
          "Study international mobility and expatriate rewards before understanding domestic pay structures, a consideration that's easy to overlook when reviewing the decision quickly."
        ],
        "ans": 2,
        "exp": "A strong foundation prepares learners for more advanced rewards work."
      },
      {
        "q": "What makes Total Rewards a strategic HR field?",
        "opts": [
          "It deals mainly with statutory compliance and the administration of legally mandated programmes.",
          "It is largely self-contained and rarely requires engagement with senior leadership or finance.",
          "It focuses primarily on administrative processes that support payroll and benefits operations.",
          "It connects employee value, business cost, performance and talent strategy."
        ],
        "ans": 3,
        "exp": "Total Rewards influences workforce behavior, cost and competitiveness."
      },
      {
        "q": "Which behavior shows career readiness in rewards?",
        "opts": [
          "Asking how pay decisions are governed and supported by data.",
          "Limiting questions to processes rather than the reasoning or evidence behind any decision.",
          "Accepting pay decisions at face value and implementing them without seeking further context.",
          "Focusing on technical skills alone without developing broader business or stakeholder awareness."
        ],
        "ans": 0,
        "exp": "Curiosity about governance and data signals professional maturity."
      },
      {
        "q": "Why should rewards professionals keep learning?",
        "opts": [
          "Rewards frameworks are relatively stable once established and require limited ongoing attention.",
          "Markets, laws, technology and employee expectations change.",
          "Professional development in rewards is mainly relevant for those moving into management roles.",
          "Keeping current is primarily important in markets with frequent regulatory or legislative changes."
        ],
        "ans": 1,
        "exp": "Continuous learning is essential in a changing rewards environment."
      },
      {
        "q": "Which combination best describes a future-ready rewards professional?",
        "opts": [
          "Broad generalist HR experience without specialised knowledge of compensation or reward design.",
          "Strong financial modelling capability paired with a primarily compliance-focused mindset.",
          "Data, empathy, communication, ethics and business judgment.",
          "Deep technical expertise in benefits administration with limited stakeholder engagement skills."
        ],
        "ans": 2,
        "exp": "The future rewards role combines analytical and human-centered capability."
      },
      {
        "q": "What is a good first step for an HR generalist moving into Total Rewards?",
        "opts": [
          "Complete a postgraduate qualification in human resource management before seeking any exposure.",
          "Request a sideways move into a finance or accounting role to build commercial experience first.",
          "Shadow an executive compensation specialist before gaining any foundational rewards exposure.",
          "Volunteer for salary review, benefits communication or job description projects."
        ],
        "ans": 3,
        "exp": "Project exposure helps build practical rewards experience."
      }
    ]
  },
  {
    "id": 11,
    "title": "Variable Pay & Incentive Design",
    "category": "Variable Pay & Incentive Design",
    "color": "#0C6B65",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of variable pay & incentive design.",
    "questions": [
      {
        "q": "What is 'line of sight' in incentive plan design?",
        "opts": [
          "The maximum visible range a manager can supervise their direct reports from.",
          "The degree to which an employee can connect their daily decisions to the incentive metric.",
          "The administrative distance between a participant's grade and the plan's target bonus.",
          "A formal escalation path used when an incentive payout is disputed."
        ],
        "ans": 1,
        "exp": "Line of sight is the core test of whether an incentive plan will actually change behaviour — without it, the plan functions as a lottery rather than a motivational tool."
      },
      {
        "q": "An STI plan pays out 95% of maximum in a year when company revenue missed target by 4%. The remuneration committee used upward discretion to override the formula. What is required for this to be defensible?",
        "opts": [
          "No additional justification is needed since remuneration committees have absolute discretion.",
          "A documented exceptional circumstances justification and specific shareholder engagement before implementation.",
          "Approval from the company's statutory auditors before the payout is distributed.",
          "A binding shareholder vote at an extraordinary general meeting."
        ],
        "ans": 1,
        "exp": "Upward discretion on formula outcomes requires documented justification and ideally proactive shareholder engagement — undocumented upward overrides are a common source of AGM opposition."
      },
      {
        "q": "A threshold in an STI plan is best described as:",
        "opts": [
          "The maximum bonus payable in any single plan year.",
          "The minimum performance level before any payout occurs.",
          "The performance level at which 100% of target bonus is paid.",
          "The midpoint between the minimum and maximum payout levels."
        ],
        "ans": 1,
        "exp": "The threshold is the minimum performance gate — below this level, no payout occurs regardless of other performance, protecting the plan from paying out in genuinely poor performance years."
      },
      {
        "q": "'Gain-sharing' differs from 'profit-sharing' primarily because:",
        "opts": [
          "Gain-sharing distributes profit to all employees while profit-sharing is limited to senior roles.",
          "Gain-sharing ties payouts to specific measurable operational improvements rather than overall company profit.",
          "Gain-sharing is legally required in most jurisdictions while profit-sharing is entirely voluntary.",
          "Gain-sharing has no threshold while profit-sharing always requires a minimum performance gate."
        ],
        "ans": 1,
        "exp": "Gain-sharing focuses on specific, proximate metrics (cost reduction, productivity, quality) that team members can directly influence — creating stronger line of sight than a broad profit-sharing plan."
      },
      {
        "q": "A rolling quarterly commission cap addresses which specific problem caused by an annual cap?",
        "opts": [
          "It prevents reps from earning more than the organisation can budget annually.",
          "It prevents reps who reach the annual cap mid-year from losing financial motivation for the remaining quarters.",
          "It allows reps to carry forward unused commission capacity from one quarter to the next.",
          "It synchronises the commission calculation with the quarterly financial reporting cycle."
        ],
        "ans": 1,
        "exp": "Reps who hit an annual cap by September have no incentive to sell for the rest of the year — a quarterly rolling cap resets the ceiling each quarter, preserving year-round motivation."
      },
      {
        "q": "A clawback clause in a bonus plan allows the organisation to:",
        "opts": [
          "Defer payment of the bonus for up to 24 months after it would otherwise be due.",
          "Recover bonuses already paid if the underlying performance was subsequently found to be misstated.",
          "Reduce future bonus targets for participants who received above-target payouts in prior years.",
          "Withhold bonus payments pending completion of a formal performance review."
        ],
        "ans": 1,
        "exp": "Clawbacks operate retroactively — they allow recovery of an already-paid bonus when the performance basis for it is later found to be invalid, such as through discovered fraud or material misstatement."
      },
      {
        "q": "The 60/30/10 distribution rule in quota calibration refers to:",
        "opts": [
          "60% of revenue from top performers, 30% from mid-performers, 10% from below-average performers.",
          "In a good performance year, 60% at or above quota, 30% between 80-100%, and 10% below 80%.",
          "60% commission paid quarterly, 30% annually, and 10% deferred for 2 years.",
          "A target pay mix of 60% base salary, 30% target variable, and 10% benefits allocation."
        ],
        "ans": 1,
        "exp": "The 60/30/10 distribution is the primary calibration diagnostic for quota-setting — consistently outside this range signals either quotas are too easy or too hard."
      },
      {
        "q": "In a balance sheet approach to expatriate compensation, the employer covers the cost-of-living allowance (COLA). COLA specifically covers:",
        "opts": [
          "The total cost of housing in the host country.",
          "The difference in non-housing goods and services costs between host and home country.",
          "The employee's income tax liability in both the home and host countries.",
          "The cost of international school fees for dependent children."
        ],
        "ans": 1,
        "exp": "COLA is specifically the differential on non-housing spending — housing is addressed separately through a housing allowance, so the two components don't overlap."
      },
      {
        "q": "A commission plan with a pay mix of 40:60 (base:variable) is most appropriate for which type of role?",
        "opts": [
          "An account manager focused primarily on renewing existing customer contracts.",
          "A pure new-business sales role with direct, individually attributable revenue outcomes.",
          "A customer success manager focused on retention and relationship management.",
          "A sales director with primary responsibility for coaching and developing a team of reps."
        ],
        "ans": 1,
        "exp": "A lower base/higher variable pay mix is appropriate for roles with direct, individual revenue attribution — pure new-business roles typically justify the highest variable weighting."
      },
      {
        "q": "Which of the following is a 'gate' rather than a 'modifier' in STI plan governance?",
        "opts": [
          "An individual performance factor that scales payout between 0.8x and 1.2x based on rating.",
          "A quality metric that adjusts the payout percentage by up to 20% based on defect rates.",
          "A profitability requirement below which no payout occurs regardless of other metrics.",
          "A weighting adjustment that reduces the revenue component from 70% to 60% in loss years."
        ],
        "ans": 2,
        "exp": "A gate is binary — it either blocks payout (if breached) or doesn't. A modifier continuously scales the payout. The profitability requirement that produces zero payout is a gate; the adjustments in the other options are modifiers."
      }
    ]
  },
  {
    "id": 12,
    "title": "Benefits Design & Administration",
    "category": "Benefits Design & Administration",
    "color": "#6B4C9A",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of benefits design & administration.",
    "questions": [
      {
        "q": "A 'paternalistic' benefits philosophy means:",
        "opts": [
          "The organisation requires employees to contribute a minimum percentage to receive any employer benefit.",
          "The organisation decides what employees need and provides it uniformly to all eligible employees.",
          "Benefits are provided primarily through voluntary contribution schemes that employees fund themselves.",
          "The organisation offers benefits only in response to statutory requirements in each jurisdiction."
        ],
        "ans": 1,
        "exp": "Paternalistic benefits philosophy: the organisation makes the decisions about what employees need and provides it uniformly — high consistency, lower personalisation than flex approaches."
      },
      {
        "q": "Why should benefits spend be tracked as a percentage of payroll rather than as a total dollar amount?",
        "opts": [
          "Employment law in most jurisdictions requires payroll-percentage reporting for benefits.",
          "It normalises for organisational size and allows meaningful comparison against industry benchmarks.",
          "Total dollar amounts are too volatile year-on-year to be used as a reliable management metric.",
          "The payroll percentage is the only format that salary survey providers report benefits data in."
        ],
        "ans": 1,
        "exp": "Tracking benefits as a % of payroll creates a size-normalised metric that can be compared across organisations and against published industry benchmarks — unlike total dollar amounts which vary simply with headcount."
      },
      {
        "q": "In an insured health plan, who bears the primary risk of high-cost claims?",
        "opts": [
          "The employer, since they pay the premium regardless of actual claims.",
          "The insurance carrier, who pools risk across all their insured groups.",
          "The employee, since their premium contributions increase following high-claim years.",
          "A government health fund that backstops private insurance claims above a threshold."
        ],
        "ans": 1,
        "exp": "Under an insured plan, the carrier pools risk — the employer pays a fixed premium and the carrier absorbs claims risk. A self-insured plan reverses this, with the employer bearing claims risk directly."
      },
      {
        "q": "An Employee Assistance Programme (EAP) first-year utilisation rate of 11% is:",
        "opts": [
          "A sign the benefit was the wrong choice and should be replaced.",
          "Within the typical range for a new EAP launch — the relevant metric is whether utilisation trends upward over subsequent periods.",
          "Evidence that the programme needs significant marketing investment to reach an adequate utilisation level.",
          "Below the minimum threshold required for the employer to retain the benefit without renegotiation."
        ],
        "ans": 1,
        "exp": "EAP programmes are accessed during specific life moments, not routinely — first-year utilisation of 10-15% is the expected range, and improving trend over time is the meaningful success indicator."
      },
      {
        "q": "A 'core plus choice' benefits model differs from a full cafeteria plan primarily in that:",
        "opts": [
          "It is available only to organisations with more than 500 employees.",
          "It provides a universal employer-funded core tier with a defined flexible allowance above it, rather than fully open choice.",
          "Employees make their benefits selections annually rather than during a defined enrolment window.",
          "Tax-advantaged benefits cannot be included in core plus choice plans."
        ],
        "ans": 1,
        "exp": "Core plus choice provides baseline protection universally (core) with personalisation through a capped allowance (choice) — capturing most of the flex benefit's personalisation value with significantly lower administrative complexity than a full cafeteria."
      },
      {
        "q": "The primary purpose of a family needs assessment before an international assignment is:",
        "opts": [
          "To verify the employee's family members are eligible for the host-country visa category.",
          "To identify family-related risks — spouse employment, schooling, social networks — that could cause the assignment to fail.",
          "To calculate the housing allowance amount by assessing the family's accommodation requirements.",
          "To confirm the number of dependants for school fees calculation and cost modelling."
        ],
        "ans": 1,
        "exp": "Family adjustment difficulties are the leading cause of international assignment failure — the family needs assessment is specifically designed to identify these risks before the assignment is agreed, not after they become mid-assignment crises."
      },
      {
        "q": "Nigeria's Pension Reform Act sets the minimum employer pension contribution at:",
        "opts": [
          "5% of monthly basic salary.",
          "8% of monthly emoluments.",
          "10% of monthly emoluments.",
          "15% of total annual compensation."
        ],
        "ans": 2,
        "exp": "The Pension Reform Act sets the minimum employer contribution at 10% of monthly emoluments. Many competitive employers contribute 12% or more, but 10% is the statutory floor."
      },
      {
        "q": "A matching pension contribution structure (employer matches employee contributions) disadvantages which employees most?",
        "opts": [
          "High earners who prefer to save through other vehicles rather than pension contributions.",
          "Employees with high financial literacy who contribute above the employer matching cap.",
          "Employees who cannot afford to contribute themselves and therefore receive no employer contribution.",
          "Part-time employees whose pro-rated contributions fall below the minimum match threshold."
        ],
        "ans": 2,
        "exp": "The matching structure requires employee contribution to activate employer contribution — employees who can't afford to contribute get nothing, while employees who can contribute get full matching, creating unequal outcomes by financial capacity."
      },
      {
        "q": "Auto-enrolment's primary governance design question is:",
        "opts": [
          "Whether to include part-time employees in the enrolled population.",
          "What the default contribution rate and default investment fund are, since most employees never change these.",
          "Whether to require employee consent before enrolment is completed.",
          "How frequently to run the annual re-enrolment process for the eligible population."
        ],
        "ans": 1,
        "exp": "Auto-enrolment's effectiveness rests on inertia — the same inertia that drives participation means most employees stay on defaults forever, making the default contribution rate and default fund the most consequential design decisions."
      },
      {
        "q": "A self-certification approach to benefit eligibility (e.g., for childcare vouchers) balances accuracy with practicality by:",
        "opts": [
          "Eliminating all false eligibility claims through automated cross-referencing with government records.",
          "Requiring employees to declare eligibility, with a stated audit process to deter false claims, rather than requiring documentary proof at selection.",
          "Limiting eligibility to employees who have provided documentary proof in previous enrolment cycles.",
          "Using a random sampling approach to verify eligibility across 25% of all claimants each year."
        ],
        "ans": 1,
        "exp": "Self-certification with a stated audit deters misselection without creating the friction and delay of requiring documentary proof at the point of selection — the balance of accuracy versus enrolment simplicity."
      }
    ]
  },
  {
    "id": 13,
    "title": "Executive Compensation & Long-Term Incentives",
    "category": "Executive Compensation & Long-Term Incentives",
    "color": "#B84B4B",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of executive compensation & long-term incentives.",
    "questions": [
      {
        "q": "The primary purpose of a remuneration committee's independence from executive management is:",
        "opts": [
          "To reduce the cost of external compensation advisor fees through arm's-length negotiation.",
          "To remove the conflict of interest that would arise if executives were involved in setting their own pay.",
          "To provide legal protection for the board if executive pay decisions are later challenged.",
          "To ensure salary decisions are made on a quarterly rather than annual basis."
        ],
        "ans": 1,
        "exp": "The remuneration committee's independence is specifically designed to resolve the inherent conflict of interest in executive pay: the people who benefit most from generous pay should not be setting it."
      },
      {
        "q": "A Performance Share Unit (PSU) differs from a time-vested RSU in that:",
        "opts": [
          "PSUs are only available to employees above a specified grade threshold.",
          "The number of PSU shares vesting depends on performance outcomes, not just continued employment.",
          "PSUs always settle in cash rather than actual shares.",
          "PSUs have a shorter vesting period than RSUs by convention."
        ],
        "ans": 1,
        "exp": "PSUs have variable vesting based on performance — the actual shares delivered can range from 0% to 200% of the target award depending on how the company performs against defined metrics."
      },
      {
        "q": "Stock options are 'underwater' when:",
        "opts": [
          "The exercise price exceeds the current market share price, making the option worthless to exercise.",
          "The vesting conditions have not yet been satisfied by the executive.",
          "The option has not been formally accepted by the grantee within the acceptance window.",
          "The option life has expired without the executive exercising it."
        ],
        "ans": 0,
        "exp": "An underwater option has an exercise price above market — exercising it would mean buying shares above their current market value, which is economically irrational."
      },
      {
        "q": "Which equity vehicle is most appropriate for a PE-backed company approaching a planned exit?",
        "opts": [
          "Time-vested RSUs linked to a fixed 4-year vesting schedule.",
          "Stock options with a 10-year exercise window from grant date.",
          "Management equity participation structured to pay out at the exit event.",
          "Phantom equity settled annually based on estimated enterprise value."
        ],
        "ans": 2,
        "exp": "PE-backed equity structures should align with the exit event that drives the PE owner's own return — management equity participation that pays at IPO, trade sale, or fund realisation creates the strongest possible alignment."
      },
      {
        "q": "Tax equalization in an expatriate package means:",
        "opts": [
          "The employer and employee split all tax liabilities 50/50 regardless of which country they arise in.",
          "The employee pays hypothetical home-country tax; the employer bears any actual tax above this in the host country.",
          "Both home and host country tax rates are averaged to produce a single blended rate.",
          "Tax is waived for expatriates in most host countries under bilateral tax treaty provisions."
        ],
        "ans": 1,
        "exp": "Tax equalization holds the employee to their home-country tax position — they pay what they would have paid at home, and the employer bears any additional host-country liability above that amount."
      },
      {
        "q": "A post-employment shareholding requirement is designed to:",
        "opts": [
          "Prevent executives from selling shares during their notice period.",
          "Extend alignment and retention beyond the vesting date by requiring executives to hold shares for a period after leaving.",
          "Replace the post-vesting holding period that applies during employment.",
          "Ensure executives maintain a minimum share ownership to qualify for future LTI grants."
        ],
        "ans": 1,
        "exp": "Post-employment holding requirements solve the 'vest and leave' problem — they extend the alignment mechanism beyond the vesting date and beyond the executive's tenure, maintaining skin in the game after they leave."
      },
      {
        "q": "The CEO pay ratio in the UK compares the CEO's single figure of remuneration to:",
        "opts": [
          "The median pay of the top 10% of the UK workforce.",
          "The P25, P50, and P75 pay of the company's UK employee population.",
          "The average pay of the company's five highest-paid employees below the CEO.",
          "The median pay of the CEO's direct reports."
        ],
        "ans": 1,
        "exp": "The UK requires three ratios — CEO single figure versus the P25, P50, and P75 of the UK workforce — providing three reference points rather than a single comparison."
      },
      {
        "q": "A 'double trigger' acceleration provision for equity awards means:",
        "opts": [
          "The award vests at twice the normal rate once both performance conditions are met.",
          "Full vesting occurs only if both a qualifying exit event AND termination without cause (or resignation for good reason) occur.",
          "The vesting period doubles if the grantee changes roles within the organisation.",
          "Two consecutive performance period results are required before any vesting begins."
        ],
        "ans": 1,
        "exp": "Double trigger protection is standard in PE and VC-backed equity: it protects executives from being acquired and dismissed without reward while preserving retention incentives through the post-exit transition period."
      },
      {
        "q": "IFRS2 requires equity-based compensation to be:",
        "opts": [
          "Disclosed in footnotes only, without impacting the income statement.",
          "Expensed through the income statement at fair value over the vesting period.",
          "Capitalised as an asset and amortised over the employee's expected service life.",
          "Recorded only when options are exercised or RSUs vest, not at grant date."
        ],
        "ans": 1,
        "exp": "IFRS2 requires the fair value of equity awards to be recognised as a compensation expense in the income statement over the vesting period — making equity compensation have a real P&L impact even without cash changing hands."
      },
      {
        "q": "Institutional investors typically expect non-financial performance conditions in LTI plans to use externally benchmarked data primarily because:",
        "opts": [
          "External data sources are legally required by securities regulations in most listed company jurisdictions.",
          "It prevents the company from meeting the condition by changing internal methodology rather than achieving genuine improvement.",
          "Third-party data sources produce more favourable performance outcomes for executives.",
          "External benchmarks reduce the administrative cost of tracking and reporting LTI performance."
        ],
        "ans": 1,
        "exp": "Non-financial conditions measured using internal data that management controls can be gamed — an external benchmark (industry survey norm, third-party ESG rating) ensures the condition measures genuine improvement."
      }
    ]
  },
  {
    "id": 14,
    "title": "Sales Compensation Design",
    "category": "Sales Compensation Design",
    "color": "#3A7D44",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of sales compensation design.",
    "questions": [
      {
        "q": "Target Total Compensation (TTC) is the preferred benchmarking unit for sales roles because:",
        "opts": [
          "It is the only metric reported by major salary surveys for sales functions.",
          "It captures both base salary and target variable, reflecting total expected earnings at target performance.",
          "It is a legally required disclosure for any role with commission-based pay.",
          "TTC is equivalent to the 75th percentile of base salary for comparable sales roles."
        ],
        "ans": 1,
        "exp": "Sales roles have significant variable components — benchmarking base salary alone misses the variable portion that can account for 30-50%+ of total earnings, making TTC the only accurate competitive comparison."
      },
      {
        "q": "A pay mix of 70:30 (base:variable) is most appropriate for which sales role type?",
        "opts": [
          "A pure new-business hunter with direct, individually attributable deal revenue.",
          "An account manager focused on renewals and relationship management with lower revenue attribution volatility.",
          "A regional sales director managing a team of eight inside sales representatives.",
          "A channel partnerships manager developing indirect sales through reseller relationships."
        ],
        "ans": 1,
        "exp": "Renewal-focused account management has lower revenue attribution volatility — a higher base reflects the more consistent, relationship-oriented nature of the role and attracts the talent profile suited to it."
      },
      {
        "q": "The 'cliff effect' in a threshold-based commission plan occurs when:",
        "opts": [
          "The commission rate doubles abruptly at the target level, creating an unsustainable budget exposure.",
          "A rep tracking clearly below threshold has no realistic chance of reaching commission territory, removing their motivation.",
          "The annual commission cap is reached before year-end, eliminating Q4 selling incentive.",
          "Multiple commission plans with different thresholds apply simultaneously, creating conflicting incentives."
        ],
        "ans": 1,
        "exp": "The cliff effect describes the demotivation when below-threshold reps see no realistic path to earning commission in the current period — no financial motivation exists to continue selling when the threshold cannot be reached."
      },
      {
        "q": "A SPIF (Short-Term Performance Incentive Fund) is most effective when:",
        "opts": [
          "Applied as a permanent addition to the commission plan to reward consistent performance.",
          "Used sparingly for a defined behaviour over a brief, named period — creating a specific, temporary incentive.",
          "Deployed broadly across all sales roles simultaneously during quarterly revenue shortfalls.",
          "Offered as an alternative to commission for reps who prefer immediate cash over variable pay."
        ],
        "ans": 1,
        "exp": "SPIFs lose their motivational power when overused — their value is in feeling exceptional and specific, targeting a defined behaviour change over a brief period before becoming expected income."
      },
      {
        "q": "A draw arrangement for a new sales hire is best described as:",
        "opts": [
          "A guaranteed base salary paid for the first 6 months before commission becomes available.",
          "An advance against future commission earnings, which may or may not require repayment.",
          "A temporary commission rate reduction while the rep builds their pipeline.",
          "A discretionary bonus paid at manager approval during the ramp period."
        ],
        "ans": 1,
        "exp": "A draw is an advance against future commissions — a recoverable draw must be repaid from future earnings, while an unrecoverable draw does not create a repayment obligation."
      },
      {
        "q": "Territory equalisation in quota-setting is designed to ensure:",
        "opts": [
          "All reps receive identical quotas regardless of their assigned territory or account base.",
          "The difficulty of achieving quota is comparable across reps with different territory opportunity characteristics.",
          "Territory assignments are rotated annually to prevent over-reliance on established account relationships.",
          "Quota achievement is measured relative to territory peer groups rather than in absolute revenue terms."
        ],
        "ans": 1,
        "exp": "Without equalisation, quota attainment becomes a function of territory quality rather than individual rep performance — equalisation creates comparable degrees of difficulty so the metrics reflect actual effort."
      },
      {
        "q": "The annual sales compensation planning cycle should ideally begin:",
        "opts": [
          "In January of the plan year, once prior-year results are confirmed.",
          "In the first week of December, allowing 3-4 weeks before the plan year start.",
          "In Q3 of the prior year, allowing time for design, modelling, and stakeholder review.",
          "After the company's annual budget process is finalised in November."
        ],
        "ans": 2,
        "exp": "Starting in Q3 of the prior year allows adequate time for strategy alignment, plan design, modelling, stakeholder approvals, manager briefings, and rep communication before the plan year begins."
      },
      {
        "q": "When an acquired sales team is integrated mid-year, the bridge plan approach is preferred over immediate plan transition because:",
        "opts": [
          "It satisfies employment law requirements in most jurisdictions for acquired employees.",
          "It protects income continuity and commits to a clear transition date, reducing attrition risk during the highest-risk post-acquisition window.",
          "It allows Finance to maintain separate accounting for the acquired team's commission expense.",
          "It gives HR time to complete job evaluations for all acquired sales roles before assigning them to the standard plan."
        ],
        "ans": 1,
        "exp": "The bridge plan specifically addresses the two primary attrition triggers: income shock at transition and uncertainty about when full integration will happen — making it the lowest-risk approach despite higher design complexity."
      },
      {
        "q": "Revenue attribution disputes most commonly arise in which scenario?",
        "opts": [
          "When a rep changes territories mid-year and prior-territory deals close after the move.",
          "When two reps both had meaningful involvement in bringing a deal to close.",
          "When a deal closes in the final week of a quarter and the booking date is uncertain.",
          "When a product that generates commission is discontinued mid-year."
        ],
        "ans": 1,
        "exp": "Multi-rep attribution is the most frequent and contentious source of commission disputes — the plan document should specify primary rep designation and overlay commission splits before disputes arise, not during them."
      },
      {
        "q": "New hire ramp schedules (50% → 75% → 100% of quota over defined periods) prevent which specific problem?",
        "opts": [
          "High-performing new hires from earning commission before their probation period is complete.",
          "New hires from being held to standards they cannot realistically meet during initial pipeline building, causing early attrition.",
          "New hires from undercutting incumbents' quota attainment through aggressive pricing.",
          "The organisation from paying commission on deals closed primarily through inherited pipeline."
        ],
        "ans": 1,
        "exp": "New hires in B2B sales cannot realistically achieve full quota from day one — without a ramp, they are assessed against a standard that makes failure nearly inevitable, producing early demotivation and the attrition that follows."
      }
    ]
  },
  {
    "id": 15,
    "title": "Global Compensation & Mobility",
    "category": "Global Compensation & Mobility",
    "color": "#C8963E",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of global compensation & mobility.",
    "questions": [
      {
        "q": "A 'glocal' pay philosophy is best described as:",
        "opts": [
          "Paying all employees globally the same amount for comparable grades.",
          "A common global framework with locally calibrated pay ranges, balancing internal equity with market competitiveness.",
          "Paying employees local market rates with no global framework or common grading architecture.",
          "Using global salary survey data as the primary reference for all markets regardless of local conditions."
        ],
        "ans": 1,
        "exp": "Glocal combines a consistent global architecture (grades, governance, philosophy) with local market calibration of actual pay levels — the practical balance between consistency and competitive accuracy."
      },
      {
        "q": "Cost-of-living data is the appropriate input for which compensation decision?",
        "opts": [
          "Setting the base salary range for locally hired software engineers in a new market.",
          "Designing the cost-of-living allowance for an executive relocating from London to Lagos.",
          "Calibrating merit increase budgets for a high-inflation emerging market.",
          "Benchmarking the total compensation of remote employees hired globally."
        ],
        "ans": 1,
        "exp": "Cost-of-living data measures what's needed to maintain purchasing power parity — the correct input for expatriate COLA allowances. Local hire pay should be set using labour market survey data."
      },
      {
        "q": "At 28% annual inflation, an employee whose NGN salary has not been reviewed in 12 months has experienced:",
        "opts": [
          "No change in compensation — their nominal pay is unchanged.",
          "A real-terms reduction in purchasing power of approximately 22%.",
          "A statutory entitlement to an inflation-linked pay increase under Nigerian labour law.",
          "An improvement in their position relative to peers who accepted new jobs at current market rates."
        ],
        "ans": 1,
        "exp": "28% inflation over 12 months means the same Naira buys approximately 22% less than at the last review — identical in practical effect to a nominal pay cut of the same magnitude."
      },
      {
        "q": "A geographic differential matrix converts local pay ranges to a reference currency for which purpose?",
        "opts": [
          "For making pay offers to candidates in each market.",
          "For governance reporting and budget consolidation — pay decisions are always made in local currency.",
          "For calculating the cost-of-living allowance for international assignments.",
          "For determining which market positioning percentile to target in each geography."
        ],
        "ans": 1,
        "exp": "The reference currency conversion is a reporting and governance tool — it shows the organisation its total payroll cost in a consistent unit. Individual pay decisions are always made in the employee's local currency."
      },
      {
        "q": "Shadow payroll is a compliance requirement when:",
        "opts": [
          "An employee is paid above the local statutory maximum salary threshold.",
          "An employee works in a host country while remaining on home-country payroll.",
          "A company expands into a new country for the first time and lacks a local payroll infrastructure.",
          "Employees in the same country are paid through different legal entities."
        ],
        "ans": 1,
        "exp": "Shadow payroll ensures host-country tax authority reporting and any employer payroll taxes are handled when actual payment flows through a different country's payroll — it's a compliance obligation triggered by the employment location, not the payroll location."
      },
      {
        "q": "USD-indexed pay for locally-hired Lagos employees is generally not the appropriate solution to NGN inflation primarily because:",
        "opts": [
          "US dollar indexation is legally prohibited for Nigerian employment contracts under CBN regulations.",
          "It creates regulatory compliance risk and signals a two-tier workforce structure, with complexity risks that outweigh the exchange rate certainty benefit.",
          "Most Lagos employees have USD bank accounts that make USD payment technically possible but administratively complex.",
          "USD-indexed pay makes the compensation benchmarking process more complex without solving the underlying retention problem."
        ],
        "ans": 1,
        "exp": "Regulatory compliance (NGN payroll is generally required for locally-hired employees), HR complexity (exchange rate risk shifts in complex ways), and workforce culture signals make USD-indexed local pay generally inappropriate."
      },
      {
        "q": "A documented assumption log for a data-scarce market (like Accra) should include:",
        "opts": [
          "Actuarial projections for future salary movement based on GDP growth forecasts.",
          "The sources, dates, methodology, and specific assumptions underlying each pay range set without commercial survey data.",
          "Management's stated belief about appropriate pay levels for the relevant roles.",
          "A commitment not to adjust the ranges until commercial survey data becomes available."
        ],
        "ans": 1,
        "exp": "A documented assumption log is what makes gap-filling defensible in a pay equity audit — every source, date, and assumption explicitly recorded so the methodology can be reviewed and verified."
      },
      {
        "q": "The balance sheet approach to expatriate compensation aims to ensure:",
        "opts": [
          "The expatriate earns significantly more than at home as compensation for relocation disruption.",
          "The expatriate is financially held harmless — neither better nor worse off than had they stayed at home.",
          "The host-country entity bears all assignment costs since the employee is working in their market.",
          "The employee's pay is set at the host-country market rate for the duration of the assignment."
        ],
        "ans": 1,
        "exp": "The balance sheet principle is financial neutrality — the employer covers all incremental host-country costs so the expatriate's effective standard of living matches their home position, no more and no less."
      },
      {
        "q": "Why must a global job architecture precede local market pricing in a multinational expansion?",
        "opts": [
          "Employment law in most African jurisdictions requires a global architecture before local hiring can proceed.",
          "Without a common classification framework, locally priced roles in different markets have no shared basis for internal equity comparison or governance.",
          "A global architecture reduces the number of salary surveys needed, making benchmarking cheaper.",
          "Local market pricing is technically impossible without global grade definitions to match survey jobs against."
        ],
        "ans": 1,
        "exp": "The architecture provides the shared language — without it, a Grade 5 in Lagos and a Grade 5 in London may describe genuinely different levels of work, making any cross-market equity comparison meaningless."
      },
      {
        "q": "The UAE's End of Service Gratuity (ESG) must be included in total employment cost modelling because:",
        "opts": [
          "It is a voluntary benefit that most UAE employers provide to remain competitive.",
          "It is a statutory entitlement for expatriate employees that accrues as a legal obligation and must be settled on separation.",
          "The UAE government administers ESG through a mandatory fund similar to Nigeria's pension system.",
          "ESG is negotiated individually as part of the executive compensation package for senior roles."
        ],
        "ans": 1,
        "exp": "ESG is a statutory entitlement — employers must accrue and pay it on employee separation. It is a mandatory cost that must be included in total employment cost modelling, not an optional benefit."
      }
    ]
  }
];
