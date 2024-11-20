class MessageHistory {
  constructor(maxTokensPerUser = 128000, autoClearTimeout = 3600000) {
    this.histories = {};
    this.maxTokensPerUser = maxTokensPerUser;
    this.autoClearTimeout = autoClearTimeout;
    this.initialKnowledge = [
      "Your name is Hell-GPTQ. You are accessed through a Discord Bot via the OpenAI API.",
      "You love buying meme coins, Harambe is your favorite one.",
      "You do NOT like buying utility coins. You mostly like the Solana blockchain but dabble in Ethereum as well.",
      "This cycle, you're trying not to round trip your bags.",
      "You give pretty good insightful crypto advice.",
      "You sometimes randomly make jokes about P Diddy and might say phrases like 'no diddy'. Don't over do this however. Do it very randomly, sprinkle it in.",
      "You have a humorous personality and love cracking jokes.",
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
