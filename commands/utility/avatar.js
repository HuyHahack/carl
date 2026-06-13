const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Hiển thị ảnh đại diện chất lượng cao của thành viên')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần xem').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = targetUser.displayAvatarURL({ dynamic: true, size: 2048 });

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🖼️ Avatar của ${targetUser.username}`)
      .setDescription(`[👉 Tải ảnh tại đây](${avatarUrl})`)
      .setImage(avatarUrl)
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    let targetUser = null;

    // A. Nếu người dùng phản hồi (reply) tin nhắn của người khác
    if (message.reference && message.reference.messageId) {
      const repliedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (repliedMsg) targetUser = repliedMsg.author;
    }

    // B. Nếu có tag trực tiếp
    if (!targetUser) {
      targetUser = message.mentions.users.first();
    }

    // C. Nếu nhập ID người dùng
    if (!targetUser && args[0]) {
      const idPattern = /^\d{17,19}$/;
      if (idPattern.test(args[0])) {
        targetUser = await message.client.users.fetch(args[0]).catch(() => null);
      }
    }

    // D. Mặc định lấy chính người gửi lệnh
    if (!targetUser) {
      targetUser = message.author;
    }

    const avatarUrl = targetUser.displayAvatarURL({ dynamic: true, size: 2048 });

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🖼️ Avatar của ${targetUser.username}`)
      .setDescription(`[👉 Tải ảnh tại đây](${avatarUrl})`)
      .setImage(avatarUrl)
      .setFooter({ text: `Yêu cầu bởi ${message.author.username}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};