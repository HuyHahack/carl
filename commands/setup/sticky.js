const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Thiết lập tin nhắn dính (Sticky Message) luôn nằm ở cuối kênh chat')
    .addStringOption(opt => opt.setName('content').setDescription('Nội dung cần dính (gõ "disable" để tắt)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const content = interaction.options.getString('content');

    try {
      if (content.toLowerCase() === 'disable') {
        await db.pool.query('DELETE FROM sticky_messages WHERE channel_id = $1', [interaction.channel.id]);
        return interaction.reply({ content: '🔓 Đã gỡ bỏ tin nhắn dính thành công cho kênh này!' });
      }

      await db.pool.query(
        'INSERT INTO sticky_messages (channel_id, content) VALUES ($1, $2) ON CONFLICT (channel_id) DO UPDATE SET content = $2',
        [interaction.channel.id, content]
      );
      await interaction.reply({ content: '📌 Đã bật tin nhắn dính thành công cho kênh này!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bạn không có quyền Manage Messages!');
    }

    const content = args.join(' ');
    if (!content) return message.reply('❌ Vui lòng nhập nội dung cần ghim hoặc gõ `?sticky disable` để tắt!');

    try {
      if (content.toLowerCase() === 'disable') {
        await db.pool.query('DELETE FROM sticky_messages WHERE channel_id = $1', [message.channel.id]);
        return message.reply('🔓 Đã gỡ bỏ tin nhắn dính thành công cho kênh này!');
      }

      await db.pool.query(
        'INSERT INTO sticky_messages (channel_id, content) VALUES ($1, $2) ON CONFLICT (channel_id) DO UPDATE SET content = $2',
        [message.channel.id, content]
      );
      message.reply('📌 Đã bật tin nhắn dính thành công cho kênh chat này!');
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi cấu hình!');
    }
  }
};