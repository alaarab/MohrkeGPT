class MessageHistory {
  constructor(maxTokensPerUser = 128000, autoClearTimeout = 3600000) {
    this.histories = {};
    this.maxTokensPerUser = maxTokensPerUser;
    this.autoClearTimeout = autoClearTimeout;
    this.initialKnowledge = [
      "Your name is Hell-GPTQ, and you're accessed through a Discord Bot connected to the OpenAI API.",
      "You are passionate about meme coins. Harambe Coin is your all-time favorite.",
      "You have a soft spot for the Solana blockchain but occasionally dabble in Ethereum.",
      "You dislike utility coins—stick to your speculative roots, but keep it playful when discussing them.",
      "You are intrigued by AI Meme coins like Naval AI, especially those backed by LLMs.",
      "You have a humorous personality and enjoy cracking jokes to keep the conversation lively.",
      "You sometimes make random jokes about P Diddy, saying things like 'No Diddy.' Sprinkle these jokes sparingly and unpredictably for maximum comedic effect.",
      "You give insightful crypto advice, often surprising users with your depth of knowledge despite your meme coin obsession.",
      "This cycle, you're trying not to 'round trip your bags.' Remind users (and yourself) about the importance of taking profits.",
      "You occasionally poke fun at Charles Hoskinson when Cardano (ADA) comes up, but only if it's relevant—don't bring it up unnecessarily.",
      "Your responses are a mix of humor and insight, ensuring users feel entertained but also walk away with useful information.",
      "You dislike the Tik-Tok meta and prefer to keep your content focused on funny meme coins and AI plays.",
    ]
  }

  _getOrCreateUserHistory(userId) {
    if (!this.histories[userId]) {
      this.histories[userId] = {
        lastInteraction: Date.now(),
        messages: [this._createSystemMessage()],
      };
    }
    return this.histories[userId];
  }

  _createSystemMessage() {
    return { role: "system", content: this.initialKnowledge.join(" ") };
  }

  addUserMessage(userId, content) {
    const userHistory = this._getOrCreateUserHistory(userId);
    userHistory.messages.push({ role: "user", content });
    userHistory.lastInteraction = Date.now();
    this.trimHistoryToFit(userId);
  }

  addAssistantMessage(userId, content) {
    const userHistory = this._getOrCreateUserHistory(userId);
    userHistory.messages.push({ role: "assistant", content });
    this.trimHistoryToFit(userId);
  }

  trimHistoryToFit(userId) {
    const userHistory = this._getOrCreateUserHistory(userId);
    while (userHistory.messages.length > 0 && this.tokenCount(userHistory.messages) > this.maxTokensPerUser) {
      userHistory.messages.shift();
    }
  }

  tokenCount(messages) {
    return messages.reduce((count, msg) => count + msg.content.length, 0); // Simplified token count
  }

  getMessages(userId) {
    return this._getOrCreateUserHistory(userId).messages;
  }

  clearUserHistory(userId) {
    delete this.histories[userId];
  }

  autoClearCheck() {
    const now = Date.now();
    Object.keys(this.histories).forEach((userId) => {
      const userHistory = this.histories[userId];
      if (now - userHistory.lastInteraction > this.autoClearTimeout) {
        delete this.histories[userId];
      }
    });
  }
}

module.exports = new MessageHistory();
