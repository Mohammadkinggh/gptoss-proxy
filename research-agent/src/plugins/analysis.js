/**
 * Analysis Plugin for Research Agent
 * 
 * Provides content analysis capabilities including sentiment, entity recognition,
 * topic modeling, and bias detection
 */

class AnalysisPlugin {
  constructor(config) {
    this.config = config;
  }

  async analyze(content, topic) {
    const analysis = {
      relevance: this.calculateRelevance(content, topic),
      sentiment: this.performSentimentAnalysis(content),
      entities: this.extractEntities(content),
      topics: this.extractTopics(content, topic),
      quality: this.assessQuality(content),
      bias: this.detectBias(content),
      readability: this.assessReadability(content)
    };

    return analysis;
  }

  calculateRelevance(content, topic) {
    // Simple relevance calculation based on keyword matching
    const contentText = this.extractTextFromContent(content);
    const topicWords = topic.toLowerCase().split(/\s+/);
    const contentWords = contentText.toLowerCase().split(/\s+/);
    
    let matches = 0;
    topicWords.forEach(word => {
      if (contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))) {
        matches++;
      }
    });
    
    return Math.min(1.0, matches / Math.max(topicWords.length, 1));
  }

  performSentimentAnalysis(content) {
    // Simple sentiment analysis based on positive/negative word counts
    // In a real implementation, you would use a proper NLP library
    const text = this.extractTextFromContent(content);
    const positiveWords = ['good', 'excellent', 'positive', 'beneficial', 'effective', 'successful', 'improved', 'significant'];
    const negativeWords = ['bad', 'poor', 'negative', 'harmful', 'ineffective', 'failed', 'worse', 'problematic'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(posWord => word.includes(posWord))) positiveCount++;
      if (negativeWords.some(negWord => word.includes(negWord))) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  extractEntities(content) {
    // Simple entity extraction - in a real implementation, you would use NER
    const text = this.extractTextFromContent(content);
    
    // Extract email addresses
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    
    // Extract URLs
    const urls = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || [];
    
    // Extract potential organizations (capitalized words followed by common org suffixes)
    const orgs = text.match(/\b[A-Z][A-Za-z\s&-]*(?:Inc|Corp|LLC|Ltd|Company|Association|Foundation|Institute)\b/g) || [];
    
    // Extract potential person names (simple pattern)
    const people = text.match(/\b[A-Z][a-z]{2,}\s[A-Z][a-z]{2,}\b/g) || [];
    
    return {
      emails,
      urls,
      organizations: orgs,
      people
    };
  }

  extractTopics(content, topic) {
    // Simple topic extraction based on keyword analysis
    const text = this.extractTextFromContent(content);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter out short words
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)); // Common stop words
    
    // Count word frequencies
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    // Get top 5 most frequent words as potential topics
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    // Include the original topic if it's relevant
    if (!topWords.includes(topic.toLowerCase())) {
      topWords.unshift(topic);
    }
    
    return topWords.slice(0, 6); // Return up to 6 topics
  }

  assessQuality(content) {
    const text = this.extractTextFromContent(content);
    
    // Quality metrics
    const length = text.length;
    const wordCount = text.split(/\s+/).length;
    const hasCitations = /(?:reference|citation|source|study|research|journal|paper|author)/i.test(text);
    const hasStructure = /(?:introduction|methodology|results|conclusion|abstract|literature review)/i.test(text);
    
    // Calculate quality score
    let quality = 0.5; // Base quality
    
    // Length bonus (to a point)
    if (wordCount > 100) quality += 0.2;
    if (wordCount > 500) quality += 0.1;
    
    // Structure bonus
    if (hasStructure) quality += 0.15;
    
    // Citation bonus
    if (hasCitations) quality += 0.15;
    
    // Cap at 1.0
    return Math.min(1.0, quality);
  }

  detectBias(content) {
    // Simple bias detection based on loaded language
    const text = this.extractTextFromContent(content);
    const biasIndicators = [
      'obviously', 'clearly', 'of course', 'naturally', 'undoubtedly',
      'certainly', 'definitely', 'absolutely', 'always', 'never',
      'all', 'every', 'none', 'only', 'just', 'simply'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let biasCount = 0;
    
    words.forEach(word => {
      if (biasIndicators.some(indicator => word.includes(indicator))) {
        biasCount++;
      }
    });
    
    const biasScore = biasCount / Math.max(words.length, 1);
    
    if (biasScore > 0.05) return 'high';
    if (biasScore > 0.02) return 'medium';
    return 'low';
  }

  assessReadability(content) {
    const text = this.extractTextFromContent(content);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);
    
    if (sentences.length === 0 || words.length === 0) return 0.5;
    
    // Calculate Automated Readability Index (ARI)
    const characters = text.replace(/\s/g, '').length;
    const ari = 4.71 * (characters / words.length) + 0.5 * (words.length / sentences.length) - 21.43;
    
    // Convert to readability score (0-1, where 1 is most readable)
    // ARI of 0-6 is considered highly readable, 13+ is very difficult
    const normalized = Math.max(0, Math.min(1, (13 - ari) / 13));
    
    return normalized;
  }

  countSyllables(text) {
    // Simple syllable counting algorithm
    const words = text.split(/\s+/);
    let count = 0;
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (cleanWord.length === 0) continue;
      
      // Count vowel groups
      const vowels = cleanWord.match(/[aeiouy]+/g);
      if (vowels) {
        let syllableCount = vowels.length;
        
        // Subtract 1 for silent e at the end
        if (cleanWord.endsWith('e')) {
          syllableCount = Math.max(1, syllableCount - 1);
        }
        
        count += syllableCount;
      } else {
        count += 1; // At least one syllable
      }
    }
    
    return count;
  }

  extractTextFromContent(content) {
    // Extract text from content object
    if (typeof content === 'string') {
      return content;
    }
    
    if (content && typeof content === 'object') {
      if (content.content) {
        return content.content;
      } else if (content.text) {
        return content.text;
      } else {
        return JSON.stringify(content);
      }
    }
    
    return '';
  }
}

module.exports = AnalysisPlugin;