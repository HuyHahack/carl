const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Mở khóa quyền gửi tin nhắn của kênh chat hiện tại'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ Bạn không có quyền Manage Channels!', ephemeral: true });
    }
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true
      });
      await interaction.reply({ content: '✅ Đã mở khóa kênh chat này thành công! 🔓' });
    } catch (err) {
      await interaction.reply({ content: `❌ Thất bại: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Bạn cần quyền quản lý kênh!');
    }
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true
      });
      message.reply('✅ Kênh chat đã được mở khóa thành công! 🔓');
    } catch (err) {
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};