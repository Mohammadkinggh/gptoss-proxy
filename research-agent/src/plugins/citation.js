/**
 * Citation Plugin for Research Agent
 * 
 * Provides citation generation in various formats (APA, MLA, Chicago, etc.)
 */

class CitationPlugin {
  constructor(config) {
    this.config = config;
  }

  generate(results, style = 'apa') {
    const citations = [];
    
    for (const result of results) {
      const citation = this.generateCitation(result, style);
      if (citation) {
        citations.push({
          source: result.source,
          citation,
          style,
          generatedAt: new Date().toISOString()
        });
      }
    }
    
    return citations;
  }

  generateCitation(result, style) {
    const source = result.source;
    
    // Extract information from the source
    const title = source.title || 'Untitled';
    const url = source.url || '';
    const date = source.date || new Date().toISOString().split('T')[0];
    
    // Generate citation based on style
    switch (style.toLowerCase()) {
      case 'apa':
        return this.generateAPACitation(title, url, date);
      case 'mla':
        return this.generateMLACitation(title, url, date);
      case 'chicago':
        return this.generateChicagoCitation(title, url, date);
      case 'harvard':
        return this.generateHarvardCitation(title, url, date);
      default:
        return this.generateAPACitation(title, url, date); // Default to APA
    }
  }

  generateAPACitation(title, url, date) {
    // APA format: Author/Title. (Year, Month Date). Publisher/Website. URL
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `${title}. (${formattedDate}). Retrieved from ${url}`;
  }

  generateMLACitation(title, url, date) {
    // MLA format: Publisher. "Title." Website, Day Month Year, URL.
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/ /g, ' ');
    
    // Extract domain as publisher
    let publisher = 'Website';
    try {
      const urlObj = new URL(url);
      publisher = urlObj.hostname.replace('www.', '');
    } catch (e) {
      // If URL is invalid, keep default publisher
    }
    
    return `${publisher}. "${title}." ${publisher}, ${formattedDate}, ${url}.`;
  }

  generateChicagoCitation(title, url, date) {
    // Chicago format: Publisher. "Title." Month Day, Year. URL.
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let publisher = 'Website';
    try {
      const urlObj = new URL(url);
      publisher = urlObj.hostname.replace('www.', '');
    } catch (e) {
      // If URL is invalid, keep default publisher
    }
    
    return `${publisher}. "${title}." ${formattedDate}. ${url}.`;
  }

  generateHarvardCitation(title, url, date) {
    // Harvard format: Publisher (Year) 'Title', Website, Available at: URL (Accessed: Date)
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    
    let publisher = 'Website';
    try {
      const urlObj = new URL(url);
      publisher = urlObj.hostname.replace('www.', '');
    } catch (e) {
      // If URL is invalid, keep default publisher
    }
    
    const accessedDate = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return `${publisher} (${year}) '${title}', ${publisher}, Available at: ${url} (Accessed: ${accessedDate})`;
  }
}

module.exports = CitationPlugin;