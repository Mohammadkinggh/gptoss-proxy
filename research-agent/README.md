# Deep Research AI Agent

A fully customizable deep research AI agent that performs comprehensive information gathering, analysis, and synthesis with customizable parameters and plugins.

## Features

- **Multi-source Research**: Searches across multiple academic and general search engines
- **Content Analysis**: Performs sentiment analysis, entity recognition, topic modeling, and bias detection
- **Information Verification**: Cross-references claims and assesses source credibility
- **Citation Generation**: Supports multiple citation formats (APA, MLA, Chicago, Harvard)
- **Customizable Configuration**: Extensive configuration options for persona, tone, depth, and format
- **Plugin Architecture**: Extensible plugin system for adding new capabilities
- **Caching**: Built-in caching to avoid redundant research
- **Report Generation**: Generates structured research reports

## Installation

```bash
cd research-agent
npm install
```

## Configuration

The agent is highly customizable through the configuration file located at `config/default.js`. You can also override settings by providing a custom configuration object when initializing the agent.

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
LOG_LEVEL=info
LOG_TO_FILE=false
LOG_FILE_PATH=./logs/research-agent.log
```

## Usage

### Command Line

```bash
node index.js "your research topic here"
```

Example:
```bash
node index.js "impact of artificial intelligence on healthcare"
```

### Programmatic Usage

```javascript
const { ResearchAgent } = require('./src/ResearchAgent');

// Initialize with custom configuration
const agent = new ResearchAgent({
  llm: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY
  },
  research: {
    maxSources: 15,
    verificationEnabled: true,
    citationStyle: 'apa'
  },
  customization: {
    persona: 'academic-researcher',
    tone: 'professional',
    depth: 'comprehensive',
    format: 'report'
  }
});

// Perform research
const results = await agent.research('your research topic', {
  persona: 'academic-researcher',
  tone: 'professional',
  depth: 'comprehensive',
  format: 'report'
});

console.log(results);
```

## Configuration Options

### LLM Configuration
- `provider`: LLM provider ('openai', 'anthropic', 'ollama', 'custom')
- `model`: Model to use (e.g., 'gpt-4-turbo')
- `temperature`: Creativity control (0.0-1.0)
- `maxTokens`: Maximum tokens in response
- `apiKey`: API key for the provider
- `baseUrl`: Base URL for API requests

### Research Configuration
- `maxDepth`: Maximum recursion depth for research
- `maxSources`: Maximum number of sources to gather
- `verificationEnabled`: Enable fact-checking
- `citationStyle`: Citation format ('apa', 'mla', 'chicago', 'harvard')
- `searchEngines`: Enabled search engines
- `resultQualityThreshold`: Minimum quality score for sources

### Customization Options
- `persona`: Agent persona ('academic-researcher', 'business-analyst', 'journalist', 'student')
- `tone`: Communication tone ('professional', 'casual', 'technical', 'conversational')
- `depth`: Research depth ('brief', 'moderate', 'comprehensive')
- `format`: Output format ('report', 'summary', 'bullet-points', 'structured')
- `language`: Output language (ISO 639-1 code)

## Plugin System

The agent features a plugin architecture that allows extending functionality:

- **Search Plugin**: Handles multi-source search
- **Analysis Plugin**: Performs content analysis
- **Verification Plugin**: Fact-checks and verifies information
- **Citation Plugin**: Generates citations in various formats

You can create custom plugins by implementing the plugin interface and adding them to the plugins directory.

## Architecture

```
research-agent/
├── config/                 # Configuration files
│   └── default.js          # Default configuration
├── src/                    # Source code
│   ├── ResearchAgent.js    # Main agent class
│   └── plugins/            # Plugin implementations
│       ├── search.js       # Search functionality
│       ├── analysis.js     # Content analysis
│       ├── verification.js # Fact-checking
│       └── citation.js     # Citation generation
├── utils/                  # Utility functions
│   └── logger.js           # Logging utility
├── tests/                  # Test files
├── index.js               # Main entry point
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Development

To run in development mode:

```bash
npm run dev "your research topic"
```

To run tests:

```bash
npm test
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security

The agent includes security features such as:
- Rate limiting
- Sensitive data filtering
- Data anonymization
- Consent management

## Support

For support, please open an issue in the GitHub repository.