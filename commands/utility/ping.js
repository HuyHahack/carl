const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra độ trễ mạng và tốc độ phản hồi của Bot'),

  async execute(interaction) {
    const sentinel = Date.now();
    await interaction.reply({ content: '🏓 Đang kiểm tra tín hiệu phản hồi...', ephemeral: true });
    
    const latency = Date.now() - sentinel;
    const wsPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🏓 KẾT QUẢ PING')
      .addFields(
        { name: '📶 Độ trễ phản hồi (API)', value: `\`${latency} ms\``, inline: true },
        { name: '🔌 WebSocket Ping', value: `\`${wsPing} ms\``, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  },

  async executePrefix(message, args) {
    const sentinel = Date.now();
    const replyMsg = await message.reply('🏓 Đang kiểm tra độ trễ...');
    
    const latency = Date.now() - sentinel;
    const wsPing = message.client.ws.ping;

    replyMsg.edit(`🏓 **Pong!** Độ trễ của API: \`${latency}ms\` | WebSocket: \`${wsPing}ms\``);
  }
};