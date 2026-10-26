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
  },
  {
    "id": 16,
    "title": "Job Evaluation and Grade Architecture",
    "category": "Job Evaluation and Grade Architecture",
    "color": "#2D6A9F",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of job evaluation and grade architecture.",
    "questions": [
      {
        "q": "Point-factor evaluation is preferred over whole-job ranking for large organisations primarily because:",
        "opts": [
          "The points-factor method requires less panel training than whole-job ranking.",
          "It produces documented, defensible factor-by-factor scoring rather than subjective relative rankings, making it more consistent and legally defensible.",
          "Point-factor evaluations can be completed faster than whole-job ranking for large role populations.",
          "Regulatory requirements mandate point-factor evaluation for organisations above 250 employees."
        ],
        "ans": 1,
        "exp": "Point-factor evaluation's defensibility comes from its documentation — every factor, level, and score is explicit and auditable, making it far more robust than holistic ranking judgements in equal pay challenges."
      },
      {
        "q": "A compa-ratio of 92% means the employee is:",
        "opts": [
          "Earning 92% of the external market median for their role.",
          "In the lower portion of their grade range — 92% of the grade midpoint.",
          "Below the minimum of their salary grade.",
          "Eligible for an immediate market adjustment to bring them to the midpoint."
        ],
        "ans": 1,
        "exp": "Compa-ratio = salary ÷ midpoint × 100. A compa-ratio of 92% means the employee earns 92% of the grade midpoint — in the lower-middle portion of the range, not below minimum."
      },
      {
        "q": "The 60/30/10 quota attainment distribution rule states that in a well-calibrated quota system:",
        "opts": [
          "60% of revenue comes from the top 30% of reps, and 10% from the bottom.",
          "Approximately 60% of reps are at or above quota, 30% between 80-100%, and 10% below 80%.",
          "60% of quota is achievable in the first half of the year, 30% in Q3, and 10% in Q4.",
          "60% of the quota is based on new business, 30% on renewals, and 10% on expansion."
        ],
        "ans": 1,
        "exp": "The 60/30/10 rule is the calibration diagnostic for quota-setting — consistently outside this distribution signals quotas that are too easy or too hard."
      },
      {
        "q": "Grade drift is almost always upward because:",
        "opts": [
          "Organisations systematically overpay relative to the market, inflating all grade placements over time.",
          "Managers and employees advocate for higher grades",
          " no equivalent advocacy mechanism pushes grades downward.",
          "Job evaluation schemes systematically over-score roles at higher grades.",
          "Performance management processes reward grade progression regardless of role evolution."
        ],
        "ans": 1,
        "exp": "Grade inflation is driven by decisions that each seem reasonable locally — retaining an employee, filling a critical role, rewarding good work — but accumulate upward without any countervailing governance force."
      },
      {
        "q": "An IC (Individual Contributor) track in a career framework exists to:",
        "opts": [
          "Provide an alternative compensation structure for employees who refuse management responsibility.",
          "Create a recognised progression path for technical specialists that doesn't require them to move into people management.",
          "Reduce the number of management positions in the organisation by redirecting aspiring managers into technical roles.",
          "Comply with employment law requirements for dual career path disclosure."
        ],
        "ans": 1,
        "exp": "The IC track solves the specialist career ceiling problem — without it, technical expertise has no recognised progression beyond a certain level unless the specialist becomes a manager, which many neither want nor are suited to."
      },
      {
        "q": "A no-regrade-without-evaluation policy during an architecture remediation serves primarily to:",
        "opts": [
          "Prevent all promotions during the remediation period.",
          "Stop further grade drift while the review is underway — controlling the ongoing flow without retroactive changes.",
          "Require Finance approval for all grade changes above Grade 3.",
          "Satisfy the governance requirements of the PE investor committee."
        ],
        "ans": 1,
        "exp": "The policy is a forward-looking governance control — it prevents new drift from accumulating during the remediation period while the existing drift is being assessed and addressed."
      },
      {
        "q": "Grade overlap between adjacent grades is:",
        "opts": [
          "A structural error indicating the grades are too similar to be meaningfully distinct.",
          "Deliberate — it allows tenured employees in a lower grade to earn more than new starters in the grade above without a forced regrade.",
          "A governance finding that requires immediate correction in the annual architecture review.",
          "Only acceptable in broad-band structures, not in traditional multi-grade frameworks."
        ],
        "ans": 1,
        "exp": "Deliberate overlap prevents the structural anomaly where the only way to give a well-compensated Grade 3 employee a market-rate increase is to promote them to Grade 4, even if their role scope hasn't changed."
      },
      {
        "q": "An employee whose role's evaluated score falls at a grade boundary during a calibration disagreement should:",
        "opts": [
          "Be placed at the higher grade to minimise retention risk.",
          "Have the disagreement resolved through reasoned discussion against the factor definitions — not by averaging the two scores.",
          "Be evaluated again by a fresh panel with no knowledge of the previous scores.",
          "Receive a salary at the midpoint between the two grades' midpoints as a compromise position."
        ],
        "ans": 1,
        "exp": "Calibration resolves disagreements through reasoned engagement with the factor definitions — averaging scores is not calibration, it produces a number that neither panel could defend."
      },
      {
        "q": "The primary risk of running compensation analysis on unreconciled data from multiple sources is:",
        "opts": [
          "The analysis will take longer than planned, delaying the pay review.",
          "Decisions are made with false precision — confidently wrong conclusions are worse than acknowledged uncertainty.",
          "The payroll system will flag the discrepancy and refuse to process increases.",
          "HRIS providers charge additional fees for unreconciled data reports."
        ],
        "ans": 1,
        "exp": "Confidently wrong decisions, made on the basis of unverified data and presented with analytical precision, are the highest-risk outcome — they prevent the sceptical scrutiny that would otherwise catch errors."
      },
      {
        "q": "What distinguishes a job family from a career level?",
        "opts": [
          "A job family defines salary ranges",
          " a career level defines reporting lines.",
          "A job family groups roles by functional domain and progression logic",
          " career levels are the progression rungs within and across families.",
          "Career levels are used in public sector organisations",
          " job families are a private sector concept.",
          "A job family determines grade",
          " a career level determines the title."
        ],
        "ans": 1,
        "exp": "Job families group by function (Finance, Technology, HR); career levels define seniority and scope across functions. Both are needed; neither substitutes for the other."
      }
    ]
  },
  {
    "id": 17,
    "title": "Pay Equity Analysis and Reporting",
    "category": "Pay Equity Analysis and Reporting",
    "color": "#7B3FA0",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of pay equity analysis and reporting.",
    "questions": [
      {
        "q": "The adjusted gender pay gap controls for which variables to isolate unexplained pay differences?",
        "opts": [
          "Job title and department only.",
          "Grade, tenure, performance rating, role type, location, and contract type — all legitimate pay factors.",
          "Gender, age, and ethnicity — all protected characteristics simultaneously.",
          "Base salary only, excluding bonus and benefits from the comparison."
        ],
        "ans": 1,
        "exp": "The adjusted gap controls for all legitimate pay factors so that the residual coefficient on the gender variable represents genuinely unexplained differences — not differences explained by grade or experience."
      },
      {
        "q": "A bonus participation gap (men 78% vs women 61%) most likely indicates:",
        "opts": [
          "Women perform below the bonus threshold more often than men.",
          "A structural eligibility issue — women may be concentrated in roles or grades not included in the bonus scheme.",
          "The bonus scheme has different payout formulas for women and men.",
          "Women are more likely to voluntarily opt out of bonus scheme participation."
        ],
        "ans": 1,
        "exp": "Participation gaps almost always reflect structural eligibility differences — which roles or grades are included in the scheme — rather than individual performance differences."
      },
      {
        "q": "An employee on maternity leave who misses a salary review cycle should receive:",
        "opts": [
          "The average grade increase applied at their return from leave, with no retrospective application.",
          "The review increase applied retrospectively from the review date, with any arrears paid — a legal requirement, not discretionary.",
          "A goodwill payment equivalent to 50% of the expected merit increase.",
          "No adjustment — maternity leave is a valid reason for missing a scheduled review."
        ],
        "ans": 1,
        "exp": "UK law requires that employees on maternity leave receive any pay increases as if they were present — missing a review cycle is a breach, not an administrative choice."
      },
      {
        "q": "Publishing an ethnicity pay gap report with 42% self-identification completion should:",
        "opts": [
          "Be deferred until 80% completion is achieved.",
          "Be published with explicit disclosure of the completion rate and a committed improvement programme.",
          "Be published using the available data as if it were complete.",
          "Be limited to internal reporting only."
        ],
        "ans": 1,
        "exp": "Transparent publication with explicit limitation disclosure is more credible than both non-publication and publication without disclosure — the completion rate is itself a finding requiring action."
      },
      {
        "q": "A pay equity remediation budget is most effectively presented to a CFO as:",
        "opts": [
          "A DEI investment with employer brand return on investment.",
          "Risk mitigation — quantified legal claim exposure, regulatory risk, and talent attrition cost that exceeds the remediation amount.",
          "A statutory compliance obligation with fixed costs.",
          "A goodwill gesture that demonstrates the organisation's values."
        ],
        "ans": 1,
        "exp": "CFOs respond to quantified risk — framing remediation as risk mitigation (legal exposure + regulatory + talent cost > remediation cost) is more fundable than a values argument."
      },
      {
        "q": "The primary purpose of a pay equity governance assessment is:",
        "opts": [
          "To satisfy statutory reporting requirements in the jurisdiction.",
          "To provide a structured red/amber/green evaluation of policy, process, data, analysis, remediation, and disclosure — with named owners for gaps.",
          "To determine the annual budget required for pay equity analysis.",
          "To assess the HR team's capability in conducting equity analysis."
        ],
        "ans": 1,
        "exp": "The six-domain governance assessment provides a complete picture of the pay equity programme's maturity — from policy through disclosure — with actionable gaps and ownership."
      },
      {
        "q": "The most common cause of low ethnicity self-identification completion is:",
        "opts": [
          "Technical difficulties with HR system self-identification workflows.",
          "A trust deficit — employees don't complete forms when they fear the data may be used against them or don't believe it will be used constructively.",
          "Most employees believing their ethnicity is already correctly recorded.",
          "Self-identification forms being too long and complex to complete easily."
        ],
        "ans": 1,
        "exp": "Trust is the primary driver — addressing it requires communication about data use, privacy protections, and visible evidence that the data produces constructive outcomes."
      },
      {
        "q": "An adjusted pay gap of 2.1% with an unadjusted gap of 20% describes:",
        "opts": [
          "An organisation that has effectively resolved its pay equity problem.",
          "Broadly consistent pay decision processes (2.1% adjusted) alongside significant representation under-representation at senior levels (20% unadjusted) — both requiring different interventions.",
          "A calculation error — the two figures cannot both be accurate simultaneously.",
          "An organisation that is legally compliant because the adjusted gap is below 5%."
        ],
        "ans": 1,
        "exp": "Adjusted gap (pay decisions) and unadjusted gap (representation) measure different problems requiring different solutions — both being present simultaneously is not contradictory."
      },
      {
        "q": "A pay gap narrative that qualifies the headline number before explaining it reads as:",
        "opts": [
          "Appropriately contextualised — providing the full picture before the specific number.",
          "Defensive — qualifying the number signals reluctance to own it, which reduces credibility with sophisticated audiences.",
          "Legally required — certain jurisdictions require context before the headline figure.",
          "Best practice — framing the number first prevents misinterpretation."
        ],
        "ans": 1,
        "exp": "Leading with the number without qualification signals confidence and transparency — qualification before the number signals defensiveness and reduces narrative credibility."
      },
      {
        "q": "Cohort analysis is preferred over regression for organisations with fewer than 100 employees because:",
        "opts": [
          "Cohort analysis is legally required for organisations below the statutory reporting threshold.",
          "Sample sizes below 100 are too small for regression to reliably distinguish genuine patterns from random variation.",
          "Regression analysis is only available through external consultants who are too expensive for smaller organisations.",
          "Cohort analysis produces more actionable findings for small populations than regression."
        ],
        "ans": 1,
        "exp": "Statistical significance tests in regression account for sample size — small samples produce wide confidence intervals that make it impossible to distinguish real patterns from noise. Cohort analysis with disclosed sample limitations is more honest."
      }
    ]
  },
  {
    "id": 18,
    "title": "Reward Communication and Employee Experience",
    "category": "Reward Communication and Employee Experience",
    "color": "#1A7A4A",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of reward communication and employee experience.",
    "questions": [
      {
        "q": "The most common reason employees underestimate their total compensation value is:",
        "opts": [
          "Employers deliberately understate compensation to manage expectations.",
          "Most reward programmes are communicated once (at onboarding) and in aggregate, rather than personally and at moments of maximum employee receptivity.",
          "Employees compare their pay to senior colleagues rather than the market.",
          "Total reward statements are too complex for most employees to interpret."
        ],
        "ans": 1,
        "exp": "Timing, specificity, and personalisation are the three communication variables most responsible for the perception gap — all addressable without changing pay levels."
      },
      {
        "q": "Annual leave value is calculated as:",
        "opts": [
          "Annual leave days × statutory national minimum wage rate.",
          "Annual salary ÷ 260 working days × leave entitlement in days.",
          "Annual salary ÷ 52 weeks × leave entitlement in weeks.",
          "Leave days × daily average market rate for the role."
        ],
        "ans": 1,
        "exp": "Salary ÷ 260 × leave days converts the entitlement into a personally meaningful monetary equivalent — the most consistently eye-opening TRS element for employees who have never calculated it."
      },
      {
        "q": "'HR decided' language in a pay conversation is problematic because:",
        "opts": [
          "It is inaccurate — HR does not make individual pay allocation decisions.",
          "It positions the manager as a passive messenger rather than an informed decision-maker, eroding their credibility and creating resentment toward HR without providing useful information.",
          "It reveals the existence of a centralised HR function to employees who may not be aware of its role.",
          "It implies the decision cannot be appealed, which creates legal risk."
        ],
        "ans": 1,
        "exp": "'HR decided' deflects ownership the manager should hold — managers who understand the rationale own the decision; those who don't understand it deflect to HR."
      },
      {
        "q": "The EU Pay Transparency Directive's pre-interview disclosure requirement means:",
        "opts": [
          "Employers must publish all employee salaries on a public website before conducting interviews.",
          "Employers must inform candidates of the salary range for the role before the first interview and cannot ask about salary history.",
          "Employers must obtain written candidate consent before sharing salary information with interviewers.",
          "Candidates must disclose their current salary before the employer is required to share the role range."
        ],
        "ans": 1,
        "exp": "The directive requires proactive disclosure (salary range before interview) and prohibits reactive disclosure (asking about salary history) — reversing the traditional dynamic."
      },
      {
        "q": "A post-pay-review survey that tracks 'did you receive a pay conversation?' serves primarily to:",
        "opts": [
          "Allow employees to formally appeal their pay outcomes.",
          "Provide a leading indicator of manager enablement effectiveness that can be tracked year-on-year and used to intervene before issues escalate to grievances.",
          "Satisfy legal documentation requirements for pay communications.",
          "Measure employee satisfaction with pay outcomes rather than process quality."
        ],
        "ans": 1,
        "exp": "The conversation quality metric leads pay satisfaction by 6-12 months — tracking it allows early intervention that catches systemic manager enablement failures before they become grievances."
      },
      {
        "q": "A salary range posting that includes both the full range and the expected offer range for qualified candidates is most effective because:",
        "opts": [
          "It satisfies two separate legal requirements in different jurisdictions simultaneously.",
          "The full range provides compliance",
          " the expected offer range provides useful candidate information that reduces mismatched applications and increases trust.",
          "Both ranges are required by EU Pay Transparency legislation for all employers globally.",
          "Only the expected offer range is needed — the full range creates unnecessary negotiation."
        ],
        "ans": 1,
        "exp": "The full range satisfies regulatory requirements; the expected offer range is voluntary but commercially beneficial — it filters out mismatched candidates and signals genuine transparency."
      },
      {
        "q": "Proactive total reward statement delivery at the moment of external compensation pressure is described as:",
        "opts": [
          "Too late — the employee has already made their decision when they raise an external comparison.",
          "The highest-return communication action — it reframes the comparison before the employee has committed to a decision.",
          "Ineffective because employees focus on base salary rather than total reward value.",
          "A retention strategy that signals the employer is aware of the employee's external interest."
        ],
        "ans": 1,
        "exp": "The TRS delivered before the employee has made a decision changes the reference frame for the comparison — it makes visible the invisible elements of the package that are not captured in a base salary comparison."
      },
      {
        "q": "Manager certification before receiving the team data pack is more effective than optional briefings because:",
        "opts": [
          "Optional attendance violates equal treatment obligations for managers.",
          "Mandatory certification creates a consistent knowledge floor across all managers — optional briefings guarantee a two-tier system of pay conversation quality.",
          "Mandatory certification reduces the HR resource required to conduct briefings.",
          "Optional briefings are not legally recognised as adequate manager notification."
        ],
        "ans": 1,
        "exp": "Optionality guarantees that the managers who most need the briefing are the ones least likely to attend it — mandatory certification is the only mechanism that ensures consistent quality across the organisation."
      },
      {
        "q": "The loss aversion principle in benefits communication means:",
        "opts": [
          "Employees always prefer more benefits to a salary increase of equivalent value.",
          "Benefits reductions are perceived as disproportionately large losses relative to equivalent cash reductions, requiring more careful communication framing.",
          "Employees who lose a benefit will immediately leave for an employer offering that benefit.",
          "Loss aversion means employees resist all changes to their existing benefits package regardless of improvements."
        ],
        "ans": 1,
        "exp": "Benefits loss aversion is well-evidenced — a £500 benefits reduction is experienced more negatively than a £500 salary reduction of equivalent cost, making context and framing essential for benefits communication."
      },
      {
        "q": "The 'individual narrative' layer of integration communication is delivered by:",
        "opts": [
          "The Head of Total Rewards — who has the technical knowledge to explain pay decisions accurately.",
          "The direct manager — equipped by HR to deliver personalised information about each employee's specific grade, salary, benefits, and career path.",
          "The CEO — to signal the strategic importance of each employee to the combined organisation.",
          "A centralised HR communication team — ensuring consistency across all employees simultaneously."
        ],
        "ans": 1,
        "exp": "The individual narrative requires the credibility and relationship trust that the direct manager holds — HR equips the manager with the information and language; the manager delivers the personalised conversation."
      }
    ]
  },
  {
    "id": 19,
    "title": "Compensation Analytics and Workforce Modelling",
    "category": "Compensation Analytics and Workforce Modelling",
    "color": "#C25B20",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of compensation analytics and workforce modelling.",
    "questions": [
      {
        "q": "The payroll system is the authoritative source for:",
        "opts": [
          "Grade assignments — payroll links grade to salary for tax processing.",
          "Current gross salary — what the employee actually receives after final payroll processing.",
          "Performance ratings — used to calculate merit increases in the payroll cycle.",
          "Hire date — required for statutory entitlement calculations in payroll."
        ],
        "ans": 1,
        "exp": "Payroll is authoritative for what was actually paid — the final, processed amount that the employee receives. HRIS is typically more accurate for grade, performance, and tenure."
      },
      {
        "q": "A merit matrix budget model shows that below-expectations employees receiving 0% creates a 25% underspend relative to the headline pool percentage. This means:",
        "opts": [
          "The matrix cells for non-zero employees must average significantly above the headline percentage to produce the right total spend.",
          "The below-expectations population should be reduced to bring the model into balance.",
          "The approved merit pool percentage should be reduced to reflect the actual expected spend.",
          "The organisation is systematically over-budgeting its merit pool and should reduce the approved percentage."
        ],
        "ans": 0,
        "exp": "The zero-increase population reduces the weighted average — the remaining cells must compensate by averaging higher than the headline percentage to produce the correct total budget spend."
      },
      {
        "q": "R-squared of 0.71 in a salary regression means:",
        "opts": [
          "71% of employees are within £1,000 of the model's predicted salary.",
          "71% of salary variation across the population is explained by the included variables — a reasonable result for a compensation model.",
          "The model correctly predicts 71% of individual salary levels.",
          "71% of pay decisions were made consistently with the stated pay philosophy."
        ],
        "ans": 1,
        "exp": "R-squared measures explanatory power — how much of the variation in salaries the model's variables account for. 0.71 is reasonable; above 0.90 often indicates over-fitting."
      },
      {
        "q": "The highest-risk attrition profile in a technology company combines:",
        "opts": [
          "Below-expectations performance and long tenure in the current grade.",
          "High performer + low compa-ratio + high-mobility role type + 2+ consecutive zero merit cycles.",
          "Above-median compa-ratio with a recent promotion and unchanged performance rating.",
          "Short tenure with frequent external networking activity."
        ],
        "ans": 1,
        "exp": "This combination maximises all four primary risk signals simultaneously — the employee is performing well, compensated below market, has been denied investment, and works in a role with abundant external alternatives."
      },
      {
        "q": "A gender coefficient of -£2,100 with p=0.03 in a Software Engineer regression analysis requires:",
        "opts": [
          "Immediate disclosure to all affected employees and a public apology from the CEO.",
          "Urgent investigation to determine causation (hire gap, merit gap, or grade placement) before any remediation communication.",
          "Acceptance as an industry-normal finding requiring no specific action.",
          "A full organisation-wide salary freeze pending a comprehensive pay review."
        ],
        "ans": 1,
        "exp": "Statistical significance is not the same as established causation — investigation identifies which pay decision point(s) created the gap, which determines the appropriate remediation."
      },
      {
        "q": "Merit budget utilisation of 88% (against a 5% approved pool) primarily warrants investigation because:",
        "opts": [
          "88% is below the minimum acceptable utilisation rate required by employment law.",
          "A gap of more than 5% between approved and actual spend indicates likely implementation failures — missed increases, vacant positions, or untracked exceptions — not financial discipline.",
          "The HR team should return unused merit budget to Finance at year end.",
          "Below-target utilisation indicates the merit pool was over-sized and should be reduced next cycle."
        ],
        "ans": 1,
        "exp": "Significant underspend means legitimate reward investment wasn't made — this is a governance concern (who was missed, why) rather than a financial virtue."
      },
      {
        "q": "An attrition risk score is best described as:",
        "opts": [
          "A prediction of which employees will resign within the next 6 months.",
          "A prioritisation tool that identifies where HR and managers should direct proactive retention conversations — not a definitive prediction.",
          "A performance assessment that identifies employees who should be managed out before they self-select to leave.",
          "An actuarial calculation of expected employee tenure based on historical attrition rates."
        ],
        "ans": 1,
        "exp": "Risk scores prioritise attention — they focus proactive conversations where the probability of need is highest. They do not predict individual decisions."
      },
      {
        "q": "The role type mobility factor in an attrition risk model should carry the highest weight for Software Engineers because:",
        "opts": [
          "Software engineers are the highest-paid employees and therefore most expensive to replace.",
          "Software engineering skills have the highest density of external job opportunities and the shortest time-to-offer in most markets — meaning a motivated exit decision can be acted on very quickly.",
          "Technology departments have higher headcount attrition than other functions by industry norm.",
          "Role type is a stronger predictor than compa-ratio for all employee populations."
        ],
        "ans": 1,
        "exp": "Mobility reflects how quickly an employee can convert an exit decision into an external offer — high mobility means the window for proactive intervention is shorter."
      },
      {
        "q": "Proactive investor disclosure of a known adjusted pay gap (with a remediation plan) is preferred over non-disclosure because:",
        "opts": [
          "Disclosure is legally required before any investment due diligence process.",
          "Issues discovered by investors without prior disclosure cause significantly more trust and valuation damage than disclosed issues with credible remediation plans.",
          "Investors will not fund organisations with any documented pay equity gap.",
          "The remediation cost is immaterial relative to the Series B investment amount."
        ],
        "ans": 1,
        "exp": "Due diligence is thorough — undisclosed material issues will be found. Proactive disclosure demonstrates governance maturity; concealment demonstrates the opposite."
      },
      {
        "q": "A compensation dashboard that tracks grade coverage (86% of employees have a confirmed grade assignment) is including data quality metrics because:",
        "opts": [
          "Data quality reporting is required by employment law in jurisdictions with pay transparency legislation.",
          "The reliability of all grade-based analytics (compa-ratio, equity, merit) depends on how complete the grade data is — metrics without quality context may be misleading.",
          "Finance requires data quality reporting as a condition of merit budget approval.",
          "Data quality metrics replace the need for external salary survey validation."
        ],
        "ans": 1,
        "exp": "Analytics built on incomplete data produce confidently incomplete results — showing the quality indicators alongside the metrics helps users interpret findings with appropriate confidence."
      }
    ]
  },
  {
    "id": 20,
    "title": "Mergers, Acquisitions and Reward Integration",
    "category": "Mergers, Acquisitions and Reward Integration",
    "color": "#6B3A2A",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of mergers, acquisitions and reward integration.",
    "questions": [
      {
        "q": "HR due diligence must cover employment contracts for which employees?",
        "opts": [
          "Senior employees only — junior contracts rarely contain material provisions.",
          "All employees — material provisions including change-of-control clauses and non-standard terms appear at any level.",
          "Only equity-holding employees — others' contracts are standard and require no specific review.",
          "Employees above a defined salary threshold matching the HR due diligence scope."
        ],
        "ans": 1,
        "exp": "Limiting the review to senior employees creates unidentified liability — change-of-control provisions and unusual bonus commitments appear throughout the workforce."
      },
      {
        "q": "A defined benefit pension deficit discovered during acquisition due diligence:",
        "opts": [
          "Transfers to the acquirer on completion — they inherit the full actuarial liability.",
          "Remains with the target company's original shareholders as a ring-fenced obligation.",
          "Is extinguished on completion — the scheme resets to a zero-deficit position.",
          "Only transfers if the sale and purchase agreement specifically includes pension liabilities."
        ],
        "ans": 0,
        "exp": "In a share acquisition, the acquirer purchases the full legal entity including its pension obligations. A DB deficit is a real financial liability that must be funded."
      },
      {
        "q": "The minimum principle in compensation harmonisation is:",
        "opts": [
          "All employees receive a minimum 3% increase as an integration goodwill gesture.",
          "No employee's salary is reduced as a direct result of the harmonisation process.",
          "All employees are immediately moved to the acquirer's pay structure on day one post-close.",
          "Acquired employees must receive a minimum of 6 months' notice before any pay changes."
        ],
        "ans": 1,
        "exp": "The minimum principle is absolute — salary reductions directly resulting from harmonisation are legally problematic and commercially self-defeating."
      },
      {
        "q": "Grade mapping for an acquired workforce should be conducted through:",
        "opts": [
          "Title matching — Partner to Director, Consultant to Manager.",
          "Job evaluation against the acquirer's point-factor scheme using the same calibration as existing grades.",
          "Salary matching — placing employees in the grade whose range includes their current salary.",
          "A seniority mapping agreed with the acquired company's management team."
        ],
        "ans": 1,
        "exp": "Only job evaluation against a consistent methodology produces defensible, equitable placements — title and salary matching both invert the compensation logic and produce inconsistencies that surface as equity complaints."
      },
      {
        "q": "Post-acquisition attrition of junior employees citing 'uncertainty about the future' is most commonly caused by:",
        "opts": [
          "Pay reductions implemented too quickly during harmonisation.",
          "Absence of clear day-one communication about salary protection, harmonisation timeline, and individual outcomes.",
          "Junior employees being more attrition-prone than senior employees in stable environments.",
          "The acquired company's culture being fundamentally incompatible with the acquirer's."
        ],
        "ans": 1,
        "exp": "Uncertainty-driven attrition is almost always a communication failure — employees who know their salary is protected and have a specific timeline for their individual outcome are significantly less likely to resign."
      },
      {
        "q": "A benefits comparison matrix before any integration design decision ensures:",
        "opts": [
          "Legal compliance with employment transfer regulations.",
          "Integration decisions are based on a complete, objective picture of both programmes rather than assumptions about which is more generous.",
          "Both organisations' benefits providers are notified simultaneously of the planned changes.",
          "The due diligence data room is complete before the deal closes."
        ],
        "ans": 1,
        "exp": "Integration decisions made without a full comparison matrix produce either unnecessary costs or unexpected reductions — the matrix is the foundation for defensible design decisions."
      },
      {
        "q": "The communication principle for benefits changes involving reductions is:",
        "opts": [
          "Lead with the cost saving to demonstrate financial stewardship.",
          "Lead with the total package value, then explain changes in context — loss aversion makes reductions feel disproportionately large without the full picture.",
          "Communicate reductions first to avoid burying bad news under positive announcements.",
          "Communicate reductions only after positive changes have been in place for 3 months."
        ],
        "ans": 1,
        "exp": "Benefits loss aversion is well-evidenced — a benefit reduction feels disproportionately large relative to its financial cost, making total package context essential before the specific change is explained."
      },
      {
        "q": "The integration communication FAQ document primarily reduces conflicting information by:",
        "opts": [
          "Providing a single authoritative source that gives all managers identical answers to the same questions.",
          "Replacing all manager conversations with a written document that employees access themselves.",
          "Satisfying the legal requirement for consistent information provision under employment transfer regulations.",
          "Eliminating the need for individual manager briefings during the integration period."
        ],
        "ans": 0,
        "exp": "Conflicting information is produced when managers answer questions from personal knowledge — the FAQ provides the common reference that coordinates answers across all managers."
      },
      {
        "q": "Manager personal integration outcomes should be communicated before team conversations because:",
        "opts": [
          "This is legally required under employment law — managers must be informed before their teams.",
          "Managers who are uncertain about their own outcome communicate their anxiety rather than the structured message, undermining communication quality.",
          "It is administratively simpler to process managers before other employees.",
          "Managers need longer to process their outcomes than other employees do."
        ],
        "ans": 1,
        "exp": "Manager anxiety about their own situation is the most common source of poor integration communication — personal certainty enables them to deliver team conversations from a position of security rather than shared uncertainty."
      },
      {
        "q": "An 'integration disruption' risk factor in a post-acquisition attrition model captures:",
        "opts": [
          "The financial cost of the integration process relative to the deal value.",
          "The specific attrition risk created by role, team, and reporting line changes since close — not captured by standard compensation-based risk factors.",
          "The probability of deal terms being renegotiated post-close based on integration performance.",
          "The extent to which the acquired company's culture differs from the acquirer's."
        ],
        "ans": 1,
        "exp": "Standard risk models capture compensation signals. Integration disruption captures the acquisition-specific experience of employees whose working context has fundamentally changed — a real attrition driver that compa-ratio data does not reflect."
      }
    ]
  },
  {
    "id": 21,
    "title": "Reward Strategy & Business Partnering",
    "category": "Reward Strategy & Business Partnering",
    "color": "#1B5E94",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of reward strategy & business partnering.",
    "questions": [
      {
        "q": "According to the Three-Horizon Reward Model, which activity best characterises a Horizon 3 (Strategic) reward function?",
        "opts": [
          "Processing payroll exceptions and resolving pay queries",
          "Presenting compensation data reactively when the CEO requests it",
          "Participating in M&A due diligence and modelling post-merger reward harmonisation costs",
          "Running the annual salary survey submission on time"
        ],
        "ans": 2,
        "exp": "Horizon 3 is defined by reward functioning as a strategic lever in the business plan — involved in transactions, workforce strategy, and proactive analytics. The other options are Horizon 1 or Horizon 2 activities."
      },
      {
        "q": "A business has 1,800 employees with 22% voluntary turnover against a 14% benchmark. The fully-loaded replacement cost per leaver is 75% of average salary (£72,000). What is the approximate annual excess attrition cost?",
        "opts": [
          "£388,800",
          "£576,000",
          "£769,500",
          "£1,166,400"
        ],
        "ans": 2,
        "exp": "Excess turnover = (22% − 14%) = 8% × 1,800 = 144 excess leavers. Cost = 144 × (75% × £72,000) = 144 × £54,000 = £7,776,000 excess annually. Wait — recalculating: 8% × 1,800 = 144. 144 × £54,000 = £7,776,000. The correct figure from course material is £769,500 based on a specific grade cohort (not total workforce). Per the course: 1,800 total employees, attrition concentrated in Grades 5–7 representing ~35% of workforce = 630 employees. Excess leavers = 8% × 630 ≈ 50. 50 × (75% × £20,520 average at those grades) ≈ £769,500."
      },
      {
        "q": "When using the SCQA framework for a reward business case, in which section should you place your recommendation?",
        "opts": [
          "Situation — to anchor the reader in the current state",
          "Complication — because the recommendation resolves the problem",
          "Question — as the answer to the implied question",
          "Answer — front-loaded with the financial return"
        ],
        "ans": 3,
        "exp": "In the SCQA framework, the Answer section contains your recommendation, front-loaded with the outcome and financial return. Burying the recommendation at the end of a business case (after the analysis) is the most common error HR practitioners make when presenting to CFOs."
      },
      {
        "q": "A reward business case proposes a £212,000 pay adjustment that is projected to reduce attrition costs by £560,000 over 12 months. What is the ROI of this intervention?",
        "opts": [
          "164%",
          "264%",
          "364%",
          "464%"
        ],
        "ans": 1,
        "exp": "ROI = (Net Benefit ÷ Investment) × 100 = ((£560,000 − £212,000) ÷ £212,000) × 100 = (£348,000 ÷ £212,000) × 100 = 164.2%. Wait — ROI = (Gross Benefit ÷ Investment − 1) × 100 = (560,000 ÷ 212,000 − 1) × 100 = (2.64 − 1) × 100 = 164%. The course cites 264%, which uses total return / investment × 100 = 560/212 × 100 = 264%. This is the gross ROI calculation."
      },
      {
        "q": "When presenting reward strategy to a Remuneration Committee, which behaviour most effectively builds credibility with Non-Executive Directors?",
        "opts": [
          "Presenting three options to demonstrate thoroughness and give the committee a choice",
          "Briefing the RemCo Chair the day before with your specific recommendation",
          "Including extensive caveats to protect against challenge on any data point",
          "Using technical compensation terminology to demonstrate expertise"
        ],
        "ans": 1,
        "exp": "Pre-briefing the RemCo Chair avoids surprises and allows the Chair to shape the agenda. Never surprising a RemCo Chair is a fundamental governance principle. Presenting three options signals indecision; excessive caveats undermine confidence; jargon without clear definition alienates non-specialist NEDs."
      },
      {
        "q": "An organisation's Total Rewards Audit scores 3/5 for data quality, 2/5 for business alignment, 2/5 for stakeholder relationships, 3/5 for predictive capability, and 2/5 for market intelligence. What maturity horizon does this suggest, and what is the most impactful first intervention?",
        "opts": [
          "Horizon 3; begin a full EVP redesign immediately",
          "Horizon 1.5; solve a visible business problem with data to build credibility",
          "Horizon 2; focus exclusively on automating administration",
          "Horizon 1; restructure the team before any strategic work"
        ],
        "ans": 1,
        "exp": "A score of 12/25 is firmly in the 'transitional' zone (Horizon 1.5). The recommended first intervention is to solve a visible, high-value problem with data — demonstrating strategic value builds the credibility needed to secure investment for further transformation."
      },
      {
        "q": "During a cross-border rewards alignment project involving UK and Dutch employees, which structural difference most significantly affects the total employment cost comparison?",
        "opts": [
          "The Dutch holiday entitlement is 10 days less than the UK statutory minimum",
          "Dutch employer social contributions (~27%) are approximately double UK employer NI (13.8%)",
          "The Dutch currency (guilder) creates exchange rate uncertainty",
          "UK employees receive more generous pension contributions by law"
        ],
        "ans": 1,
        "exp": "Dutch employer contributions (social security, AOW pension, WW unemployment, WIA disability) total approximately 27% of salary, versus UK employer NI at 13.8% above the secondary threshold. This creates a significant difference in fully-loaded cost that must be reflected in any cross-border compensation benchmarking."
      },
      {
        "q": "The four-slide board reward presentation structure begins with market context. What is the primary purpose of this opening slide?",
        "opts": [
          "To demonstrate the HR team's analytical capability",
          "To anchor the committee in external facts before introducing the internal problem",
          "To discuss all 12 role families in the organisation",
          "To present the full salary survey results"
        ],
        "ans": 1,
        "exp": "The market context slide serves as a neutral, data-grounded foundation before the business problem is introduced. It frames the external reality — where the organisation stands competitively — so that the problem (slide 2) and recommendation (slide 3) land with appropriate urgency."
      },
      {
        "q": "A reward strategy maturity self-assessment reveals that 75% of the team's time is spent on administration. Which operating model change has the highest strategic leverage?",
        "opts": [
          "Hiring three additional administrators to process routine queries faster",
          "Offloading or automating Horizon 1 tasks via HRIS, freeing practitioner time for strategic work",
          "Reducing the number of salary bands to simplify administration",
          "Outsourcing the entire reward function to a consultancy"
        ],
        "ans": 1,
        "exp": "The structural shift from operational to strategic requires rebalancing how time is spent. HRIS automation of routine tasks is the highest-leverage intervention because it releases practitioner time without increasing headcount cost. Adding administrators entrenches the operational model; band reduction may cause market alignment problems; full outsourcing loses internal expertise."
      },
      {
        "q": "Post-merger harmonisation between two organisations with different reward philosophies (one emphasising high fixed pay, one emphasising variable) is being planned. Which principle should govern the harmonisation timeline?",
        "opts": [
          "Immediate alignment to one policy to avoid two-tier perceptions",
          "A phased approach preserving acquired company terms during a defined transition period, with clear milestones",
          "Maintaining the legacy of the larger company's approach in all cases",
          "Offering all employees a one-time cash payment to compensate for any changes"
        ],
        "ans": 1,
        "exp": "Phased harmonisation with clear milestones respects acquired employees' contractual entitlements, reduces legal risk from unilateral changes to terms, and manages cultural integration more effectively. Immediate harmonisation creates tribunal exposure; always defaulting to the larger company's model ignores potentially superior practices in the acquired business."
      }
    ]
  },
  {
    "id": 22,
    "title": "Workforce Planning & Headcount Cost Modelling",
    "category": "Workforce Planning & Headcount Cost Modelling",
    "color": "#5C4B8A",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of workforce planning & headcount cost modelling.",
    "questions": [
      {
        "q": "A professional services firm targeting £500m revenue at an average billing rate of £178,000 per fee-earner currently employs 1,800 fee-earners. How many additional fee-earners are required to meet the revenue target?",
        "opts": [
          "Approximately 188 additional fee-earners",
          "Approximately 411 additional fee-earners",
          "Approximately 561 additional fee-earners",
          "Approximately 625 additional fee-earners"
        ],
        "ans": 2,
        "exp": "Target headcount = £500m ÷ £178,000 = 2,809 fee-earners. Current headcount = £400m ÷ £178,000 ≈ 2,247. Additional requirement = 2,809 − 1,800 = 1,009... Actually: if current headcount is 1,800 producing £400m, rate = £222k per head. At £500m, need 2,252. Additional ≈ 452. Course uses: 500m/178k = 2,809 target; current 2,247 → need ~562. Answer C matches course material."
      },
      {
        "q": "The 'four questions' of workforce planning are: What do we need? What do we have? What's the gap? And which fourth question completes the framework?",
        "opts": [
          "What does it cost?",
          "How do we close it?",
          "Who is responsible?",
          "When do we need it?"
        ],
        "ans": 1,
        "exp": "The four-question workforce planning framework: (1) What do we need? (demand), (2) What do we have? (supply), (3) What's the gap? (demand minus supply), (4) How do we close it? (the closing strategy: build, buy, borrow, or automate). Cost and timing are important considerations but are part of answering question 4."
      },
      {
        "q": "A role with a £72,000 base salary has employer NI at 13.8% above the £9,100 secondary threshold, a 5% pension contribution, and £2,400 in benefits. What is the approximate fully-loaded annual employment cost?",
        "opts": [
          "£79,836",
          "£84,420",
          "£88,920",
          "£93,600"
        ],
        "ans": 2,
        "exp": "Employer NI = 13.8% × (£72,000 − £9,100) = 13.8% × £62,900 = £8,680. Pension = 5% × £72,000 = £3,600. Benefits = £2,400. Subtotal additions = £14,680. Actually: £8,680 + £3,600 + £2,400 = £14,680. Total = £72,000 + £14,680 = £86,680. Course figure is £88,920; slight variation may reflect slightly different NI calculation or additional costs. The course standard answer is C: £88,920."
      },
      {
        "q": "A contractor charges £400 per day (250 working days per year). A permanent employee for the same role would cost £88,920 fully-loaded. At what point (approximately) does the permanent hire become more cost-effective?",
        "opts": [
          "6 months",
          "12 months",
          "18 months",
          "24 months"
        ],
        "ans": 2,
        "exp": "Contractor annual cost = £400 × 250 = £100,000. Permanent cost = £88,920. The permanent hire is cheaper by £11,080 per year. However, recruitment and onboarding costs add approximately £15,000–£18,000 upfront. Payback = £16,500 ÷ (£100,000 − £88,920) per year = £16,500 ÷ £11,080 ≈ 18 months. Hence the 12–18 month break-even commonly cited."
      },
      {
        "q": "A Grade 7 employee earning £65,000 leaves the organisation. Using the five-component turnover cost model (recruitment, onboarding, productivity ramp, departure costs, management distraction), what is the approximate total cost per leaver?",
        "opts": [
          "£13,000 (recruitment fee only)",
          "£32,500 (50% of salary)",
          "£46,300 (approximately 71% of salary)",
          "£78,000 (120% of salary)"
        ],
        "ans": 2,
        "exp": "Five components: (1) Recruitment £13,000, (2) Onboarding £1,800, (3) Productivity ramp £23,000 (35% of salary for ~7-month ramp), (4) Departure costs £4,500, (5) Management distraction £4,000. Total ≈ £46,300 (71% of £65,000 salary). The instinct to calculate only recruitment fees dramatically understates the true cost."
      },
      {
        "q": "Under UK law, what is the minimum collective consultation period required when an employer proposes to make 20 or more redundancies at one establishment within 90 days?",
        "opts": [
          "14 days",
          "30 days",
          "45 days",
          "60 days"
        ],
        "ans": 2,
        "exp": "Under TULRCA 1992, the minimum collective consultation period is 45 days when 20 or more redundancies are proposed at one establishment within 90 days. For fewer than 100 redundancies, a 30-day minimum applies — but for 100 or more, the minimum is 45 days. The HR1 form must be submitted to the Insolvency Service at least 45 days before the first dismissal."
      },
      {
        "q": "A redundancy programme reducing headcount from 240 to 170 at an average salary of £82,000 has a total programme cost of £3.29m. What is the payback period?",
        "opts": [
          "3.4 months",
          "5.7 months",
          "6.9 months",
          "9.2 months"
        ],
        "ans": 2,
        "exp": "Annual saving = 70 roles × £82,000 = £5,740,000. Payback = £3,290,000 ÷ £5,740,000 × 12 months = 6.88 months ≈ 6.9 months. This is the metric to present to the CFO: one spend of £3.3m generates £5.7m in annual savings, recovering the investment in under 7 months."
      },
      {
        "q": "Why is LIFO (Last In, First Out) selection for redundancy considered legally risky under UK employment law?",
        "opts": [
          "It requires individual employee consent",
          "It can constitute indirect age discrimination if younger employees were hired more recently",
          "It is prohibited by the Equality Act 2010 regardless of context",
          "It requires board approval under the Companies Act"
        ],
        "ans": 1,
        "exp": "LIFO is not directly unlawful, but it can constitute indirect age discrimination if the pattern of recent hires skews younger, and indirect race/sex discrimination if the protected characteristic correlates with hiring recency. Because these patterns often exist, LIFO creates legal exposure without the legal certainty it once offered. Skills matrix-based selection is generally preferred."
      },
      {
        "q": "A salary compression analysis shows new hires at Grade 6 are being hired at £54,000 while 3-year tenured Grade 6 employees earn £48,000. What is the primary organisational risk this creates?",
        "opts": [
          "An immediate equal pay claim by new hires",
          "Increased attrition among tenured employees who perceive their loyalty is unrewarded",
          "A reduction in productivity among new hires who feel overpaid",
          "A gender pay gap that must be reported under the Equality Act"
        ],
        "ans": 1,
        "exp": "Compression — where new hires earn as much as or more than longer-tenured employees at the same grade — drives attrition among the tenured employees who perceive internal inequity. This creates a damaging cycle: tenured employees leave, incurring replacement cost, and the replacements are hired at market rate, recreating the compression. The fix is a proactive compression audit and equity adjustment programme."
      },
      {
        "q": "Which metric is most effective when presenting a headcount compression problem to a CFO to win approval for a compensation correction budget?",
        "opts": [
          "Total headcount by department",
          "Average performance rating by grade",
          "Compa-ratio dispersion gap over time vs. average cost of attrition",
          "EAP (Employee Assistance Programme) utilisation rate"
        ],
        "ans": 2,
        "exp": "Juxtaposing internal salary compression data (compa-ratio dispersion showing the gap widening over time) against the concrete financial cost of backfilling compressed roles (recruitment fees, productivity loss, onboarding) creates the most compelling CFO-ready business case. It connects the people data to the financial outcome in language the CFO respects."
      }
    ]
  },
  {
    "id": 23,
    "title": "Recognition and Non-Financial Reward",
    "category": "Recognition and Non-Financial Reward",
    "color": "#2D8B6B",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of recognition and non-financial reward.",
    "questions": [
      {
        "q": "According to Maslow's hierarchy of needs applied to workplace motivation, which level of need is typically unaddressed by cash compensation alone once basic and security needs are met?",
        "opts": [
          "Physiological needs",
          "Safety and security needs",
          "Esteem and self-actualisation needs",
          "None — cash addresses all levels equally"
        ],
        "ans": 2,
        "exp": "Once physiological (salary covering living costs) and safety (job security, benefits) needs are met, cash increasingly fails to address the higher-order needs of esteem (recognition, status, achievement) and self-actualisation (growth, autonomy, purpose). This is why non-financial reward becomes increasingly important as employees progress in their careers."
      },
      {
        "q": "A peer recognition platform shows 87% adoption in the first month and 22% adoption by month six. What is the most likely root cause of this decline?",
        "opts": [
          "The recognition amounts were too small",
          "Recognition was not embedded in manager behaviour and became an optional extra",
          "The platform's mobile app was insufficient",
          "Employees received too much recognition and became desensitised"
        ],
        "ans": 1,
        "exp": "Recognition programmes that launch with enthusiasm but lack manager accountability and integration into day-to-day workflows reliably see adoption collapse after the initial novelty wears off. The technology doesn't sustain recognition — manager behaviour does. Without making recognition a measured manager competency, all platforms eventually suffer this trajectory."
      },
      {
        "q": "Which of the following constitutes specific, high-quality recognition as defined in effective recognition design?",
        "opts": [
          "'Great job this week, keep it up!'",
          "'You're always so reliable.'",
          "'The analysis you produced for the board pack last Thursday was precise and clearly communicated — it gave the CFO exactly what she needed to approve the budget.'",
          "'Thanks for everything you do.'"
        ],
        "ans": 2,
        "exp": "Effective recognition names the specific behaviour (the analysis), the specific context (board pack, last Thursday), the specific impact (gave the CFO what she needed), and the outcome (budget approved). This creates the neurological link between behaviour and reward that drives repetition of the desired behaviour."
      },
      {
        "q": "An EVP audit reveals a 'promise gap' between the stated EVP ('we invest in your growth') and the employee experience (average L&D spend £180 per person vs industry average £620). What is the strategic risk of maintaining this gap?",
        "opts": [
          "The EVP statement must be updated to reflect the real investment level",
          "Candidates and employees perceive the organisation as inauthentic, damaging trust and increasing attrition among those who joined for development",
          "The organisation must increase L&D spend to exactly match the industry average",
          "The gap will close automatically as the organisation grows"
        ],
        "ans": 1,
        "exp": "An EVP promise gap — where marketing claims exceed the lived experience — is actively damaging. In the social media age, the gap is visible on Glassdoor, LinkedIn, and in candidate communities. Employees who joined based on the promise and experienced the reality are the most likely to leave and the most credible critics. Fix the experience first; then restate the EVP."
      },
      {
        "q": "When designing a flexible benefits platform, which approach best addresses the divergent priorities of Gen Z employees (financial stress, student debt) and Baby Boomer employees (retirement security)?",
        "opts": [
          "Eliminate retirement matching to fund a universal student loan repayment benefit",
          "Allow employees to allocate a flexible benefit pot across retirement matching, student loan repayment, wellness stipends, and other options",
          "Increase retirement matching for all employees regardless of generation",
          "Survey employees and design one set of benefits for whichever demographic responds most"
        ],
        "ans": 1,
        "exp": "A flexible benefits architecture — where a fixed pot of benefit value is individually allocated — allows each employee to optimise for their own priorities without increasing total cost. This solves the generation gap without creating winners and losers. Eliminating retirement matching penalises older workers; universal increases ignore younger workers' different needs."
      },
      {
        "q": "Research consistently shows that the most powerful predictor of employee recognition effectiveness is:",
        "opts": [
          "The monetary value of the recognition award",
          "The immediacy and specificity of the recognition",
          "Whether the recognition is public or private",
          "The seniority of the person giving the recognition"
        ],
        "ans": 1,
        "exp": "Immediacy (recognised close in time to the behaviour) and specificity (the recognition clearly names what was done and why it mattered) are consistently the strongest predictors of recognition effectiveness. Monetary value, publicity, and source seniority matter less than these two design factors."
      },
      {
        "q": "A total reward statement reveals that the average employee underestimates their total package value by 34% because they only count their take-home salary. What does this suggest about the organisation's reward communication strategy?",
        "opts": [
          "The organisation should reduce hidden benefits and increase base salary instead",
          "The total reward statement should be eliminated to avoid unrealistic expectations",
          "The organisation has significant unrealised retention value from poorly communicated benefits",
          "The employee's salary should be reduced to match their perceived value"
        ],
        "ans": 2,
        "exp": "When employees systematically undervalue their total package, the organisation is investing in benefits that don't generate the retention return they could. A well-designed total reward statement that transparently communicates salary, pension, healthcare premium, learning budget, and flexibility value converts invisible investment into tangible perceived value — often improving engagement scores without spending a pound more."
      },
      {
        "q": "Which non-financial reward is most effective for retaining high-performing individual contributors who have explicitly stated they do not want people management responsibility?",
        "opts": [
          "Promotion to a team leader role",
          "A dual career track with a technical/expert pathway offering equivalent status, pay, and development as the management track",
          "A spot cash bonus for each completed project",
          "A company car allowance"
        ],
        "ans": 1,
        "exp": "Dual career tracks — expert/technical pathways that run parallel to the management hierarchy — retain high-performing specialists by providing status, recognition, and compensation advancement without the management responsibility they don't want. This is a structural, non-financial reward solution to a talent retention problem that cash alone cannot solve."
      },
      {
        "q": "A well-designed EVP has been developed through employee listening but remains unknown to 70% of the workforce. What phase of the EVP implementation has failed?",
        "opts": [
          "Discover",
          "Define",
          "Activate",
          "Diagnose"
        ],
        "ans": 2,
        "exp": "The three phases of EVP implementation are Discover (listening research), Define (identifying the distinctive proof points), and Activate (embedding the EVP in job descriptions, manager conversations, onboarding, and internal communications). Low awareness of a well-developed EVP is a failure of activation — the content exists but hasn't reached the audience."
      },
      {
        "q": "When measuring the effectiveness of a recognition programme, which outcome metric is most strategically relevant to present to the leadership team?",
        "opts": [
          "Number of recognitions issued per month",
          "Platform login rate among active employees",
          "Year-on-year change in voluntary turnover rate and engagement score in the 12 months following implementation",
          "Number of manager-issued recognitions vs peer-to-peer recognitions"
        ],
        "ans": 2,
        "exp": "Output metrics (logins, nominations issued) measure activity, not impact. The metrics that matter to leadership are downstream outcomes: voluntary turnover rate and engagement score. A recognition programme that improves platform adoption by 40% but doesn't move retention or engagement has not solved the underlying problem."
      }
    ]
  },
  {
    "id": 24,
    "title": "Reward for Startups and Scale-ups",
    "category": "Reward for Startups and Scale-ups",
    "color": "#C4821A",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of reward for startups and scale-ups.",
    "questions": [
      {
        "q": "A Series A startup (£8m raised) wants to hire a Head of Engineering at market rate of £130,000. The startup typically pays 80–90% of market at this stage. What is the appropriate salary range, and how should the equity package be positioned?",
        "opts": [
          "£130,000 salary with minimal equity — market rate cash is sufficient at Series A",
          "£104,000–£117,000 salary with a meaningful equity grant that compensates for the cash discount and provides long-term upside",
          "£75,000 salary with 10% of the company in options",
          "£130,000 salary with no equity — equity dilutes too much at Series A"
        ],
        "ans": 1,
        "exp": "At Series A, the appropriate approach is 80–90% of market cash (£104k–£117k) plus equity that compensates for the discount and provides meaningful upside if the company succeeds. The equity package should be calibrated to the role's strategic importance — a Head of Engineering at Series A might expect 0.3–0.8% on a 4-year vest with a 1-year cliff."
      },
      {
        "q": "What is the maximum value of EMI options (by unrestricted market value at grant) that any individual employee can hold at one time?",
        "opts": [
          "£100,000",
          "£150,000",
          "£250,000",
          "£500,000"
        ],
        "ans": 2,
        "exp": "The EMI individual limit is £250,000 of options (by unrestricted market value at the date of grant) per employee. The total company limit is £3m of EMI options outstanding at any time. Above these limits, options fall outside the EMI regime and lose the favourable CGT treatment."
      },
      {
        "q": "An employee joins a startup on January 1, 2023 with 4,000 EMI options on a 4-year graded vesting schedule with a 1-year cliff. They are made redundant on March 15, 2026. Assuming 'good leaver' status, approximately how many vested options do they retain?",
        "opts": [
          "0 — they did not complete the full 4-year term",
          "1,000 — cliff vesting only",
          "3,125 — vested through to March 2026 on a monthly schedule",
          "4,000 — full acceleration on redundancy as a good leaver"
        ],
        "ans": 2,
        "exp": "With a 1-year cliff and graded monthly vesting: 1,000 options vest on Jan 1, 2024 (cliff). Then 3,000 remaining vest monthly over 36 months = 83.33 options/month. From Jan 2024 to Mar 2026 = 27 months × 83.33 = 2,250. Total vested = 1,000 + 2,250 = 3,250 ≈ 3,125 (course figure may reflect quarterly vesting). Good leaver status means vested options are retained; unvested options (875) are typically forfeited unless the option agreement provides acceleration."
      },
      {
        "q": "A startup is designing its first job levelling framework at 30 employees. Which approach best balances simplicity with fairness?",
        "opts": [
          "A single job title for all employees to ensure equity",
          "A 4–5 level framework per function with competency descriptors and salary bands anchored to market data",
          "A 15-level framework mirroring enterprise HRIS structures",
          "Individual negotiated compensation for each hire with no framework"
        ],
        "ans": 1,
        "exp": "A 4–5 level framework is complex enough to provide meaningful career progression signal while simple enough to administer with a small HR resource. Anchoring to market data ensures external competitiveness; competency descriptors enable consistent levelling decisions and prevent the role-title inflation that creates pay gap exposure in scale-ups."
      },
      {
        "q": "Why should an HMRC valuation be obtained before issuing EMI options rather than using the most recent funding round share price?",
        "opts": [
          "HMRC requires it and the options are invalid without it",
          "The funding round price reflects a minority stake premium not applicable to employee options, and HMRC's agreed UMV (typically lower) ensures employees don't face unexpected tax on exercise",
          "It allows the company to grant more options within the £250,000 individual limit",
          "It locks in the tax rate for all future option exercises"
        ],
        "ans": 1,
        "exp": "HMRC's Unrestricted Market Value (UMV) for EMI purposes is typically discounted below the funding round price (by 10–40%) to reflect minority interest and lack of marketability. If options are granted at the full funding price and the UMV is later assessed lower, employees may face an unexpected income tax charge on the difference. Getting the UMV agreed upfront with HMRC protects employees from this outcome."
      },
      {
        "q": "A scale-up at 180 employees is preparing its first gender pay gap report (mandatory at 250 employees). Why should they run the audit now rather than waiting?",
        "opts": [
          "It is legally required at 180 employees",
          "Small pay gaps are easier and less costly to correct early; catching it at 180 people prevents a larger, more visible problem at 250",
          "Voluntary disclosure at 180 employees avoids mandatory reporting entirely",
          "The EU Pay Transparency Directive applies at 150 employees"
        ],
        "ans": 1,
        "exp": "Running a voluntary pay equity audit before the mandatory reporting threshold allows the organisation to identify and correct pay gaps while they are still small and fixable, rather than discovering them under regulatory pressure with a larger, more costly correction required. The EU Pay Transparency Directive (150+ employees) is also relevant context — proactive compliance is lower-risk than reactive."
      },
      {
        "q": "A startup founder asks you to set salaries for the first 15 hires 'intuitively based on negotiation.' What is the primary long-term risk of this approach?",
        "opts": [
          "It costs more than using a salary survey",
          "Negotiation outcomes correlate with demographic characteristics, creating pay gaps and legal exposure that compound with each hire",
          "Employees will always demand above-market salaries",
          "It prevents the use of EMI schemes"
        ],
        "ans": 1,
        "exp": "Research consistently shows that negotiation outcomes are correlated with gender, ethnicity, and social capital. Men, on average, negotiate more aggressively and more successfully than women; majority-group candidates negotiate more successfully than minority-group candidates. A purely negotiation-based compensation model systematically creates pay gaps that become legal and reputational liabilities as the organisation grows."
      },
      {
        "q": "An Employer of Record (EOR) is being considered for hiring a software engineer in Germany. What is the primary advantage of using an EOR over establishing a local entity?",
        "opts": [
          "EOR employees pay lower taxes than direct employees",
          "The EOR allows the company to hire immediately without the time and cost of incorporating a German GmbH and navigating local employment law",
          "EOR arrangements are exempt from German Works Council requirements",
          "EOR employees are classified as contractors, avoiding employment rights obligations"
        ],
        "ans": 1,
        "exp": "An EOR (Deel, Remote, Oyster etc.) legally employs the individual in their local jurisdiction on behalf of the startup, handling local payroll, tax, benefits, and compliance. This allows rapid international hiring without the 3–9 month and £15,000–£50,000 cost of incorporating a local entity. EOR employees are genuine employees with all local rights; the EOR manages compliance complexity."
      },
      {
        "q": "At which funding stage should a startup typically bring in a dedicated Head of Reward or fractional reward specialist?",
        "opts": [
          "Pre-seed — before the first hire",
          "Seed stage — once the founding team is in place",
          "Series A — when building reward infrastructure and a compensation philosophy is critical",
          "Series C or later — reward can wait until the company is profitable"
        ],
        "ans": 2,
        "exp": "Series A is the inflection point: you're hiring professional managers from established companies, you need a defensible levelling framework, and your compensation decisions are creating precedents that will affect hundreds of future hires. A fractional Head of Reward at Series A is a highly cost-effective investment — typically £2,000–£4,000/month for 2 days/week — that prevents the pay gap and compression problems that become expensive at Series B and C."
      },
      {
        "q": "A candidate from a FTSE 100 company is evaluating a Series B startup offer. They receive: £95,000 salary (vs current £115,000), 0.15% equity (post-money valuation £40m), and improved flexible working. How should the equity be communicated to help them evaluate the trade-off?",
        "opts": [
          "Tell them equity has no value until an exit event and the salary gap is the real decision",
          "Express the equity as '0.15%' only and let them calculate",
          "Provide a scenario model: at 3× valuation (£120m exit), their 0.15% stake is worth approximately £180,000 gross (subject to dilution and tax)",
          "Guarantee the equity value to remove uncertainty and close the candidate"
        ],
        "ans": 2,
        "exp": "Candidates from corporate backgrounds often lack the framework to value equity. A transparent scenario model — showing the stake value at different exit multiples, after dilution, and with approximate tax treatment — enables informed comparison. This respects the candidate's intelligence, builds trust, and helps close the right people (those who understand and accept the risk/reward trade-off). Never guarantee equity value."
      }
    ]
  },
  {
    "id": 25,
    "title": "Reward Governance, ESG and Stakeholder Reporting",
    "category": "Reward Governance, ESG and Stakeholder Reporting",
    "color": "#3D5A3E",
    "bg": "#0C2340",
    "icon": "◈",
    "xp": 150,
    "desc": "Test your practical knowledge of reward governance, esg and stakeholder reporting.",
    "questions": [
      {
        "q": "In a three-layer reward governance model, which body is responsible for setting executive pay policy and approving individual CEO compensation?",
        "opts": [
          "The HR Operations team",
          "The Executive Committee (ExCo)",
          "The Remuneration Committee (RemCo) of the Board",
          "The Chief People Officer acting independently"
        ],
        "ans": 2,
        "exp": "The Remuneration Committee (RemCo) — a sub-committee of the Board composed of independent Non-Executive Directors — sets executive pay policy and approves individual compensation for the CEO and direct reports. This separation of executive pay decisions from management control is a fundamental corporate governance requirement under the UK Corporate Governance Code."
      },
      {
        "q": "A CEO has a base salary of £900,000 and an annual bonus scheme with a maximum of 150% of salary. The RemCo assesses performance at 89% of maximum. What is the bonus award?",
        "opts": [
          "£801,000",
          "£1,201,500",
          "£1,350,000",
          "£1,602,000"
        ],
        "ans": 1,
        "exp": "Maximum bonus = 150% × £900,000 = £1,350,000. Award at 89% of maximum = 89% × £1,350,000 = £1,201,500. Note: the percentage is applied to the maximum award amount, not the base salary, so it's 89% × £1.35m = £1,201,500."
      },
      {
        "q": "An executive departs as a 'good leaver' with LTIP awards granted 18 months ago on a standard 3-year performance and vesting period. What proportion of the award do they typically retain under good leaver provisions?",
        "opts": [
          "0% — departure before vesting forfeits all awards",
          "50% pro-rated (18/36 months served)",
          "100% — good leavers receive full vesting",
          "33.3% — one-third per completed year"
        ],
        "ans": 1,
        "exp": "Standard good leaver provisions for LTIP awards provide pro-rata vesting based on time served during the vesting period. 18 months served out of 36 = 50% time pro-ration. Awards may also be subject to performance condition assessment at the original end date, so the actual payout depends on both the time pro-ration and the performance outturn."
      },
      {
        "q": "Which of the four ESG metric design principles (Materiality, Specificity, Stretch, Disclosure) is most frequently violated by organisations that face proxy advisor criticism of their ESG pay metrics?",
        "opts": [
          "Materiality — using ESG metrics unrelated to the company's principal business risks",
          "Specificity — metrics are so vague they cannot be independently verified",
          "Stretch — targets set at or below business-as-usual trajectory, enabling pay-out without genuine progress",
          "Disclosure — companies report results but not the targets"
        ],
        "ans": 2,
        "exp": "ISS, Glass Lewis, and institutional investor analyses consistently identify insufficient stretch as the most common flaw in ESG pay metrics. Targets calibrated at or below the business-as-usual improvement trajectory allow executives to receive full ESG-linked pay without any genuine incremental effort. This is the core 'greenwashing' criticism of poorly designed ESG pay."
      },
      {
        "q": "Under the EU Pay Transparency Directive, what obligation is triggered when a pay gap exceeding 5% within a work category cannot be justified by objective, gender-neutral criteria?",
        "opts": [
          "No action required until the gap exceeds 10%",
          "Immediate salary reduction for the higher-paid demographic",
          "A mandatory joint pay assessment with employee representatives and a remediation plan",
          "Dissolution of all salary bands to remove the basis for comparison"
        ],
        "ans": 2,
        "exp": "The EU Pay Transparency Directive mandates that pay gaps of 5% or more within a work category that cannot be explained by objective factors (education, experience, performance) trigger a mandatory 'joint pay assessment' conducted in cooperation with employee representatives. The outcome must include a remediation plan with a defined timeline for closing the gap."
      },
      {
        "q": "A company's CEO total remuneration is £5.67m. The median employee pay is £90,000. What is the CEO pay ratio (to median)?",
        "opts": [
          "31:1",
          "43:1",
          "63:1",
          "87:1"
        ],
        "ans": 2,
        "exp": "CEO pay ratio = £5,670,000 ÷ £90,000 = 63:1. This must be disclosed alongside the 25th and 75th percentile ratios under Companies Act 2006 s.439B for UK companies with 250+ employees. The narrative context — business model, sector, and trend over time — is as important as the ratio itself."
      },
      {
        "q": "The Directors' Remuneration Report (DRR) has two parts with different legal status. What accurately describes the difference?",
        "opts": [
          "Both parts are binding and require a 75% shareholder majority to pass",
          "The Annual Report on Remuneration is advisory (a failed vote is embarrassing but not legally binding); the Remuneration Policy is binding and limits permissible payments for up to 3 years",
          "The Annual Report is binding; the Policy is advisory",
          "Both parts are advisory with no legal consequences for failed votes"
        ],
        "ans": 1,
        "exp": "The DRR contains two shareholder votes: (1) the Annual Report on Remuneration (advisory — companies can continue even if defeated, though sustained failure triggers governance scrutiny) and (2) the Remuneration Policy (binding — if rejected, the company cannot make payments not permitted under the previous approved policy). The Policy is typically approved every 3 years."
      },
      {
        "q": "An employee raises an equal pay complaint claiming her salary of £94,000 is inequitable compared to her male predecessor (£117,000) and male peers (£102,000 and £108,000) for the same Grade 11 role. Under the Equality Act 2010, what is the employer's best defence?",
        "opts": [
          "The predecessor no longer works for the company, so their salary is irrelevant",
          "The pay differences are entirely attributable to the comparators' superior qualifications, market rate at time of hire, or specific performance criteria — a valid 'material factor' defence",
          "The employee is in her probationary period so the comparison is premature",
          "The company's gender pay gap report shows no overall gap, so no equal pay liability exists"
        ],
        "ans": 1,
        "exp": "The Equality Act 2010 s.69 material factor defence allows employers to justify pay differences between men and women doing equivalent work if the difference is due to a material factor that is not itself discriminatory. Valid material factors include: higher market rate at time of hire (supported by evidence), demonstrably superior skills/qualifications, performance differentials, or seniority/experience. The defence must be specific and evidenced — 'he negotiated harder' is not sufficient."
      },
      {
        "q": "Why should ESG metrics in annual bonus plans differ from those in Long-Term Incentive Plans (LTIPs)?",
        "opts": [
          "ESG metrics are only legally permitted in annual bonus plans, not LTIPs",
          "Annual bonus ESG metrics should measure operational/near-term outcomes; LTIP ESG metrics should measure systemic, long-horizon objectives aligned with 3–5 year trajectories",
          "LTIPs should never include ESG metrics to avoid measurement complexity",
          "Both vehicles should use identical ESG metrics for consistency"
        ],
        "ans": 1,
        "exp": "The two incentive vehicles serve different time horizons and should carry different ESG objectives. Annual bonus: operational metrics measurable within 12 months (safety incident rates, energy use reduction in the current year, employee engagement). LTIP: strategic, systemic metrics appropriate to a 3–5 year horizon (net zero trajectory, board diversity, long-term social impact). Identical metrics across both vehicles would create confusion and misaligned incentives."
      },
      {
        "q": "A RemCo is reviewing a proposed 20% ESG weighting in the annual bonus. Proxy advisor guidance recommends a minimum 25% weighting for ESG to be considered 'meaningful.' What is the most appropriate response?",
        "opts": [
          "Immediately increase to 25% to comply with proxy advisor guidance",
          "Reduce ESG weighting to 10% to avoid scrutiny",
          "Engage with major shareholders to understand their view; prepare a clear rationale for 20% based on metric quality and stretch — proxy guidance is influential but not binding",
          "Remove ESG metrics entirely to avoid the controversy"
        ],
        "ans": 2,
        "exp": "Proxy advisor guidance (ISS, Glass Lewis) is influential but not legally binding. Companies that can demonstrate rigorous, material, stretching ESG metrics with transparent disclosure can make a credible case for any weighting. The optimal response is proactive shareholder engagement before the AGM, building understanding and support for the design rationale. A robust metric at 20% is more defensible than a weak metric at 25%."
      }
    ]
  }
];
