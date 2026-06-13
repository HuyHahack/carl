const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Cách ly thành viên vi phạm (Timeout)')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Thời gian cách ly')
      .setRequired(true)
      .addChoices(
        { name: '60 giây', value: 60 },
        { name: '5 phút', value: 300 },
        { name: '10 phút', value: 600 },
        { name: '1 giờ', value: 3600 },
        { name: '1 ngày', value: 86400 },
        { name: '1 tuần', value: 604800 }
      ))
    .addStringOption(opt => opt.setName('reason').setDescription('Lý do').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    if (!target) return interaction.reply({ content: '❌ Không tìm thấy thành viên này!', ephemeral: true });
    if (!target.moderatable) return interaction.reply({ content: '❌ Bot không đủ quyền để timeout người này!', ephemeral: true });

    try {
      await target.timeout(duration * 1000, reason);
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('🔇 CÁCH LY THÀNH VIÊN')
        .setDescription(`Đã timeout thành công thành viên **${target.user.tag}**`)
        .addFields(
          { name: '👤 Đối tượng', value: `<@${target.id}>`, inline: true },
          { name: '⏳ Thời gian', value: `${duration} giây`, inline: true },
          { name: '📝 Lý do', value: reason }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Lỗi thực thi: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ Bạn không có quyền cách ly thành viên!');
    }

    let target = message.mentions.members.first();
    if (!target && args[0]) {
      target = await message.guild.members.fetch(args[0]).catch(() => null);
    }

    if (!target) return message.reply('❌ Vui lòng cung cấp thành viên!');
    if (!target.moderatable) return message.reply('❌ Bot không có quyền cách ly người này!');

    const durationSeconds = parseInt(args[1]);
    if (isNaN(durationSeconds) || durationSeconds <= 0) {
      return message.reply('❌ Thời gian cách ly phải là một số giây cụ thể hợp lệ (ví dụ: `?timeout @user 300 lý_do`)!');
    }

    const reason = args.slice(2).join(' ') || 'Không có lý do cụ thể';
    try {
      await target.timeout(durationSeconds * 1000, reason);
      message.reply(`✅ Đã cách ly **${target.user.tag}** trong **${durationSeconds} giây**. Lý do: \`${reason}\``);
    } catch (err) {
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};