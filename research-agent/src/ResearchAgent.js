/**
 * Deep Research AI Agent
 * 
 * A fully customizable research agent that performs comprehensive information gathering,
 * analysis, and synthesis with customizable parameters and plugins.
 */

const EventEmitter = require('events');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ResearchAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.sessionId = uuidv4();
    this.plugins = new Map();
    this.cache = new Map();
    this.researchHistory = [];
    
    this.initializeAgent();
  }

  /**
   * Merge user configuration with default configuration
   */
  mergeConfig(userConfig) {
    const defaultConfig = require('../config/default');
    return this.deepMerge(defaultConfig, userConfig);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  /**
   * Initialize the agent with plugins and configuration
   */
  async initializeAgent() {
    this.emit('agent:init', {
      sessionId: this.sessionId,
      config: this.config,
      timestamp: new Date().toISOString()
    });

    // Load default plugins
    if (this.config.plugins.enabled) {
      await this.loadDefaultPlugins();
    }

    // Setup storage directories
    await this.setupStorage();
  }

  /**
   * Setup storage directories
   */
  async setupStorage() {
    const { cacheDir, resultStoragePath } = this.config.storage;
    
    if (this.config.storage.cacheEnabled) {
      await fs.mkdir(cacheDir, { recursive: true });
    }
    
    if (this.config.storage.persistResults) {
      await fs.mkdir(resultStoragePath, { recursive: true });
    }
  }

  /**
   * Load default plugins
   */
  async loadDefaultPlugins() {
    for (const pluginName of this.config.plugins.defaultPlugins) {
      try {
        const plugin = await this.loadPlugin(pluginName);
        if (plugin) {
          this.plugins.set(pluginName, plugin);
          this.emit('plugin:loaded', { name: pluginName, plugin });
        }
      } catch (error) {
        console.error(`Failed to load plugin ${pluginName}:`, error);
      }
    }
  }

  /**
   * Load a plugin by name
   */
  async loadPlugin(name) {
    try {
      const pluginPath = path.join(this.config.plugins.directory, `${name}.js`);
      const pluginModule = require(pluginPath);
      return new pluginModule(this.config);
    } catch (error) {
      // Try loading from core plugins if not found in custom directory
      try {
        const corePluginPath = path.join(__dirname, 'plugins', `${name}.js`);
        const corePluginModule = require(corePluginPath);
        return new corePluginModule(this.config);
      } catch (coreError) {
        console.error(`Plugin ${name} not found in custom or core directories:`, error.message);
        return null;
      }
    }
  }

  /**
   * Perform research on a given topic
   */
  async research(topic, options = {}) {
    this.emit('research:start', { 
      topic, 
      options, 
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      // Validate input
      if (!topic || typeof topic !== 'string') {
        throw new Error('Research topic must be a non-empty string');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(topic, options);
      if (this.config.storage.cacheEnabled) {
        const cachedResult = await this.getCachedResult(cacheKey);
        if (cachedResult) {
          this.emit('research:cache-hit', { topic, cacheKey });
          return cachedResult;
        }
      }

      // Prepare research context
      const researchContext = {
        topic,
        options: { ...this.config.customization, ...options },
        results: [],
        sources: [],
        analysis: {},
        citations: []
      };

      // Perform initial search
      const searchResults = await this.performSearch(topic, options);
      researchContext.sources = searchResults;

      // Analyze sources and gather information
      for (const source of searchResults.slice(0, this.config.research.maxSources)) {
        const sourceContent = await this.extractContent(source);
        if (sourceContent) {
          researchContext.results.push({
            source,
            content: sourceContent,
            analysis: await this.analyzeContent(sourceContent, topic)
          });
        }
      }

      // Perform verification if enabled
      if (this.config.research.verificationEnabled) {
        researchContext.verification = await this.verifyInformation(researchContext);
      }

      // Generate final analysis and report
      researchContext.analysis = await this.generateAnalysis(researchContext);
      researchContext.report = await this.generateReport(researchContext);

      // Add to research history
      this.researchHistory.push({
        id: uuidv4(),
        topic,
        timestamp: new Date().toISOString(),
        results: researchContext
      });

      // Cache results if enabled
      if (this.config.storage.cacheEnabled) {
        await this.setCachedResult(cacheKey, researchContext);
      }

      // Persist results if enabled
      if (this.config.storage.persistResults) {
        await this.persistResults(researchContext);
      }

      this.emit('research:complete', { 
        topic, 
        results: researchContext, 
        sessionId: this.sessionId 
      });

      return researchContext;
    } catch (error) {
      this.emit('research:error', { 
        topic, 
        error: error.message, 
        sessionId: this.sessionId 
      });
      throw error;
    }
  }

  /**
   * Perform initial search for the topic
   */
  async performSearch(topic, options = {}) {
    const searchPlugin = this.plugins.get('search');
    if (searchPlugin) {
      return await searchPlugin.search(topic, options);
    } else {
      // Fallback to basic search implementation
      return await this.fallbackSearch(topic);
    }
  }

  /**
   * Fallback search implementation
   */
  async fallbackSearch(topic) {
    // This is a simplified fallback - in a real implementation,
    // this would connect to various search APIs
    return [{
      id: uuidv4(),
      title: `General search results for: ${topic}`,
      url: '#',
      snippet: `Search results for ${topic}`,
      source: 'fallback',
      quality: 0.8,
      relevance: 0.9
    }];
  }

  /**
   * Extract content from a source
   */
  async extractContent(source) {
    // Placeholder for content extraction logic
    // In a real implementation, this would fetch and parse the actual content
    return {
      title: source.title || 'Untitled',
      content: source.snippet || 'Content not available',
      url: source.url,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze content for relevance and quality
   */
  async analyzeContent(content, topic) {
    const analysisPlugin = this.plugins.get('analysis');
    if (analysisPlugin) {
      return await analysisPlugin.analyze(content, topic);
    } else {
      // Fallback analysis
      return {
        relevance: 0.8,
        sentiment: 'neutral',
        entities: [],
        topics: [topic],
        quality: 0.7
      };
    }
  }

  /**
   * Verify information accuracy
   */
  async verifyInformation(researchContext) {
    const verificationPlugin = this.plugins.get('verification');
    if (verificationPlugin) {
      return await verificationPlugin.verify(researchContext);
    } else {
      // Fallback verification
      return {
        status: 'not_verified',
        confidence: 0.5,
        cross_references: []
      };
    }
  }

  /**
   * Generate comprehensive analysis
   */
  async generateAnalysis(researchContext) {
    const { topic, results, options } = researchContext;
    
    // Prepare context for LLM analysis
    const analysisPrompt = this.buildAnalysisPrompt(researchContext);
    
    try {
      const llmResponse = await this.queryLLM(analysisPrompt, {
        temperature: this.config.llm.temperature,
        maxTokens: this.config.llm.maxTokens
      });
      
      return {
        summary: llmResponse.summary || '',
        keyPoints: llmResponse.keyPoints || [],
        trends: llmResponse.trends || [],
        gaps: llmResponse.gaps || [],
        qualityAssessment: llmResponse.qualityAssessment || {},
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analysis generation failed:', error);
      return {
        summary: 'Analysis could not be generated',
        keyPoints: [],
        trends: [],
        gaps: [],
        qualityAssessment: {},
        generatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Build prompt for analysis
   */
  buildAnalysisPrompt(researchContext) {
    const { topic, results, options } = researchContext;
    
    return `You are an expert research analyst. Analyze the following research on "${topic}" and provide a comprehensive analysis.

Research Results:
${results.map(r => `
Source: ${r.source.title}
Content: ${r.content.content}
Relevance: ${r.analysis.relevance}
Quality: ${r.analysis.quality}
`).join('\n')}

Analysis Options:
- Persona: ${options.persona}
- Tone: ${options.tone}
- Depth: ${options.depth}
- Format: ${options.format}

Provide a detailed analysis with key findings, trends, gaps in research, and quality assessment.`;
  }

  /**
   * Generate final research report
   */
  async generateReport(researchContext) {
    const { topic, analysis, results, options } = researchContext;
    
    const reportPrompt = this.buildReportPrompt(researchContext);
    
    try {
      const llmResponse = await this.queryLLM(reportPrompt, {
        temperature: this.config.llm.temperature,
        maxTokens: this.config.llm.maxTokens
      });
      
      return {
        content: llmResponse.content || '',
        structure: llmResponse.structure || {},
        citations: this.generateCitations(results),
        format: options.format,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Report generation failed:', error);
      return {
        content: 'Report could not be generated',
        structure: {},
        citations: [],
        format: options.format,
        generatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Build prompt for report generation
   */
  buildReportPrompt(researchContext) {
    const { topic, analysis, results, options } = researchContext;
    
    return `Generate a ${options.format} research report on "${topic}" based on the following analysis:

Analysis Summary:
${analysis.summary}

Key Points:
${analysis.keyPoints.join('\n- ')}

Research Results:
${results.map(r => `
Source: ${r.source.title}
Content: ${r.content.content.substring(0, 200)}...
`).join('\n')}

Format Requirements:
- Persona: ${options.persona}
- Tone: ${options.tone}
- Depth: ${options.depth}
- Format: ${options.format}
- Language: ${options.language}

Include proper structure, citations, and follow ${options.tone} tone.`;
  }

  /**
   * Query the LLM with the given prompt
   */
  async queryLLM(prompt, options = {}) {
    const { provider, model, temperature, maxTokens, apiKey, baseUrl } = this.config.llm;
    
    if (!apiKey) {
      throw new Error('API key is required for LLM queries');
    }

    try {
      if (provider === 'openai') {
        const response = await axios.post(
          `${baseUrl}/chat/completions`,
          {
            model: model || 'gpt-4-turbo',
            messages: [
              { role: 'system', content: 'You are an expert research assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: temperature !== undefined ? temperature : this.config.llm.temperature,
            max_tokens: maxTokens !== undefined ? maxTokens : this.config.llm.maxTokens
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.config.llm.timeout
          }
        );

        const content = response.data.choices[0].message.content;
        
        // Parse the response (simplified - in real implementation would be more robust)
        return { content };
      } else {
        throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      console.error('LLM query failed:', error);
      throw error;
    }
  }

  /**
   * Generate citations for the research
   */
  generateCitations(results) {
    const citationPlugin = this.plugins.get('citation');
    if (citationPlugin) {
      return citationPlugin.generate(results, this.config.research.citationStyle);
    } else {
      // Fallback citation generation
      return results.map(r => ({
        title: r.source.title,
        url: r.source.url,
        citation: `(${r.source.title}, ${new Date().getFullYear()})`
      }));
    }
  }

  /**
   * Generate cache key for a research request
   */
  generateCacheKey(topic, options) {
    const stringifiedOptions = JSON.stringify(options);
    return `${topic}_${stringifiedOptions}`;
  }

  /**
   * Get cached result if available
   */
  async getCachedResult(cacheKey) {
    // Check in-memory cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.storage.cacheTtl * 1000) {
        return cached.data;
      } else {
        // Remove expired cache
        this.cache.delete(cacheKey);
      }
    }

    // Check file cache if enabled
    if (this.config.storage.cacheEnabled) {
      try {
        const cacheFile = path.join(this.config.storage.cacheDir, `${cacheKey}.json`);
        const cacheData = await fs.readFile(cacheFile, 'utf8');
        const parsed = JSON.parse(cacheData);
        
        if (Date.now() - parsed.timestamp < this.config.storage.cacheTtl * 1000) {
          return parsed.data;
        } else {
          // Remove expired file cache
          await fs.unlink(cacheFile);
        }
      } catch (error) {
        // Cache file doesn't exist or is invalid
        return null;
      }
    }

    return null;
  }

  /**
   * Set cached result
   */
  async setCachedResult(cacheKey, data) {
    // Set in-memory cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Set file cache if enabled
    if (this.config.storage.cacheEnabled) {
      try {
        const cacheFile = path.join(this.config.storage.cacheDir, `${cacheKey}.json`);
        await fs.writeFile(cacheFile, JSON.stringify({
          data,
          timestamp: Date.now()
        }, null, 2));
      } catch (error) {
        console.error('Failed to write cache file:', error);
      }
    }
  }

  /**
   * Persist research results to storage
   */
  async persistResults(researchContext) {
    try {
      const filename = `research_${this.sessionId}_${Date.now()}.json`;
      const filepath = path.join(this.config.storage.resultStoragePath, filename);
      
      await fs.writeFile(filepath, JSON.stringify(researchContext, null, 2));
    } catch (error) {
      console.error('Failed to persist results:', error);
    }
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    this.emit('config:updated', { config: this.config });
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      sessionId: this.sessionId,
      config: this.config,
      plugins: Array.from(this.plugins.keys()),
      cacheSize: this.cache.size,
      researchHistoryCount: this.researchHistory.length,
      status: 'ready'
    };
  }
}

module.exports = ResearchAgent;