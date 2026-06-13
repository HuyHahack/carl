const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Xem lịch sử cảnh cáo của thành viên')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần kiểm tra').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    try {
      const res = await db.pool.query(
        'SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
        [interaction.guild.id, user.id]
      );

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle(`📋 Danh sách cảnh cáo của: ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      if (res.rows.length === 0) {
        embed.setDescription('✅ Thành viên này hiện tại chưa bị cảnh cáo lần nào.');
      } else {
        let desc = '';
        res.rows.forEach((row, i) => {
          desc += `**#${res.rows.length - i}** | Cảnh cáo bởi: <@${row.moderator_id}> | Ngày: <t:${Math.floor(row.created_at.getTime() / 1000)}:d>\\n📝 **Lý do:** \`${row.reason}\`\\n\\n`;
        });
        embed.setDescription(desc);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi truy vấn cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    const user = message.mentions.users.first() || message.author;

    try {
      const res = await db.pool.query(
        'SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
        [message.guild.id, user.id]
      );

      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle(`📋 Danh sách cảnh cáo của: ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      if (res.rows.length === 0) {
        embed.setDescription('✅ Thành viên này chưa có gậy cảnh cáo nào.');
      } else {
        let desc = '';
        res.rows.forEach((row, i) => {
          desc += `**#${res.rows.length - i}** | Bởi: <@${row.moderator_id}> | Ngày: <t:${Math.floor(row.created_at.getTime() / 1000)}:d>\\n📝 **Lý do:** \`${row.reason}\`\\n\\n`;
        });
        embed.setDescription(desc);
      }

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Lỗi tải dữ liệu!');
    }
  }
};