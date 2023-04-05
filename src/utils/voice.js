const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  joinVoiceChannel,
} = require("@discordjs/voice");
const { Readable, Transform, pipeline } = require("stream");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const client = new TextToSpeechClient();

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
      const request = {
        input: { text },
        voice: {
          languageCode: "en-US",
          // ssmlGender: "NEUTRAL",
          name: "en-US-Neural2-A",
        },
        audioConfig: { audioEncoding: "OGG_OPUS" },
      };

      const [response] = await client.synthesizeSpeech(request);

      const audioStream = new Readable({
        read() {
          this.push(response.audioContent);
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
