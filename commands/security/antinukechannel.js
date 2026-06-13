const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinukechannel')
    .setDescription('Đặt giới hạn số lượng tạo/xóa kênh tối đa được phép thao tác trong 1 phút')
    .addIntegerOption(opt => opt.setName('limit').setDescription('Số lượng giới hạn (Ví dụ: 3)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit');

    if (limit < 1) return interaction.reply({ content: '❌ Ngưỡng giới hạn tối thiểu phải là 1!', ephemeral: true });

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_nuke_limit = $1 WHERE guild_id = $2',
        [limit, interaction.guild.id]
      );
      await interaction.reply({
        content: `🛡️ Đã cài đặt giới hạn bảo vệ tạo/xóa kênh (**Anti-nuke Channel**) thành: **${limit} lần/phút**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi database!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Chỉ có Quản trị viên (Administrator) mới có thể cấu hình Anti-nuke!');
    }

    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 1) {
      return message.reply('❌ Vui lòng cung cấp giới hạn số lần hợp lệ (Ví dụ: `?antinukechannel 3`)!');
    }

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_nuke_limit = $1 WHERE guild_id = $2',
        [limit, message.guild.id]
      );
      message.reply(`🛡️ Đã cài đặt giới hạn bảo vệ tạo/xóa kênh (**Anti-nuke Channel**) thành: **${limit} lần/phút**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi cập nhật DB!');
    }
  }
};