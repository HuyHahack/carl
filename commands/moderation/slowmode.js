const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Thiết lập chế độ chậm cho kênh chat hiện tại')
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Thời gian chờ giữa mỗi tin nhắn (0 để tắt)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        await interaction.reply({ content: '🔓 Đã tắt chế độ Slowmode cho kênh này.' });
      } else {
        await interaction.reply({ content: `⏳ Đã cài đặt Slowmode của kênh chat này thành **${seconds} giây**.` });
      }
    } catch (err) {
      await interaction.reply({ content: `❌ Lỗi: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Bạn không có quyền quản lý kênh!');
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0) {
      return message.reply('❌ Vui lòng chỉ định số giây Slowmode hợp lệ!');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        message.reply('🔓 Đã tắt chế độ Slowmode cho kênh này.');
      } else {
        message.reply(`⏳ Đã cài đặt Slowmode của kênh chat này thành **${seconds} giây**.`);
      }
    } catch (err) {
      message.reply(`❌ Không thể cấu hình: ${err.message}`);
    }
  }
};