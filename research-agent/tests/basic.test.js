/**
 * Basic tests for the Research Agent
 */

const { ResearchAgent } = require('../src/ResearchAgent');

describe('ResearchAgent', () => {
  let agent;

  beforeEach(() => {
    // Create a test agent with minimal configuration
    agent = new ResearchAgent({
      llm: {
        provider: 'openai',
        model: 'gpt-3.5-turbo', // Use a faster model for tests
        apiKey: 'test-key', // This will fail in real usage but pass initialization
        temperature: 0.3,
        maxTokens: 100 // Small number for tests
      },
      research: {
        maxSources: 2, // Limit for faster tests
        verificationEnabled: false, // Disable for tests
        resultQualityThreshold: 0.1 // Low threshold for tests
      },
      storage: {
        cacheEnabled: false, // Disable cache for tests
        persistResults: false
      }
    });
  });

  test('should initialize with default configuration', () => {
    expect(agent).toBeDefined();
    expect(agent.config.agent.name).toBe('DeepResearchAI');
    expect(agent.sessionId).toBeDefined();
    expect(agent.plugins).toBeDefined();
  });

  test('should update configuration at runtime', () => {
    const newConfig = {
      llm: {
        temperature: 0.7
      },
      research: {
        maxSources: 5
      }
    };

    agent.updateConfig(newConfig);

    expect(agent.config.llm.temperature).toBe(0.7);
    expect(agent.config.research.maxSources).toBe(5);
  });

  test('should return agent status', () => {
    const status = agent.getStatus();
    
    expect(status).toBeDefined();
    expect(status.sessionId).toBe(agent.sessionId);
    expect(status.status).toBe('ready');
    expect(status.plugins).toBeDefined();
  });

  test('should generate cache key correctly', () => {
    const topic = 'test topic';
    const options = { persona: 'academic-researcher' };
    
    const cacheKey = agent.generateCacheKey(topic, options);
    
    expect(cacheKey).toContain(topic);
    expect(cacheKey).toContain(JSON.stringify(options));
  });

  test('should merge configurations deeply', () => {
    const newConfig = {
      llm: {
        temperature: 0.8
      },
      customization: {
        tone: 'casual'
      }
    };

    const merged = agent.mergeConfig(newConfig);
    
    // Should keep original config values that weren't overridden
    expect(merged.agent.name).toBe('DeepResearchAI');
    // Should update overridden values
    expect(merged.llm.temperature).toBe(0.8);
    expect(merged.customization.tone).toBe('casual');
  });
});