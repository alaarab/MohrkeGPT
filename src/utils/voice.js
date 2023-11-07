const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  joinVoiceChannel,
} = require("@discordjs/voice");
const { Readable, Transform, pipeline } = require("stream");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let audioPlayer;
let connection;

class AppendSilence extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    callback(null, chunk);
  }

  _flush(callback) {
    const silenceBuffer = Buffer.alloc(2000);
    this.push(silenceBuffer);
    callback();
  }
}

async function stopAudio(interaction) {
  if (audioPlayer) {
    audioPlayer.stop();
  }

  if (connection) {
    connection.destroy();
  }

  await interaction.editReply({
    content: "Audio stopped.",
    embeds: [],
  });
}

async function readAloud(text, interaction) {
  const userId = interaction.user.id;

  if (interaction.member.voice.channel) {
    const voiceChannel = interaction.member.voice.channel;

    try {
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
      const audioStream = new Readable({
        read() {
          this.push(audioBuffer);
          this.push(null);
        },
      });

      const silence = new AppendSilence();
      const output = new Readable().wrap(
        pipeline(audioStream, silence, (err) => {
          if (err) {
            console.error("Pipeline error:", err);
          }
        })
      );

      const resource = createAudioResource(output);
      const newPlayer = createAudioPlayer();
      audioPlayer = newPlayer;

      const newConnection = await joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      connection = newConnection;

      newConnection.subscribe(newPlayer);
      newPlayer.play(resource);

      newPlayer.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        newPlayer.stop();
      });
    } catch (e) {
      await interaction.editReply({
        content:
          "Sorry, I couldn't read the response aloud. Please try again later.",
        embeds: [],
      });
      console.error(`Error reading aloud: ${e}`);
    }
  } else {
    await interaction.editReply({
      content:
        "You must be in a voice channel for the bot to read the response aloud.",
      embeds: [],
    });
  }
}

module.exports = {
  readAloud,
  stopAudio,
};
