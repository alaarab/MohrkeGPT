# HellGPT-Q Bot

A Discord bot powered by OpenAI GPT-4-turbo and Dall-e-3 to answer questions, generate images, and read responses aloud in voice channels.

## Prerequisites

- Node.js v16.6.0 or higher
- npm
- An OpenAI API key
- A Discord bot token

## Installation

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Create a `.env` file in the root directory and add the following variables:
    - `OPENAI_API_KEY`: Your OpenAI API key
    - `DISCORD_BOT_KEY`: Your Discord bot token
    - `DISCORD_BOT_CLIENT_ID`: Your Discord bot client ID
4. Run `npm run register` to register the bot's commands with Discord.
5. Run `npm run start` to start the bot.

## Usage

The bot supports the following commands:

### /say

Tell HellGPT-Q to say something

Usage: `/say text`

Arguments:
- `text` (required): The text that HellGPT-Q should say.

### /chat

Chat with HellGPT-Q using the GPT Turbo 3.5 API 

Usage: `/chat prompt [--tts]`

Arguments:
- `prompt` (required): The prompt for the chat.
- `--tts` (optional): Read the response aloud in a voice channel.

### /stop

Stop the audio

Usage: `/stop`

### /draw

Draw an image using the Dall-e-3 API

Usage: `/draw prompt``

### /clear

Clear the conversation history

Usage: `/clear`

## Credits

- HellGPT-Q was created by Ala Arab
- HellGPT-Q uses the following libraries:
  - [discord.js](https://discord.js.org)
  - [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice)
  - [openai](https://www.npmjs.com/package/openai)

## License

HellGPT-Q is licensed under the [MIT License](LICENSE).
