const db = require('../database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const config = await db.getGuildConfig(member.guild.id);

    if (config.welcome_channel_id && config.goodbye_message) {
      const channel = member.guild.channels.cache.get(config.welcome_channel_id);
      if (channel) {
        let msg = config.goodbye_message
          .replace(/{user}/g, `**${member.user.username}**`)
          .replace(/{server}/g, `**${member.guild.name}**`);

        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('👋 Thành viên rời nhóm')
          .setDescription(msg)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
};