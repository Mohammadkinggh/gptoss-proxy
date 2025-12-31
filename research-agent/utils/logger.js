/**
 * Logger utility for the Research Agent
 */

const fs = require('fs').promises;
const path = require('path');
const { format } = require('util');

class Logger {
  constructor(config = {}) {
    this.config = {
      level: 'info',
      format: 'json',
      enableConsole: true,
      enableFile: false,
      filePath: './logs/research-agent.log',
      ...config
    };
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.currentLevel = this.levels[this.config.level] || this.levels.info;
    
    // Create log directory if needed
    if (this.config.enableFile) {
      const logDir = path.dirname(this.config.filePath);
      fs.mkdir(logDir, { recursive: true }).catch(console.error);
    }
  }

  log(level, message, meta = {}) {
    const levelNum = this.levels[level];
    if (levelNum === undefined || levelNum < this.currentLevel) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    // Output to console
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // Output to file
    if (this.config.enableFile) {
      this.outputToFile(logEntry);
    }
  }

  outputToConsole(entry) {
    const output = this.config.format === 'json' 
      ? JSON.stringify(entry) 
      : `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;
    
    if (entry.level === 'error') {
      console.error(output);
    } else if (entry.level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  async outputToFile(entry) {
    try {
      const output = this.config.format === 'json' 
        ? JSON.stringify(entry) + '\n'
        : `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}\n`;
      
      await fs.appendFile(this.config.filePath, output);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  setLevel(level) {
    this.currentLevel = this.levels[level] || this.levels.info;
  }
}

module.exports = Logger;