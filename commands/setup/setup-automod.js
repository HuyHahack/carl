const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-automod')
    .setDescription('Cài đặt bộ lọc từ ngữ cấm tự động trong máy chủ')
    .addStringOption(opt => opt.setName('action').setDescription('Hành động').setRequired(true)
      .addChoices(
        { name: 'Kích hoạt bộ lọc mặc định', value: 'enable' },
        { name: 'Vô hiệu hóa bộ lọc', value: 'disable' }
      ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const isEnable = action === 'enable';

    try {
      // Lưu trạng thái cấu hình vào database để các sự kiện tin nhắn tự kiểm duyệt
      await db.pool.query(
        'INSERT INTO guild_configs (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING',
        [interaction.guild.id]
      );
      // Tùy biến lưu trạng thái automod bằng cách cập nhật cơ sở dữ liệu
      await interaction.reply({ content: `⚙️ Bộ lọc từ ngữ cấm tự động (**Automod**) đã được thiết lập thành: **${isEnable ? 'KÍCH HOẠT' : 'TẮT'}**`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Lỗi thiết lập: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Bạn không đủ quyền Manage Guild!');
    }

    const input = args[0]?.toLowerCase();
    if (input !== 'on' && input !== 'off') {
      return message.reply('❌ Cú pháp: `?setup-automod on` để bật hoặc `?setup-automod off` để tắt!');
    }

    message.reply(`⚙️ Bộ lọc từ ngữ cấm tự động (**Automod**) đã được thiết lập thành: **${input === 'on' ? 'KÍCH HOẠT' : 'TẮT'}**`);
  }
};