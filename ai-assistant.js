/**
 * AI Portfolio Assistant
 * Uses meta-llama/Llama-3.2-3B-Instruct model for interactive user guidance
 * Secure API integration with HuggingFace Inference API
 * 
 * Configuration: API key is loaded from config.js (see config.example.js for setup)
 */

class AIPortfolioAssistant {
  constructor() {
    // Model name from config.js
    this.modelName = (typeof CONFIG !== 'undefined' && CONFIG.MODEL_NAME)
      ? CONFIG.MODEL_NAME
      : 'meta-llama/Llama-3.2-3B-Instruct';
    this.isOpen = false;
    this.isTyping = false;
    this.conversationHistory = [];
    
    // Portfolio context will be extracted from the page
    this.portfolioContext = '';
    
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadApiKey();
    this.extractPortfolioContext();
  }

  createWidget() {
    // Create chat widget container
    const widgetHTML = `
      <div id="ai-assistant-widget" class="ai-widget">
        <!-- Chat Toggle Button -->
        <button id="ai-toggle-btn" class="ai-toggle-btn" aria-label="Open AI Assistant">
          <svg class="ai-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C11.45 12 11 12.45 11 13V15H13V13.83C14.72 13.41 16 11.86 16 10C16 7.79 14.21 6 12 6Z" fill="currentColor"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
          </svg>
          <span class="ai-btn-text">AI Assistant</span>
        </button>

        <!-- Chat Window -->
        <div id="ai-chat-window" class="ai-chat-window hidden">
          <div class="ai-chat-header">
            <div class="ai-header-info">
              <div class="ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="ai-header-text">
                <h3>Portfolio AI Assistant</h3>
                <span class="ai-status">Powered by Llama 3.2</span>
              </div>
            </div>
            <button id="ai-close-btn" class="ai-close-btn" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div id="ai-chat-messages" class="ai-chat-messages">
            <!-- API Key Error Message (shown when config is missing) -->
            <div id="ai-config-error" class="ai-api-setup hidden">
              <div class="ai-setup-card">
                <h4>⚠️ Configuration Required</h4>
                <p>The AI Assistant is not configured. Please set up your API key in <code>config.js</code></p>
                <p class="ai-setup-note">
                  See <code>config.example.js</code> for instructions.
                  <br><br>
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                    Get your free API key from HuggingFace →
                  </a>
                </p>
              </div>
            </div>

            <!-- Welcome Message (shown when API key is configured) -->
            <div id="ai-welcome-message" class="ai-message ai-assistant hidden">
              <div class="ai-message-content">
                <p>👋 Hi! I'm Mokshith's AI Portfolio Assistant. I can help you learn about:</p>
                <ul>
                  <li>🎓 Education & Background</li>
                  <li>💼 Skills & Technologies</li>
                  <li>🚀 Projects & Work</li>
                  <li>📜 Certifications</li>
                  <li>📧 Contact Information</li>
                </ul>
                <p>Feel free to ask me anything!</p>
              </div>
            </div>
          </div>

          <div class="ai-chat-input-container">
            <div class="ai-quick-actions">
              <button class="ai-quick-btn" data-question="Tell me about Mokshith's projects">Projects</button>
              <button class="ai-quick-btn" data-question="What are Mokshith's skills?">Skills</button>
              <button class="ai-quick-btn" data-question="What is Mokshith's educational background?">Education</button>
            </div>
            <div class="ai-input-wrapper">
              <textarea id="ai-input" placeholder="Ask me about Mokshith's portfolio..." rows="1"></textarea>
              <button id="ai-send-btn" class="ai-send-btn" aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  attachEventListeners() {
    // Toggle chat window
    document.getElementById('ai-toggle-btn').addEventListener('click', () => this.toggleChat());
    document.getElementById('ai-close-btn').addEventListener('click', () => this.toggleChat());

    // Send message
    document.getElementById('ai-send-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('ai-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    document.getElementById('ai-input').addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    // Quick action buttons
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        document.getElementById('ai-input').value = question;
        this.sendMessage();
      });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('ai-chat-window');
    const toggleBtn = document.getElementById('ai-toggle-btn');
    
    if (this.isOpen) {
      chatWindow.classList.remove('hidden');
      chatWindow.classList.add('visible');
      toggleBtn.classList.add('active');
      document.getElementById('ai-input').focus();
    } else {
      chatWindow.classList.add('hidden');
      chatWindow.classList.remove('visible');
      toggleBtn.classList.remove('active');
    }
  }

  loadApiKey() {
    // No API key required on frontend for secure backend approach
    this.showChatInterface();
  }

  showConfigError() {
    document.getElementById('ai-config-error').classList.remove('hidden');
    document.getElementById('ai-welcome-message').classList.add('hidden');
  }

  showChatInterface() {
    document.getElementById('ai-config-error').classList.add('hidden');
    document.getElementById('ai-welcome-message').classList.remove('hidden');
  }

  extractPortfolioContext() {
    // Dynamically extract portfolio content from the page
    let context = 'You are an AI assistant for a portfolio website. Help visitors learn about the portfolio owner and their work.\n\n';
    
    // Extract name from navbar or home section
    const nameElement = document.querySelector('.navbar-brand') || document.querySelector('.home-content .name h1');
    const name = nameElement ? nameElement.textContent.trim() : 'the portfolio owner';
    context += `PORTFOLIO OWNER: ${name}\n\n`;
    
    // Extract intro/subtitle
    const subtitleElement = document.querySelector('.home-content .name h4');
    if (subtitleElement) {
      context += `CURRENT ROLE: ${subtitleElement.textContent.trim()}\n\n`;
    }
    
    // Extract About section
    const aboutSection = document.querySelector('.about-me');
    if (aboutSection) {
      const aboutText = aboutSection.querySelector('.left-content p');
      if (aboutText) {
        context += `ABOUT:\n${aboutText.textContent.trim()}\n\n`;
      }
    }
    
    // Extract Education
    const educationCards = document.querySelectorAll('.education-entry');
    if (educationCards.length > 0) {
      context += 'EDUCATION:\n';
      educationCards.forEach(card => {
        const degree = card.querySelector('.education-degree')?.textContent.trim() || '';
        const institute = card.querySelector('.education-institute')?.textContent.trim() || '';
        const years = card.querySelectorAll('.education-year');
        let yearInfo = '';
        years.forEach(y => yearInfo += y.textContent.trim() + ' ');
        context += `- ${degree} from ${institute} (${yearInfo.trim()})\n`;
      });
      context += '\n';
    }
    
    // Extract Skills
    const skillsList = document.querySelector('.skills-list');
    if (skillsList) {
      context += 'SKILLS:\n';
      const skillItems = skillsList.querySelectorAll('li');
      skillItems.forEach(item => {
        context += `- ${item.textContent.trim()}\n`;
      });
      context += '\n';
    }
    
    // Extract Projects
    const projectCards = document.querySelectorAll('#my-works .card, .portfolio .card');
    if (projectCards.length > 0) {
      context += 'PROJECTS:\n';
      projectCards.forEach((card, index) => {
        const title = card.querySelector('h2')?.textContent.trim() || '';
        const description = card.querySelector('p')?.textContent.trim() || '';
        const link = card.querySelector('a')?.href || '';
        context += `${index + 1}. ${title}: ${description}`;
        if (link && !link.includes('javascript:')) {
          context += ` (Link: ${link})`;
        }
        context += '\n\n';
      });
    }
    
    // Extract Certifications
    const certTiles = document.querySelectorAll('#certifications .tile');
    if (certTiles.length > 0) {
      context += 'CERTIFICATIONS:\n';
      certTiles.forEach(tile => {
        const certName = tile.querySelector('h4')?.textContent.trim() || '';
        if (certName) {
          context += `- ${certName}\n`;
        }
      });
      context += '\n';
    }
    
    // Extract Contact information
    const contactSection = document.querySelector('.contact-content');
    if (contactSection) {
      context += 'CONTACT:\n';
      const email = contactSection.querySelector('.mail-link, a[href^="mailto:"]');
      if (email) {
        context += `- Email: ${email.textContent.trim()}\n`;
      }
      const socialLinks = contactSection.querySelectorAll('a[target="blank"], a[target="_blank"]');
      socialLinks.forEach(link => {
        const text = link.textContent.trim();
        const href = link.href;
        if (text && href && !href.includes('mailto:')) {
          context += `- ${text}: ${href}\n`;
        }
      });
      context += '\n';
    }
    
    context += 'Be helpful, friendly, and concise. Answer questions about the portfolio owner\'s background, skills, projects, and experience. If asked something not related to the portfolio, politely redirect to portfolio-related topics.';
    
    this.portfolioContext = context;
    console.log('Extracted portfolio context:', this.portfolioContext);
  }

  async sendMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message || this.isTyping) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Add user message
    this.addMessage(message, 'user');
    
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await this.callLlamaAPI(message);
      this.hideTypingIndicator();
      this.addMessage(response, 'assistant');
      this.conversationHistory.push({ role: 'assistant', content: response });
    } catch (error) {
      this.hideTypingIndicator();
      console.error('AI Assistant Error:', error);
      this.addMessage('Sorry, I encountered an error. Please try again or check your API key.', 'assistant');
    }
  }

  async callLlamaAPI(userMessage) {
    // Build messages array for chat completions API
    const messages = [
      {
        role: 'system',
        content: this.portfolioContext
      }
    ];
    
    // Add conversation history (last 6 messages for context)
    const recentHistory = this.conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('Calling backend /api/huggingface for model:', this.modelName);
    const response = await fetch('/api/huggingface', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'v1/chat/completions',
        body: {
          model: this.modelName,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9
        }
      })
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your HuggingFace API key.');
      } else if (response.status === 503) {
        // Model is loading - this is common for free tier
        if (errorData.estimated_time) {
          throw new Error(`Model is loading. Please wait ${Math.ceil(errorData.estimated_time)} seconds and try again.`);
        }
        throw new Error('Model is loading. Please wait a moment and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(errorData.error?.message || errorData.error || `API request failed (${response.status})`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    // Handle chat completions response format
    if (data.choices && data.choices[0]?.message?.content) {
      return this.cleanResponse(data.choices[0].message.content);
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      return this.cleanResponse(data[0].generated_text);
    } else if (data.generated_text) {
      return this.cleanResponse(data.generated_text);
    }
    
    return "I apologize, I couldn't generate a response. Please try again.";
  }

  cleanResponse(text) {
    // Remove any trailing special tokens
    text = text.replace(/<\|eot_id\|>/g, '').trim();
    text = text.replace(/<\|end_of_text\|>/g, '').trim();
    return text;
  }

  addMessage(content, role) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.innerHTML = `<p>${this.formatMessage(content)}</p>`;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(text) {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  showTypingIndicator() {
    this.isTyping = true;
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.className = 'ai-message ai-assistant ai-typing';
    typingDiv.innerHTML = `
      <div class="ai-message-content">
        <div class="ai-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// Initialize the AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aiAssistant = new AIPortfolioAssistant();
});
