/**
 * Example usage of the Deep Research AI Agent
 */

require('dotenv').config();
const { ResearchAgent } = require('./src/ResearchAgent');

async function runExample() {
  console.log('🔍 Initializing Deep Research AI Agent...\n');
  
  // Initialize the research agent with custom configuration
  const agent = new ResearchAgent({
    llm: {
      provider: 'openai',
      model: process.env.MODEL_NAME || 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
      maxTokens: 2000
    },
    research: {
      maxSources: 5,
      verificationEnabled: true,
      citationStyle: 'apa',
      searchEngines: ['google', 'semantic_scholar'],
      resultQualityThreshold: 0.6
    },
    customization: {
      persona: 'academic-researcher',
      tone: 'professional',
      depth: 'comprehensive',
      format: 'report',
      language: 'en'
    },
    storage: {
      cacheEnabled: true,
      cacheTtl: 3600, // 1 hour
      persistResults: true
    }
  });

  // Example research topics
  const topics = [
    "recent advances in renewable energy technology",
    "impact of artificial intelligence on healthcare",
    "climate change effects on biodiversity"
  ];

  for (const topic of topics) {
    console.log(`\n🚀 Starting research on: "${topic}"`);
    console.log('----------------------------------------');
    
    try {
      const results = await agent.research(topic, {
        persona: 'academic-researcher',
        tone: 'professional',
        depth: 'comprehensive',
        format: 'report'
      });

      console.log(`\n✅ Research completed for: "${topic}"`);
      console.log(`📊 Found ${results.sources.length} sources`);
      console.log(`📝 Generated ${results.report.citations.length} citations`);
      
      if (results.verification) {
        console.log(`🔍 Verification confidence: ${(results.verification.confidence * 100).toFixed(1)}%`);
      }
      
      console.log(`📋 Report preview: ${results.report.content.substring(0, 200)}...`);
      
    } catch (error) {
      console.error(`❌ Error researching "${topic}":`, error.message);
    }
    
    // Add a delay between topics to be respectful to APIs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎯 All research tasks completed!');
  console.log('\n📋 Agent Status:');
  console.log('----------------');
  const status = agent.getStatus();
  console.log(`Session ID: ${status.sessionId}`);
  console.log(`Loaded Plugins: ${status.plugins.join(', ')}`);
  console.log(`Cache Size: ${status.cacheSize}`);
  console.log(`Research History: ${status.researchHistoryCount} tasks`);
}

// Run the example
if (require.main === module) {
  runExample().catch(console.error);
}

module.exports = { runExample };