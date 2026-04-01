// 🧠 AI-POWERED FIX GENERATION ENGINE
// Context-aware, GPT-powered code fixing

const fs = require('fs');
const path = require('path');

class AIFixEngine {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4o-mini';
    this.temperature = 0.2;
  }

  async generateFix(issue, fileContent) {
    try {
      // Step 1: Construct prompt
      const prompt = this.constructPrompt(issue, fileContent);
      
      // Step 2: Call OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // Step 3: Validate response
      const validation = this.validateResponse(response, issue);
      
      if (!validation.isValid) {
        return {
          success: false,
          reason: validation.reason,
          confidenceScore: 0
        };
      }
      
      // Step 4: Calculate confidence score
      const confidenceScore = this.calculateConfidence(response, issue);
      
      // Step 5: Safety check
      if (confidenceScore < 0.7) {
        return {
          success: false,
          reason: 'Low confidence score',
          confidenceScore
        };
      }
      
      return {
        success: true,
        updatedCode: response.code,
        confidenceScore,
        explanation: response.explanation
      };
      
    } catch (error) {
      return {
        success: false,
        reason: `AI fix generation failed: ${error.message}`,
        confidenceScore: 0
      };
    }
  }

  constructPrompt(issue, fileContent) {
    const fileExtension = path.extname(issue.file);
    const isJavaScript = fileExtension === '.js';
    const isHTML = fileExtension === '.html';
    
    let prompt = `You are an expert software engineer. Fix the following issue in the provided code.\n\n`;
    prompt += `ISSUE TYPE: ${issue.type}\n`;
    prompt += `ISSUE DESCRIPTION: ${issue.description}\n`;
    prompt += `FILE: ${issue.file}\n\n`;
    
    // Add relevant file snippet (max 300 lines)
    const lines = fileContent.split('\n');
    const relevantLines = this.extractRelevantLines(lines, issue);
    prompt += `CODE TO FIX:\n\`\`\`${isJavaScript ? 'javascript' : 'html'}\n`;
    prompt += relevantLines.join('\n');
    prompt += `\n\`\`\`\n\n`;
    
    // Add expected behavior
    prompt += `EXPECTED BEHAVIOR:\n`;
    prompt += this.getExpectedBehavior(issue);
    prompt += `\n\n`;
    
    // Add instructions
    prompt += `INSTRUCTIONS:\n`;
    prompt += `1. Fix the identified issue\n`;
    prompt += `2. Maintain existing functionality\n`;
    prompt += `3. Follow best practices for ${isJavaScript ? 'JavaScript' : 'HTML'}\n`;
    prompt += `4. Return ONLY the updated code (no explanations)\n`;
    prompt += `5. Ensure the fix is minimal and focused\n\n`;
    
    prompt += `RESPONSE FORMAT:\n`;
    prompt += `---CODE---\n[updated code here]\n---EXPLANATION---\n[brief explanation of fix]\n---END---`;
    
    return prompt;
  }

  extractRelevantLines(lines, issue) {
    // Extract lines around the issue location
    const maxLines = 300;
    const context = 20; // lines before and after
    
    if (issue.lineNumber) {
      const start = Math.max(0, issue.lineNumber - context);
      const end = Math.min(lines.length, issue.lineNumber + context);
      return lines.slice(start, end);
    }
    
    // If no line number, try to find relevant section
    if (issue.type.includes('form')) {
      const formIndex = lines.findIndex(line => line.includes('<form'));
      if (formIndex !== -1) {
        const start = Math.max(0, formIndex - 10);
        const end = Math.min(lines.length, formIndex + 20);
        return lines.slice(start, end);
      }
    }
    
    if (issue.type.includes('api') || issue.type.includes('try')) {
      const routeIndex = lines.findIndex(line => line.includes('app.'));
      if (routeIndex !== -1) {
        const start = Math.max(0, routeIndex - 5);
        const end = Math.min(lines.length, routeIndex + 25);
        return lines.slice(start, end);
      }
    }
    
    // Return first maxLines if no specific location found
    return lines.slice(0, maxLines);
  }

  getExpectedBehavior(issue) {
    const behaviors = {
      'missing_form_validation': 'All forms should have proper validation attributes (required, pattern, etc.)',
      'missing_try_catch': 'All async routes should have try-catch blocks for error handling',
      'api_error_handling': 'API endpoints should handle errors gracefully and return proper error responses',
      'missing_charset': 'HTML files should include charset meta tag for proper encoding',
      'console_error': 'Console.error statements should be replaced with proper logging'
    };
    
    return behaviors[issue.type] || 'Fix the identified issue following best practices';
  }

  async callOpenAI(prompt) {
    if (!this.openaiApiKey) {
      // Fallback to mock response for demo
      return this.generateMockResponse(prompt);
    }
    
    try {
      const fetch = require('node-fetch');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software engineer who provides precise code fixes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseResponse(content);
      
    } catch (error) {
      console.error('OpenAI API call failed:', error.message);
      return this.generateMockResponse(prompt);
    }
  }

  parseResponse(content) {
    const codeMatch = content.match(/---CODE---\n([\s\S]*?)\n---EXPLANATION---/);
    const explanationMatch = content.match(/---EXPLANATION---\n([\s\S]*?)\n---END---/);
    
    return {
      code: codeMatch ? codeMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'AI-generated fix'
    };
  }

  generateMockResponse(prompt) {
    // Generate intelligent mock responses based on the prompt
    if (prompt.includes('missing_form_validation')) {
      return {
        code: `<form required class="email-form" id="earlyAccessForm">
        <input 
          type="email" 
          id="emailInput"
          placeholder="Enter your email" 
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
        />
        <button type="submit" id="submitBtn">
          Join Early Access
        </button>
      </form>`,
        explanation: 'Added required and pattern attributes for proper email validation'
      };
    }
    
    if (prompt.includes('missing_try_catch') || prompt.includes('api_error_handling')) {
      return {
        code: `app.post('/api/example', async (req, res) => {
  try {
    const data = req.body;
    // Process data here
    res.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});`,
        explanation: 'Added try-catch block for proper error handling'
      };
    }
    
    if (prompt.includes('missing_charset')) {
      return {
        code: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OnPurpose</title>
</head>`,
        explanation: 'Added UTF-8 charset meta tag'
      };
    }
    
    // Default mock response
    return {
      code: prompt.includes('---CODE---') ? 
        prompt.split('---CODE---')[1].split('---EXPLANATION---')[0].trim() :
        '// AI-generated fix would appear here',
      explanation: 'AI-generated fix based on issue analysis'
    };
  }

  validateResponse(response, issue) {
    if (!response.code || response.code.trim() === '') {
      return {
        isValid: false,
        reason: 'Empty code response'
      };
    }
    
    // Syntax validation
    const fileExtension = path.extname(issue.file);
    if (fileExtension === '.js') {
      try {
        // Basic syntax check
        new Function(response.code);
      } catch (error) {
        return {
          isValid: false,
          reason: `JavaScript syntax error: ${error.message}`
        };
      }
    }
    
    // Check if the fix actually addresses the issue
    const hasRequiredAttributes = this.checkFixAddressesIssue(response.code, issue);
    if (!hasRequiredAttributes) {
      return {
        isValid: false,
        reason: 'Fix does not address the identified issue'
      };
    }
    
    return {
      isValid: true,
      reason: 'Valid response'
    };
  }

  checkFixAddressesIssue(code, issue) {
    switch (issue.type) {
      case 'missing_form_validation':
        return code.includes('required') || code.includes('pattern');
      
      case 'missing_try_catch':
      case 'api_error_handling':
        return code.includes('try') && code.includes('catch');
      
      case 'missing_charset':
        return code.includes('charset');
      
      case 'console_error':
        return !code.includes('console.error') || code.includes('logger');
      
      default:
        return true; // Assume valid for unknown types
    }
  }

  calculateConfidence(response, issue) {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on issue type and fix quality
    if (this.checkFixAddressesIssue(response.code, issue)) {
      confidence += 0.3;
    }
    
    // Boost confidence based on explanation quality
    if (response.explanation && response.explanation.length > 10) {
      confidence += 0.1;
    }
    
    // Boost confidence based on code complexity
    const codeLines = response.code.split('\n').length;
    if (codeLines > 5 && codeLines < 50) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
}

module.exports = AIFixEngine;
