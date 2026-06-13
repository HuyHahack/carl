const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database'); // Đã sửa đường dẫn lùi 2 cấp chính xác

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verification')
    .setDescription('Cài đặt cổng xác minh bảo mật chống phá máy chủ')
    .addRoleOption(opt => opt.setName('role').setDescription('Vai trò được mở khóa sau khi xác minh').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Kênh gửi nút bấm xác minh').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET verify_role_id = $1 WHERE guild_id = $2',
        [role.id, interaction.guild.id]
      );

      // CÀI ĐẶT PHÂN QUYỀN KÊNH CHỐNG BYPASS:
      // Cho phép @everyone vào kênh này xem nhưng không được chat (chỉ bấm nút)
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
      });

      // Cho phép vai trò đã verify ẩn/không cần xem kênh này nữa sau khi xác minh xong
      await channel.permissionOverwrites.edit(role, {
        ViewChannel: false
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛡️ CỔNG XÁC MINH BẢO MẬT')
        .setDescription('Vui lòng bấm vào nút **Xác minh** phía dưới để mở khóa toàn bộ máy chủ!')
        .addFields({
          name: '⚠️ Lưu ý khuyên dùng để chống lỗi Bypass:',
          value: 'Để tránh thành viên chưa xác minh vẫn tự do xem các kênh chat khác:\n' +
                 `1. Vào **Cài đặt Server** -> **Vai trò** -> Chọn **@everyone** -> Tắt quyền **Xem kênh** (View Channels).\n` +
                 `2. Vào cài đặt vai trò **${role.name}** -> Bật quyền **Xem kênh** (View Channels).\n` +
                 `Lúc này, người chưa xác minh chỉ có thể nhìn thấy kênh <#${channel.id}> này!`
        })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId('verify_member_btn')
        .setLabel('✅ Xác minh ngay')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Đã thiết lập cổng xác minh và phân quyền kênh thành công!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ Lỗi phân quyền kênh: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Chỉ dành cho Quản trị viên (Administrator) máy chủ!');
    }

    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ Cú pháp: `?setup-verification @vai_trò` (Nút bấm sẽ gửi tại kênh hiện tại)');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET verify_role_id = $1 WHERE guild_id = $2',
        [role.id, message.guild.id]
      );

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
      });

      await message.channel.permissionOverwrites.edit(role, {
        ViewChannel: false
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛡️ CỔNG XÁC MINH BẢO MẬT')
        .setDescription('Vui lòng bấm vào nút dưới đây để mở khóa server!\n\n*Lưu ý: Nhớ cài đặt quyền @everyone trong Server thành không thể xem kênh, và cho phép vai trò đã xác minh được xem kênh để chống bypass.*');

      const button = new ButtonBuilder()
        .setCustomId('verify_member_btn')
        .setLabel('✅ Xác minh ngay')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await message.channel.send({ embeds: [embed], components: [row] });
      message.reply('✅ Đã thiết lập cổng xác minh thành công!');
    } catch (err) {
      console.error(err);
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};