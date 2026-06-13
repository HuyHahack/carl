const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('av')
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
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    let targetUser = null;

    if (message.reference && message.reference.messageId) {
      const repliedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (repliedMsg) targetUser = repliedMsg.author;
    }

    if (!targetUser) targetUser = message.mentions.users.first();

    if (!targetUser && args[0]) {
      const idPattern = /^\d{17,19}$/;
      if (idPattern.test(args[0])) {
        targetUser = await message.client.users.fetch(args[0]).catch(() => null);
      }
    }

    if (!targetUser) targetUser = message.author;

    const avatarUrl = targetUser.displayAvatarURL({ dynamic: true, size: 2048 });

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🖼️ Avatar của ${targetUser.username}`)
      .setDescription(`[👉 Tải ảnh tại đây](${avatarUrl})`)
      .setImage(avatarUrl)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};