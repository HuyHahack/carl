const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Cấm thành viên vĩnh viễn khỏi máy chủ')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần cấm').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Lý do cấm').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    if (!target) return interaction.reply({ content: '❌ Không tìm thấy thành viên này trong server!', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Bot không đủ quyền hạn (vị trí vai trò thấp hơn) để cấm người này!', ephemeral: true });

    try {
      await target.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🔨 THÀNH VIÊN BỊ CẤM')
        .setDescription(`Đã cấm thành công thành viên **${target.user.tag}**`)
        .addFields(
          { name: '👤 Đối tượng', value: `<@${target.id}> (\`${target.id}\`)`, inline: true },
          { name: '🛡️ Điều hành viên', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📝 Lý do', value: reason }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Lỗi thực thi: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ Bạn không có quyền cấm thành viên!');
    }

    let target = message.mentions.members.first();
    if (!target && args[0]) {
      target = await message.guild.members.fetch(args[0]).catch(() => null);
    }

    if (!target) return message.reply('❌ Vui lòng tag hoặc cung cấp ID thành viên hợp lệ!');
    if (!target.bannable) return message.reply('❌ Bot không có quyền cấm người này!');

    const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể';
    try {
      await target.ban({ reason });
      message.reply(`✅ Đã cấm thành công thành viên **${target.user.tag}** với lý do: \`${reason}\``);
    } catch (err) {
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};