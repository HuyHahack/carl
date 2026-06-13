const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antimention')
    .setDescription('Đặt giới hạn số lần tag (mention) tối đa cho phép trong 1 tin nhắn')
    .addIntegerOption(opt => opt.setName('limit').setDescription('Số lần tag tối đa (Ví dụ: 5)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit');

    if (limit < 1) return interaction.reply({ content: '❌ Ngưỡng giới hạn tag tối thiểu phải là 1!', ephemeral: true });

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_mention_limit = $1 WHERE guild_id = $2',
        [limit, interaction.guild.id]
      );
      await interaction.reply({
        content: `🛡️ Đã thiết lập giới hạn tag tối đa thành: **${limit} người/tin nhắn**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cập nhật cấu hình bảo mật vào database!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Bạn không có quyền cấu hình tính năng này!');
    }

    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 1) {
      return message.reply('❌ Vui lòng nhập số lượng giới hạn tag hợp lệ (Ví dụ: `?antimention 5`)!');
    }

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_mention_limit = $1 WHERE guild_id = $2',
        [limit, message.guild.id]
      );
      message.reply(`🛡️ Đã thiết lập giới hạn tag tối đa thành: **${limit} người/tin nhắn**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi ghi dữ liệu!');
    }
  }
};