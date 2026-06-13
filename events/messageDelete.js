const { EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (message.author?.bot || !message.guild) return;

    try {
      const config = await db.getGuildConfig(message.guild.id);
      if (!config.log_channel_id) return;

      const logChannel = message.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🗑️ TIN NHẮN BỊ XÓA')
        .setDescription(`**Thành viên:** <@${message.author.id}> (\`${message.author.id}\`)\n**Kênh:** <#${message.channel.id}>`)
        .addFields(
          { name: 'Nội dung đã xóa', value: message.content ? message.content.slice(0, 1024) : '*Không thể đọc nội dung hoặc tin nhắn không chứa văn bản*' }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  }
};