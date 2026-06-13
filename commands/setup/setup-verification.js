const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');

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

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛡️ CỔNG XÁC MINH BẢO MẬT')
        .setDescription('Vui lòng bấm vào nút **Xác minh** phía dưới để mở khóa toàn bộ máy chủ!')
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId('verify_member_btn')
        .setLabel('✅ Xác minh ngay')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Đã kích hoạt và gửi cổng xác minh bảo mật thành công!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ Lỗi: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Chỉ dành cho Quản trị viên (Administrator) máy chủ!');
    }

    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ Cú pháp: `?setup-verification @vai_trò_mở_khóa` (Nút bấm sẽ gửi ngay tại kênh hiện tại)');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET verify_role_id = $1 WHERE guild_id = $2',
        [role.id, message.guild.id]
      );

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛡️ CỔNG XÁC MINH BẢO MẬT')
        .setDescription('Vui lòng bấm vào nút **Xác minh** phía dưới để mở khóa máy chủ!');

      const button = new ButtonBuilder()
        .setCustomId('verify_member_btn')
        .setLabel('✅ Xác minh ngay')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await message.channel.send({ embeds: [embed], components: [row] });
      message.reply('✅ Đã kích hoạt cổng xác minh thành công!');
    } catch (err) {
      console.error(err);
      message.reply('❌ Lỗi kết nối!');
    }
  }
};