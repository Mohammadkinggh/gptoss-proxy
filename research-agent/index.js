/**
 * Deep Research AI Agent - Main Entry Point
 * 
 * This file serves as the main entry point for the research agent system.
 * It can be used to start the agent as a service or run research tasks.
 */

require('dotenv').config();
const ResearchAgent = require('./src/ResearchAgent');
const Logger = require('./utils/logger');

// Initialize logger
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  enableConsole: true,
  enableFile: process.env.LOG_TO_FILE === 'true',
  filePath: process.env.LOG_FILE_PATH || './logs/research-agent.log'
});

/**
 * Main function to run the research agent
 */
async function main() {
  try {
    // Initialize the research agent with default configuration
    const agent = new ResearchAgent();
    
    // Set up event listeners
    agent.on('agent:init', (data) => {
      logger.info('Agent initialized', { sessionId: data.sessionId });
    });
    
    agent.on('research:start', (data) => {
      logger.info('Research started', { 
        topic: data.topic, 
        sessionId: data.sessionId 
      });
    });
    
    agent.on('research:complete', (data) => {
      logger.info('Research completed', { 
        topic: data.topic, 
        sessionId: data.sessionId 
      });
    });
    
    agent.on('research:error', (data) => {
      logger.error('Research error', { 
        topic: data.topic, 
        error: data.error, 
        sessionId: data.sessionId 
      });
    });
    
    // Example usage - perform a research task
    if (process.argv.length > 2) {
      const topic = process.argv.slice(2).join(' ');
      
      logger.info(`Starting research on topic: ${topic}`);
      
      const results = await agent.research(topic, {
        persona: "academic-researcher",
        tone: "professional",
        depth: "comprehensive",
        format: "report"
      });
      
      console.log('\nResearch Results:');
      console.log('=================');
      console.log(`Topic: ${results.topic}`);
      console.log(`Generated Report: ${results.report.content.substring(0, 500)}...`);
      console.log(`Sources Found: ${results.sources.length}`);
      console.log(`Citations Generated: ${results.report.citations.length}`);
      
      if (results.verification) {
        console.log('\nVerification Summary:');
        console.log(results.verification.verification_summary);
      }
      
      // Save results to file
      const fs = require('fs').promises;
      const path = require('path');
      
      const outputDir = path.join(__dirname, 'output');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filename = `research_${Date.now()}.json`;
      const filepath = path.join(outputDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(results, null, 2));
      console.log(`\nFull results saved to: ${filepath}`);
    } else {
      console.log('Deep Research AI Agent');
      console.log('======================');
      console.log('Usage: node index.js "<research topic>"');
      console.log('Example: node index.js "impact of climate change on agriculture"');
      
      // Show agent status
      const status = agent.getStatus();
      console.log('\nAgent Status:');
      console.log('-------------');
      console.log(`Session ID: ${status.sessionId}`);
      console.log(`Status: ${status.status}`);
      console.log(`Loaded Plugins: ${status.plugins.join(', ')}`);
      console.log(`Cache Size: ${status.cacheSize}`);
      console.log(`Research History: ${status.researchHistoryCount}`);
    }
  } catch (error) {
    logger.error('Agent error', { error: error.message });
    console.error('Error running research agent:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason: reason.message || reason });
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { ResearchAgent, Logger };