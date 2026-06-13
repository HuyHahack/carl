const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinukeban')
    .setDescription('Đặt giới hạn số lượng cấm/trục xuất thành viên tối đa một Admin được làm trong 1 phút')
    .addIntegerOption(opt => opt.setName('limit').setDescription('Số lượng giới hạn (Ví dụ: 5)').setRequired(true))
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
        content: `🛡️ Đã cài đặt giới hạn xử phạt (**Anti-nuke Ban/Kick**) thành: **${limit} thành viên/phút**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cập nhật cấu hình bảo mật!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Yêu cầu quyền Administrator của máy chủ!');
    }

    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 1) {
      return message.reply('❌ Vui lòng nhập số giới hạn thành viên hợp lệ (Ví dụ: `?antinukeban 5`)!');
    }

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_nuke_limit = $1 WHERE guild_id = $2',
        [limit, message.guild.id]
      );
      message.reply(`🛡️ Đã cài đặt giới hạn xử phạt (**Anti-nuke Ban/Kick**) thành: **${limit} thành viên/phút**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi cập nhật DB!');
    }
  }
};