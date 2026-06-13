const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Trục xuất thành viên khỏi máy chủ')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần trục xuất').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Lý do trục xuất').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    if (!target) return interaction.reply({ content: '❌ Không tìm thấy thành viên này!', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ Bot không đủ quyền để trục xuất người này!', ephemeral: true });

    try {
      await target.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('👢 THÀNH VIÊN BỊ TRỤC XUẤT')
        .setDescription(`Đã trục xuất thành viên **${target.user.tag}**`)
        .addFields(
          { name: '👤 Đối tượng', value: `<@${target.id}>`, inline: true },
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
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('❌ Bạn không có quyền trục xuất thành viên!');
    }

    let target = message.mentions.members.first();
    if (!target && args[0]) {
      target = await message.guild.members.fetch(args[0]).catch(() => null);
    }

    if (!target) return message.reply('❌ Vui lòng cung cấp thành viên hợp lệ!');
    if (!target.kickable) return message.reply('❌ Bot không có quyền trục xuất người này!');

    const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể';
    try {
      await target.kick(reason);
      message.reply(`✅ Đã trục xuất thành viên **${target.user.tag}** với lý do: \`${reason}\``);
    } catch (err) {
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};