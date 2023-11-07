const dotenv = require("dotenv");
const { EmbedBuilder, User } = require("discord.js");
const { OpenAI } = require('openai');
const messageHistory = require('./messageHistory');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Periodic cleanup task
setInterval(() => {
  messageHistory.autoClearCheck();
}, 600000);

async function getChatCompletion(prompt, interaction) {
  try {
    const userId = interaction.user.id
    messageHistory.addUserMessage(interaction.user.id, prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: messageHistory.getMessages(userId),
    });

    const responseData = response.choices[0].message.content;
    messageHistory.addAssistantMessage(userId, responseData);

    // inside a command, event listener, etc.
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
        text: "MohrkeGPT",
        iconURL:
          "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return responseData;
  } catch (e) {
    console.error(`Error getting GPT response: ${e}`);
    await interaction.editReply({
      content:
        "Sorry, I couldn't process your request. Please try again later.",
      embeds: [],
    });
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

async function getDrawCompletion(prompt, interaction) {
  // Generate an Image with Dalle-3
  // Respond with an interaction who's content is the image
  try {
    console.log(`Prompt1 is ${prompt}`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1792",
      quality: "standard"
    });

    let image_url = response.data[0].url;
    let revised_prompt = response.data[0].revised_prompt;

    const gptEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
      })
      .addFields(
        { name: "Prompt", value: prompt },
        { name: "Revised Prompt", value: revised_prompt }
      )
      .setImage(image_url)
      .setTimestamp()
      .setFooter({
        text: "MohrkeGPT",
        iconURL: "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return image_url;

  } catch (e) {
    console.error(`Error getting DALL-E response: ${e}`);
    if (e.response) {
      console.error(`Response body: ${JSON.stringify(e.response.body)}`);
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
  getDrawCompletion
};
