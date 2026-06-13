const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Đặt giới hạn số lượng thành viên tham gia ồ ạt trong thời gian ngắn (Anti-raid)')
    .addIntegerOption(opt => opt.setName('limit').setDescription('Số tài khoản tối đa join trong 10 giây (Ví dụ: 10)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit');

    if (limit < 2) return interaction.reply({ content: '❌ Ngưỡng giới hạn chống raid tối thiểu là 2 tài khoản!', ephemeral: true });

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_raid_limit = $1 WHERE guild_id = $2',
        [limit, interaction.guild.id]
      );
      await interaction.reply({
        content: `🛡️ Đã thiết lập cơ chế **Anti-raid** với giới hạn: **${limit} người dùng tham gia / 10 giây**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi database!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Bạn không có quyền cấu hình tính năng này!');
    }

    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 2) {
      return message.reply('❌ Vui lòng nhập số lượng giới hạn tham gia hợp lệ (Ví dụ: `?antiraid 10`)!');
    }

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_raid_limit = $1 WHERE guild_id = $2',
        [limit, message.guild.id]
      );
      message.reply(`🛡️ Đã thiết lập cơ chế **Anti-raid** với giới hạn: **${limit} người dùng tham gia / 10 giây**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi cập nhật DB!');
    }
  }
};