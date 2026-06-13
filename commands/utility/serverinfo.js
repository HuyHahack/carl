const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Xem thông tin tổng quan của máy chủ Discord'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏛️ Máy chủ: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
        { name: '👑 Chủ sở hữu', value: `<@${guild.ownerId}> (Tag: \`${owner.user.tag}\`)`, inline: true },
        { name: '📅 Ngày thành lập', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Tổng thành viên', value: `**${guild.memberCount}** người dùng`, inline: true },
        { name: '📺 Kênh chat & voice', value: `**${guild.channels.cache.size}** kênh`, inline: true },
        { name: '⚡ Cấp độ Boost', value: `Level **${guild.premiumTier}** (${guild.premiumSubscriptionCount} Boosts)`, inline: true }
      )
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    const guild = message.guild;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏛️ Máy chủ: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
        { name: '👑 Chủ sở hữu', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Ngày thành lập', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Tổng thành viên', value: `**${guild.memberCount}** người dùng`, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};