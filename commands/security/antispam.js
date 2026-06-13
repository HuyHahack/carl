const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Bật hoặc Tắt tính năng tự động chặn tin nhắn rác (Anti-spam)')
    .addBooleanOption(opt => opt.setName('state').setDescription('True = Bật, False = Tắt').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const state = interaction.options.getBoolean('state');

    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_spam_toggle = $1 WHERE guild_id = $2',
        [state, interaction.guild.id]
      );
      await interaction.reply({
        content: `🔒 Tính năng **Anti-spam** đã được thiết lập thành: **${state ? 'KÍCH HOẠT ✅' : 'VÔ HIỆU HÓA ❌'}**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cập nhật cấu hình bảo mật vào database!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Bạn cần có quyền Manage Guild để cấu hình bảo mật!');
    }

    const input = args[0]?.toLowerCase();
    if (input !== 'true' && input !== 'false') {
      return message.reply('❌ Định dạng cấu hình phải là: `?antispam true` (Bật) hoặc `?antispam false` (Tắt)!');
    }

    const state = input === 'true';
    try {
      await db.pool.query(
        'UPDATE guild_configs SET anti_spam_toggle = $1 WHERE guild_id = $2',
        [state, message.guild.id]
      );
      message.reply(`🔒 Tính năng **Anti-spam** đã được thiết lập thành: **${state ? 'KÍCH HOẠT ✅' : 'VÔ HIỆU HÓA ❌'}**`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Thất bại khi ghi nhận cấu hình bảo mật!');
    }
  }
};