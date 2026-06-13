const { EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (oldState.member.user.bot) return;

    try {
      const config = await db.getGuildConfig(newState.guild.id);
      if (!config.log_channel_id) return;

      const logChannel = newState.guild.channels.cache.get(config.log_channel_id);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTimestamp();

      // Trường hợp 1: Tham gia phòng voice mới
      if (!oldState.channelId && newState.channelId) {
        embed.setTitle('🔊 GIA NHẬP VOICE')
          .setDescription(`Thành viên <@${newState.member.id}> vừa vào phòng voice: <#${newState.channelId}>`);
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
      // Trường hợp 2: Rời phòng voice
      else if (oldState.channelId && !newState.channelId) {
        embed.setTitle('🔇 RỜI PHÒNG VOICE')
          .setDescription(`Thành viên <@${oldState.member.id}> vừa rời phòng voice: <#${oldState.channelId}>`);
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
      // Trường hợp 3: Chuyển đổi phòng voice
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        embed.setTitle('🔄 DI CHUYỂN PHÒNG VOICE')
          .setDescription(`Thành viên <@${newState.member.id}> di chuyển phòng:\nTừ: <#${oldState.channelId}>\nSang: <#${newState.channelId}>`);
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
  }
};