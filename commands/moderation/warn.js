const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Cảnh cáo thành viên vi phạm quy chuẩn')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần cảnh cáo').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Lý do cảnh cáo').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    if (user.bot) return interaction.reply({ content: '❌ Không thể cảnh cáo tài khoản robot!', ephemeral: true });

    try {
      await db.pool.query(
        'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES ($1, $2, $3, $4)',
        [interaction.guild.id, user.id, interaction.user.id, reason]
      );

      const countRes = await db.pool.query(
        'SELECT COUNT(*) FROM warnings WHERE guild_id = $1 AND user_id = $2',
        [interaction.guild.id, user.id]
      );

      await interaction.reply({
        content: `⚠️ **${user.username}** đã nhận 1 cảnh cáo bởi **${interaction.user.username}**.\\n📝 **Lý do:** ${reason}\\n📊 **Tổng số gậy hiện tại:** \`${countRes.rows[0].count}\``
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Gặp sự cố kết nối cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ Bạn không có quyền cảnh cáo thành viên!');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Vui lòng tag người dùng cần cảnh cáo! (Ví dụ: `?warn @user lý_do`)');
    if (user.bot) return message.reply('❌ Không thể cảnh cáo tài khoản robot!');

    const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể';

    try {
      await db.pool.query(
        'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES ($1, $2, $3, $4)',
        [message.guild.id, user.id, message.author.id, reason]
      );

      const countRes = await db.pool.query(
        'SELECT COUNT(*) FROM warnings WHERE guild_id = $1 AND user_id = $2',
        [message.guild.id, user.id]
      );

      message.reply(`⚠️ **${user.username}** đã nhận 1 cảnh cáo bởi **${message.author.username}**.\\n📝 **Lý do:** ${reason}\\n📊 **Tổng số gậy hiện tại:** \`${countRes.rows[0].count}\``);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi ghi nhận vào DB!');
    }
  }
};