const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarn')
    .setDescription('Xóa toàn bộ cảnh cáo của thành viên')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần gỡ gậy').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    try {
      const deleteRes = await db.pool.query(
        'DELETE FROM warnings WHERE guild_id = $1 AND user_id = $2 RETURNING *',
        [interaction.guild.id, user.id]
      );

      if (deleteRes.rowCount === 0) {
        return interaction.reply({ content: `❌ Thành viên **${user.username}** vốn không có cảnh cáo nào!`, ephemeral: true });
      }

      await interaction.reply({ content: `✅ Đã gỡ bỏ toàn bộ cảnh cáo thành công cho thành viên **${user.username}**!` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi xóa cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ Bạn cần quyền Moderate Members để gỡ cảnh cáo!');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Vui lòng tag thành viên cần gỡ gậy cảnh cáo!');

    try {
      const deleteRes = await db.pool.query(
        'DELETE FROM warnings WHERE guild_id = $1 AND user_id = $2 RETURNING *',
        [message.guild.id, user.id]
      );

      if (deleteRes.rowCount === 0) {
        return message.reply(`❌ Người dùng **${user.username}** không có bất kỳ cảnh cáo nào để xóa!`);
      }

      message.reply(`✅ Đã gỡ bỏ toàn bộ cảnh cáo thành công cho thành viên **${user.username}**!`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Gặp lỗi kết nối DB!');
    }
  }
};