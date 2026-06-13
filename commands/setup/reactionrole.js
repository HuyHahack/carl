const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Tạo tin nhắn tự nhận vai trò (Role) bằng cách nhấn biểu tượng cảm xúc (Reaction)')
    .addRoleOption(opt => opt.setName('role').setDescription('Vai trò muốn gán').setRequired(true))
    .addStringOption(opt => opt.setName('emoji').setDescription('Biểu tượng cảm xúc (Emoji)').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Nội dung hướng dẫn').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const emoji = interaction.options.getString('emoji');
    const desc = interaction.options.getString('description');

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎭 NHẬN VAI TRÒ TỰ ĐỘNG')
      .setDescription(`${desc}\\n\\nNhấn vào biểu tượng ${emoji} bên dưới để nhận vai trò **${role.name}**!`)
      .setTimestamp();

    try {
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react(emoji);
      // Lưu ý: Cần kết hợp lắng nghe sự kiện messageReactionAdd trong file event để thực hiện gán vai trò thực tế
    } catch (err) {
      await interaction.reply({ content: `❌ Bot không thể sử dụng emoji này: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn không có quyền quản lý vai trò!');
    }

    const role = message.mentions.roles.first();
    const emoji = args[1];
    const desc = args.slice(2).join(' ');

    if (!role || !emoji || !desc) {
      return message.reply('❌ Cú pháp: `?reactionrole @role <emoji> <nội_dung_hướng_dẫn>`');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎭 NHẬN VAI TRÒ TỰ ĐỘNG')
      .setDescription(`${desc}\\n\\nNhấn vào biểu tượng ${emoji} bên dưới để nhận vai trò **${role.name}**!`);

    try {
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react(emoji);
    } catch (err) {
      message.reply(`❌ Lỗi tạo Reaction Role: ${err.message}`);
    }
  }
};