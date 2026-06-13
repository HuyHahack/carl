const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Gỡ cấm thành viên bằng ID')
    .addStringOption(opt => opt.setName('userid').setDescription('ID người dùng').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Lý do gỡ cấm').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    try {
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({ content: `✅ Đã gỡ cấm thành công cho người dùng có ID: \`${userId}\`` });
    } catch (err) {
      await interaction.reply({ content: `❌ Thất bại khi gỡ cấm (Có thể ID không bị cấm hoặc sai ID): ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ Bạn không có quyền gỡ cấm!');
    }

    const userId = args[0];
    if (!userId) return message.reply('❌ Vui lòng nhập ID người dùng cần gỡ cấm!');

    const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể';
    try {
      await message.guild.members.unban(userId, reason);
      message.reply(`✅ Đã gỡ cấm thành công cho ID \`${userId}\``);
    } catch (err) {
      message.reply(`❌ Không thể gỡ cấm: ${err.message}`);
    }
  }
};