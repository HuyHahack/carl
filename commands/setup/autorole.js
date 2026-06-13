const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Tự động gán vai trò khi thành viên mới tham gia máy chủ')
    .addRoleOption(opt => opt.setName('role').setDescription('Vai trò mặc định').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (role.managed) return interaction.reply({ content: '❌ Không thể sử dụng vai trò tích hợp hệ thống/bot!', ephemeral: true });

    try {
      await db.pool.query(
        'UPDATE guild_configs SET autorole_id = $1 WHERE guild_id = $2',
        [role.id, interaction.guild.id]
      );
      await interaction.reply({ content: `✅ Đã thiết lập tính năng **Auto-role** thành công cho vai trò: **${role.name}**` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn không có quyền Manage Roles!');
    }

    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ Cú pháp: `?autorole @vai_trò`');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET autorole_id = $1 WHERE guild_id = $2',
        [role.id, message.guild.id]
      );
      message.reply(`✅ Đã cài đặt thành công Auto-role cho vai trò: **${role.name}**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Lỗi lưu dữ liệu!');
    }
  }
};