export const PLANS = {
  INHOUSE_ASK: "free_tier", // old free user. only for legacy purposes
  INHOUSE_PRO: "subscriber_business", // Inhouse Pro
  INHOUSE_COUNSEL: "subscriber_enterprise", // Inhouse counsel,
  SUBSCRIBER_BUSINESS: "subscriber_business", // Inhouse Pro
  SUBSCRIBER_ENTERPRISE: "subscriber_enterprise", // Inhouse counsel,
  AI_DOC: "subscriber_business", // Inhouse Pro
  LAWYER_FINALLIZATION: "subscriber_enterprise", // Inhouse counsel,
  COURT_DOCUMENT: "Court-Document-USD-Daily", // 99$ plan : document only
  LEGAL_CONSULTATION: "legal_consultation", // $99 consultation plan
};

export const DRAWER = {
  FREE: "free",
  CONSULTATION: "consultation",
  FINALIZATION: "finalization",
};

// Loading message types
export const LOADING_MESSAGE_TYPES = {
  DEFAULT: "DEFAULT",
  WEB_SEARCH: "WEB_SEARCH",
  ISSUE_SPOTTING: "ISSUE_SPOTTING",
  DOC_GENERATION: "DOC_GENERATION",
  PRODUCT_INFO: "PRODUCT_INFO",
  READING_WEBSITE: "READING_WEBSITE",
  PRODUCT_SEARCH: "PRODUCT_SEARCH",
};

// Loading messages for shimmer - time_range in seconds
export const LOADING_MESSAGES = {
  DEFAULT: {
    messages: [
      { text: "Reviewing your request", is_variable: false },
      { text: "Researching", is_variable: false },
      { text: "Searching relevant lawyer notes", is_variable: false },
      { text: "Identifying legal risks", is_variable: false },
      { text: "Identifying legal opportunities", is_variable: false },
    ],
    time_range: 20,
  },
  READING_WEBSITE: {
    messages: [
      { text: "Running web search", is_variable: false },
      { text: "Identifying key pages", is_variable: false },
      { text: "Extracting relevant sections", is_variable: false },
      { text: "Reading recent updates", is_variable: false },
      { text: "Verifying publication dates", is_variable: false },
      { text: "Capturing definitions and terms", is_variable: false },
      { text: "Summarizing key findings", is_variable: false },
      { text: "Collecting citation links", is_variable: false },
      { text: "Filtering unrelated results", is_variable: false },
      { text: "Preparing structured summary", is_variable: false },
    ],
    time_range: 60,
  },
  PRODUCT_SEARCH: {
    messages: [
      { text: "Understanding your request", is_variable: false },
      { text: "Interpreting pricing question", is_variable: false },
      { text: "Interpreting product question", is_variable: false },
      { text: "Searching pricing page", is_variable: false },
      { text: "Finding product info", is_variable: false },
      { text: "Validating feature availability", is_variable: false },
      { text: "Comparing product details", is_variable: false },
    ],
    time_range: 60,
  },
  ISSUE_SPOTTING: {
    messages: [
      { text: "Understanding your request", is_variable: false },
      { text: "Detecting document intent", is_variable: false },
      { text: "Identifying document type", is_variable: false },
      { text: "Loading template", is_variable: false },
      { text: "Determining scope", is_variable: false },
      { text: "Selecting jurisdiction scope", is_variable: false },
      { text: "Checking requirements", is_variable: false },
      { text: "Checking required fields", is_variable: false },
      { text: "Identifying key clauses", is_variable: false },
      { text: "Listing missing details", is_variable: false },
      { text: "Applying plain language", is_variable: false },
      { text: "Aligning to industry norms", is_variable: false },
      { text: "Estimating review steps", is_variable: false },
      { text: "Queuing clarifying questions", is_variable: false },
      { text: "Minimizing questions needed", is_variable: false },
    ],
    time_range: 60,
  },
  DOC_GENERATION: {
    messages: [
      { text: "Searching relevant lawyer notes", is_variable: false },
      { text: "Running through our lawyer-crafted Playbook", is_variable: false },
      { text: "Generating an outline of the document", is_variable: false },
      { text: "Reviewing 10,000+ legal documents most similar to your agreement", is_variable: false },
      { text: "Seeking opportunities to improve your document", is_variable: false },
      { text: "Reducing unnecessary and redundant legalese", is_variable: false },
      { text: "Generating the final document", is_variable: false },
      { text: "Generating a summary of the document", is_variable: false },
    ],
    time_range: 300,
  },
};
