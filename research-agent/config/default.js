/**
 * Deep Research AI Agent Configuration
 * 
 * This configuration file defines all customizable parameters for the research agent
 */

module.exports = {
  // Agent identification and metadata
  agent: {
    name: "DeepResearchAI",
    version: "1.0.0",
    description: "A fully customizable deep research AI agent",
    capabilities: [
      "Literature review",
      "Data analysis",
      "Source verification",
      "Report generation",
      "Multi-domain research",
      "Citation management"
    ]
  },

  // LLM configuration
  llm: {
    provider: "openai", // Options: openai, anthropic, ollama, custom
    model: "gpt-4-turbo", // Default model
    temperature: 0.3, // Lower for factual research, higher for creative synthesis
    maxTokens: 4096,
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    customHeaders: {},
    timeout: 30000
  },

  // Research-specific parameters
  research: {
    maxDepth: 5, // Maximum recursion depth for research
    maxSources: 10, // Maximum number of sources to gather
    verificationEnabled: true, // Enable fact-checking
    citationStyle: "apa", // Options: apa, mla, chicago, harvard
    searchEngines: ["google", "semantic_scholar", "arxiv", "pubmed"], // Enabled search engines
    resultQualityThreshold: 0.7, // Minimum quality score for sources
    enableMultiModal: false // Enable image/video analysis if supported
  },

  // Data storage and caching
  storage: {
    cacheEnabled: true,
    cacheTtl: 86400, // Cache TTL in seconds (24 hours)
    cacheDir: "./cache",
    persistResults: true,
    resultStoragePath: "./results"
  },

  // Analysis parameters
  analysis: {
    sentimentAnalysis: true,
    entityRecognition: true,
    topicModeling: true,
    biasDetection: true,
    trendAnalysis: false,
    confidenceThreshold: 0.8
  },

  // Security and privacy
  security: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 10,
    sensitiveDataFiltering: true,
    dataAnonymization: true,
    consentRequired: true
  },

  // Customization options
  customization: {
    persona: "academic-researcher", // Options: academic-researcher, business-analyst, journalist, student
    tone: "professional", // Options: professional, casual, technical, conversational
    depth: "comprehensive", // Options: brief, moderate, comprehensive
    format: "report", // Options: report, summary, bullet-points, structured
    language: "en", // ISO 639-1 language code
    customInstructions: "", // Additional instructions from user
    domainExpertise: [] // Specific domains of expertise
  },

  // Plugin system
  plugins: {
    enabled: true,
    directory: "./plugins",
    defaultPlugins: [
      "search",
      "analysis",
      "verification",
      "citation"
    ]
  },

  // Logging and monitoring
  logging: {
    level: "info", // Options: debug, info, warn, error
    format: "json", // Options: json, text
    enableConsole: true,
    enableFile: true,
    filePath: "./logs/research-agent.log"
  },

  // Performance
  performance: {
    concurrentRequests: 3,
    requestDelay: 100, // Delay between requests in ms
    maxRetries: 3,
    backoffMultiplier: 2 // Exponential backoff multiplier
  }
};