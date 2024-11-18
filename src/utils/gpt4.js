const dotenv = require("dotenv");
const { EmbedBuilder } = require("discord.js");
const OpenAI = require("openai");
const messageHistory = require("./messageHistory");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Periodic cleanup task
setInterval(() => {
  messageHistory.autoClearCheck();
}, 600000);

function estimateTokenCount(messages) {
  return messages.reduce((count, msg) => count + Math.ceil(msg.content.length / 4), 0);
}

async function getChatCompletion(prompt, interaction) {
  try {
    const userId = interaction.user.id;
    messageHistory.addUserMessage(userId, prompt);

    const messages = messageHistory.getMessages(userId);

    // Ensure messages don't exceed a certain token limit
    while (messages.length > 0 && estimateTokenCount(messages) > 128000) {
      messages.shift();
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
    });

    const responseData = response.choices[0].message.content;
    messageHistory.addAssistantMessage(userId, responseData);

    const gptEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
      })
      .addFields(
        { name: "Question", value: prompt },
        { name: "Answer", value: responseData }
      )
      .setTimestamp()
      .setFooter({
        text: "HellGPT-Q",
        iconURL:
          "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return responseData;
  } catch (error) {
    console.error(`Error getting GPT response: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response)}`);
    }
    await interaction.editReply({
      content: "Sorry, I couldn't process your request. Please try again later.",
      embeds: [],
    });
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

async function getDrawCompletion(prompt, interaction) {
  try {
    console.log(`Prompt for DALL-E: ${prompt}`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    const gptEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
      })
      .addFields(
        { name: "Prompt", value: prompt }
      )
      .setImage(imageUrl)
      .setTimestamp()
      .setFooter({
        text: "HellGPT-Q",
        iconURL: "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return imageUrl;
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response)}`);
    }
    await interaction.editReply({
      content: "Sorry, I couldn't process your request. Please try again later.",
      embeds: [],
    });
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

module.exports = {
  getChatCompletion,
  getDrawCompletion,
};
