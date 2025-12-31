/**
 * Verification Plugin for Research Agent
 * 
 * Provides fact-checking and information verification capabilities
 */

class VerificationPlugin {
  constructor(config) {
    this.config = config;
  }

  async verify(researchContext) {
    const { results, sources } = researchContext;
    
    const verification = {
      status: 'completed',
      confidence: 0.0,
      cross_references: [],
      fact_checks: [],
      credibility_scores: [],
      verification_summary: ''
    };

    // Perform cross-referencing between sources
    verification.cross_references = await this.performCrossReferencing(results);
    
    // Perform fact-checking on key claims
    verification.fact_checks = await this.performFactChecking(results);
    
    // Calculate credibility scores for sources
    verification.credibility_scores = await this.calculateCredibility(results);
    
    // Generate verification summary
    verification.verification_summary = this.generateVerificationSummary(verification);
    
    // Calculate overall confidence
    verification.confidence = this.calculateOverallConfidence(verification);
    
    return verification;
  }

  async performCrossReferencing(results) {
    // Look for common claims across multiple sources
    const claimsMap = new Map();
    
    for (const result of results) {
      const content = result.content.content || '';
      const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      
      for (const sentence of sentences) {
        // Normalize the sentence for comparison
        const normalized = this.normalizeClaim(sentence);
        
        if (!claimsMap.has(normalized)) {
          claimsMap.set(normalized, []);
        }
        
        claimsMap.get(normalized).push({
          source: result.source.title,
          url: result.source.url,
          content: sentence
        });
      }
    }
    
    // Filter claims that appear in multiple sources
    const crossRefs = [];
    for (const [claim, sources] of claimsMap) {
      if (sources.length > 1) {
        crossRefs.push({
          claim,
          sources,
          count: sources.length
        });
      }
    }
    
    // Sort by count (most referenced first)
    crossRefs.sort((a, b) => b.count - a.count);
    
    return crossRefs;
  }

  async performFactChecking(results) {
    const factChecks = [];
    
    for (const result of results) {
      const content = result.content.content || '';
      const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      
      for (const sentence of sentences) {
        // Look for factual claims (numbers, dates, specific statements)
        const hasNumber = /\d{4}|\d+/.test(sentence);  // Dates or numbers
        const hasSpecificClaim = /found|discovered|research|study|shows|indicates|reveals|demonstrates/.test(sentence);
        
        if (hasNumber || hasSpecificClaim) {
          factChecks.push({
            claim: sentence,
            source: result.source.title,
            url: result.source.url,
            status: 'unchecked', // In a real system, this would be verified
            confidence: 0.5,
            checkedAt: new Date().toISOString()
          });
        }
      }
    }
    
    return factChecks;
  }

  async calculateCredibility(results) {
    const credibilityScores = [];
    
    for (const result of results) {
      let score = 0.5; // Base credibility
      
      // Assess credibility based on source quality
      const source = result.source;
      
      // Domain-based credibility (academic domains score higher)
      if (source.url.includes('edu') || source.url.includes('org') || source.url.includes('gov')) {
        score += 0.2;
      } else if (source.url.includes('com')) {
        score += 0.1;
      }
      
      // Quality from analysis
      if (result.analysis && result.analysis.quality) {
        score = (score + result.analysis.quality) / 2;
      }
      
      // Bias assessment
      if (result.analysis && result.analysis.bias) {
        if (result.analysis.bias === 'high') score -= 0.2;
        else if (result.analysis.bias === 'medium') score -= 0.1;
      }
      
      // Readability (very low readability might indicate poor quality)
      if (result.analysis && result.analysis.readability) {
        if (result.analysis.readability < 0.2) score -= 0.1;
        else if (result.analysis.readability > 0.7) score += 0.1;
      }
      
      // Cap between 0 and 1
      score = Math.max(0, Math.min(1, score));
      
      credibilityScores.push({
        source: source.title,
        url: source.url,
        credibility: score,
        calculatedAt: new Date().toISOString()
      });
    }
    
    return credibilityScores;
  }

  generateVerificationSummary(verification) {
    const { cross_references, fact_checks, credibility_scores } = verification;
    
    const totalSources = credibility_scores.length;
    const highlyCredible = credibility_scores.filter(c => c.credibility > 0.8).length;
    const crossRefCount = cross_references.length;
    const factCheckCount = fact_checks.length;
    
    return `Verification Summary:
- Total sources analyzed: ${totalSources}
- Highly credible sources (credibility > 0.8): ${highlyCredible}
- Claims with cross-references: ${crossRefCount}
- Claims identified for fact-checking: ${factCheckCount}
    
${crossRefCount > 0 
  ? `Key findings supported by multiple sources: ${crossRefCount} claims` 
  : 'No cross-referenced claims found.'}
    
Credibility distribution: ${
  highlyCredible === totalSources 
    ? 'All sources are highly credible' 
    : `${highlyCredible} out of ${totalSources} sources are highly credible`
}`;
  }

  calculateOverallConfidence(verification) {
    const { cross_references, credibility_scores } = verification;
    
    // Base confidence on cross-referencing
    const crossRefConfidence = Math.min(1.0, cross_references.length * 0.3);
    
    // Base confidence on source credibility
    const avgCredibility = credibility_scores.length > 0
      ? credibility_scores.reduce((sum, score) => sum + score.credibility, 0) / credibility_scores.length
      : 0.5;
    
    // Weighted average
    return (crossRefConfidence * 0.6 + avgCredibility * 0.4);
  }

  normalizeClaim(claim) {
    // Remove extra whitespace and normalize for comparison
    return claim
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }
}

module.exports = VerificationPlugin;