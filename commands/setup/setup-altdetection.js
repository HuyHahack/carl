const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-altdetection')
    .setDescription('Thiết lập số ngày tuổi tối thiểu của tài khoản được phép join server')
    .addIntegerOption(opt => opt.setName('days').setDescription('Số ngày tuổi tối thiểu (Mặc định: 3 ngày)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const days = interaction.options.getInteger('days');

    if (days < 0) return interaction.reply({ content: '❌ Số ngày tuổi tối thiểu không thể nhỏ hơn 0!', ephemeral: true });

    try {
      await db.pool.query(
        'UPDATE guild_configs SET alt_age_limit = $1 WHERE guild_id = $2',
        [days, interaction.guild.id]
      );
      await interaction.reply({ content: `✅ Đã cấu hình chống tài khoản ảo thành công. Chỉ cho phép các tài khoản tạo trên **${days} ngày** tham gia máy chủ.` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi database!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Bạn không đủ thẩm quyền cấu hình bảo mật!');
    }

    const days = parseInt(args[0]);
    if (isNaN(days) || days < 0) {
      return message.reply('❌ Vui lòng nhập số ngày tuổi tối thiểu hợp lệ! (Ví dụ: `?setup-altdetection 3`)');
    }

    try {
      await db.pool.query(
        'UPDATE guild_configs SET alt_age_limit = $1 WHERE guild_id = $2',
        [days, message.guild.id]
      );
      message.reply(`✅ Đã cấu hình chống tài khoản ảo thành công. Chỉ cho phép các tài khoản tạo trên **${days} ngày** tham gia máy chủ.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi ghi dữ liệu!');
    }
  }
};