const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database'); // Lùi 2 cấp chính xác

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verification')
    .setDescription('Cài đặt cổng xác minh bảo mật chống phá máy chủ')
    .addRoleOption(opt => opt.setName('rolecap').setDescription('Vai trò được cấp sau khi xác minh (Member)').setRequired(true))
    .addRoleOption(opt => opt.setName('rolexoa').setDescription('Vai trò bị xóa sau khi xác minh (Unverified)').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Kênh gửi nút bấm xác minh').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const roleAdd = interaction.options.getRole('rolecap');
    const roleRemove = interaction.options.getRole('rolexoa');
    const channel = interaction.options.getChannel('channel');

    try {
      // Cập nhật cả 2 vai trò vào Database (autorole_id sẽ là vai trò tự xóa và tự gán khi mới join)
      await db.pool.query(
        'UPDATE guild_configs SET verify_role_id = $1, autorole_id = $2 WHERE guild_id = $3',
        [roleAdd.id, roleRemove.id, interaction.guild.id]
      );

      // Phân quyền kênh gửi nút: @everyone vào kênh này xem nhưng không được chat (chỉ bấm nút)
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
      });

      // Ẩn kênh xác minh đối với những thành viên đã xác minh thành công
      await channel.permissionOverwrites.edit(roleAdd, {
        ViewChannel: false
      });

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

    // Bộ phân tích hỗ trợ nhận diện cả Tag/Mention và nhập ID trực tiếp
    const getRole = (arg) => {
      if (!arg) return null;
      const roleId = arg.replace(/[<@&>]/g, '');
      return message.guild.roles.cache.get(roleId);
    };

    const getChannel = (arg) => {
      if (!arg) return null;
      const channelId = arg.replace(/[<#>]/g, '');
      return message.guild.channels.cache.get(channelId);
    };

    const roleAdd = getRole(args[0]);
    const roleRemove = getRole(args[1]);
    const channel = getChannel(args[2]);

    if (!roleAdd || !roleRemove || !channel) {
      return message.reply('❌ Cú pháp thiếu tham số! Vui lòng nhập: `?setup-verification <@rolecap> <@rolexoa> <#channel>` (Hỗ trợ nhập ID trực tiếp)');
    }

    try {
      // Lưu thông tin vào database
      await db.pool.query(
        'UPDATE guild_configs SET verify_role_id = $1, autorole_id = $2 WHERE guild_id = $3',
        [roleAdd.id, roleRemove.id, message.guild.id]
      );

      // Phân quyền kênh gửi nút
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
      });

      await channel.permissionOverwrites.edit(roleAdd, {
        ViewChannel: false
      });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛡️ CỔNG XÁC MINH BẢO MẬT')
        .setDescription('Vui lòng bấm vào nút dưới đây để mở khóa server!');

      const button = new ButtonBuilder()
        .setCustomId('verify_member_btn')
        .setLabel('✅ Xác minh ngay')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [row] });
      message.reply(`✅ Đã thiết lập cổng xác minh thành công!\n👉 **Vai trò cấp (Member):** <@&${roleAdd.id}>\n👉 **Vai trò xóa (Unverified):** <@&${roleRemove.id}>\n👉 **Kênh gửi nút:** <#${channel.id}>`);
    } catch (err) {
      console.error(err);
      message.reply(`❌ Gặp lỗi trong quá trình phân quyền hoặc cập nhật DB: ${err.message}`);
    }
  }
};