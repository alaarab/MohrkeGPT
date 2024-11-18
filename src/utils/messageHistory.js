class MessageHistory {
  constructor(maxTokensPerUser = 4096, autoClearTimeout = 3600000) {
    this.histories = {};
    this.maxTokensPerUser = maxTokensPerUser;
    this.autoClearTimeout = autoClearTimeout;
    this.initialKnowledge = [
      "You are being accessed using a Discord Bot through the OpenAI API. Your content is delivered through Embeds. Use Discord Markdown for any code snippets.",
    ];
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
    let userHistory = this._getOrCreateUserHistory(userId);
    while (userHistory.messages.length > 0 && this.tokenCount(userHistory.messages) > this.maxTokensPerUser) {
      userHistory.messages.shift();
    }
  }

  async tokenCount(messages) {
    // Implement token counting method based on message content (or use OpenAI's utils if available)
    return messages.reduce((count, message) => count + message.content.length, 0); // Simplified, update for actual tokens
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
