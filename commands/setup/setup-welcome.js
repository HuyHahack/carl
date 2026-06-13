const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Cài đặt kênh và lời nhắn chào mừng / tạm biệt thành viên mới')
    .addChannelOption(opt => opt.setName('channel').setDescription('Kênh gửi tin nhắn').setRequired(true))
    .addStringOption(opt => opt.setName('welcome').setDescription('Lời chào mừng (Dùng {user} để tag, {server} để gọi tên server)').setRequired(true))
    .addStringOption(opt => opt.setName('goodbye').setDescription('Lời tạm biệt (Dùng {user} để gọi tên, {server} để gọi tên server)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const welcome = interaction.options.getString('welcome');
    const goodbye = interaction.options.getString('goodbye');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET welcome_channel_id = $1, welcome_message = $2, goodbye_message = $3 WHERE guild_id = $4',
        [channel.id, welcome, goodbye, interaction.guild.id]
      );
      await interaction.reply({ content: '✅ Đã cấu hình tin nhắn Welcome/Goodbye thành công!' });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi lưu dữ liệu cấu hình!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Yêu cầu quyền hạn Manage Server!');
    }

    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('❌ Cú pháp: `?setup-welcome #kênh_chat` (Hệ thống sẽ cập nhật trạng thái hoạt động tự động)');

    message.reply('⚙️ Để cấu hình chi tiết lời nhắn chào mừng có định dạng động, vui lòng sử dụng lệnh Slash: `/setup-welcome` để đạt hiệu quả hiển thị tối ưu nhất.');
  }
};