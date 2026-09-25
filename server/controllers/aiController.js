const db = require('../config/db');
const { generateAiResponse, isHealthRelated, REDIRECT_MESSAGE } = require('../services/aiService');

const aiController = {
  async chat(req, res) {
    try {
      const { message, companionType = 'unified' } = req.body;
      const userId = req.user ? req.user.id : 1;
      const userProfile = req.user || { name: 'Guest User' };
      const customApiKey = req.headers['x-gemini-key'] || null;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message text is required' });
      }

      // Retrieve recent conversation history for context
      const chatHistory = await db.getChatMessages(userId, companionType);

      // Save user message to database
      const userMsgRecord = await db.addChatMessage(userId, companionType, 'user', message);

      // Generate AI response with guardrails and context
      const responseResult = await generateAiResponse(
        companionType,
        message,
        userProfile,
        chatHistory,
        customApiKey
      );

      // Save assistant response to database
      const assistantMsgRecord = await db.addChatMessage(
        userId,
        companionType,
        'assistant',
        responseResult.content
      );

      res.json({
        reply: responseResult.content,
        companionType,
        guardrailTriggered: responseResult.guardrailTriggered,
        source: responseResult.source,
        messageId: assistantMsgRecord.id,
        timestamp: assistantMsgRecord.createdAt
      });
    } catch (error) {
      console.error('AI chat controller error:', error);
      res.status(500).json({
        message: 'Error generating AI response',
        error: error.message,
        fallbackReply: "I'm here to support your mental and physical wellness. Could you please rephrase or tell me what health goal you'd like to work on?"
      });
    }
  },

  async getHistory(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { companionType = 'all' } = req.query;
      const messages = await db.getChatMessages(userId, companionType);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
    }
  },

  async clearHistory(req, res) {
    try {
      const userId = req.user ? req.user.id : 1;
      const { companionType = 'all' } = req.body;
      await db.clearChat(userId, companionType);
      res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error clearing chat history', error: error.message });
    }
  }
};

module.exports = aiController;
