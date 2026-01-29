/**
 * Configuration Template for AI Portfolio Assistant
 * 
 * Instructions:
 * 1. Copy this file and rename it to config.js
 * 2. Replace 'YOUR_HUGGINGFACE_API_KEY_HERE' with your actual HuggingFace API key
 * 3. Get your free API key from: https://huggingface.co/settings/tokens
 * 
 * IMPORTANT: Never commit config.js to version control!
 */

const CONFIG = {
  // HuggingFace API Key
  HUGGINGFACE_API_KEY: 'YOUR_HUGGINGFACE_API_KEY_HERE',
  
  // Model to use (Llama 3.2 3B Instruct)
  MODEL_NAME: 'meta-llama/Llama-3.2-3B-Instruct',
  
  // HuggingFace Router API endpoint
  MODEL_ENDPOINT: 'https://router.huggingface.co/v1/chat/completions'
};
