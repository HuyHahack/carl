const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Hiển thị ảnh bìa hồ sơ cá nhân (Profile Banner) của thành viên')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần xem').setRequired(false)),

  async execute(interaction) {
    const optionUser = interaction.options.getUser('user') || interaction.user;
    
    // Bắt buộc phải fetch cưỡng bức (force) để Discord API trả về dữ liệu banner đầy đủ
    const targetUser = await interaction.client.users.fetch(optionUser.id, { force: true });
    const bannerUrl = targetUser.bannerURL({ dynamic: true, size: 2048 });

    if (!bannerUrl) {
      return interaction.reply({ content: `❌ Người dùng **${targetUser.username}** không thiết lập ảnh bìa hồ sơ cá nhân!`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🖼️ Banner của ${targetUser.username}`)
      .setDescription(`[👉 Tải ảnh tại đây](${bannerUrl})`)
      .setImage(bannerUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    let user = message.mentions.users.first() || message.author;
    if (message.reference && message.reference.messageId) {
      const repliedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (repliedMsg) user = repliedMsg.author;
    }

    try {
      const targetUser = await message.client.users.fetch(user.id, { force: true });
      const bannerUrl = targetUser.bannerURL({ dynamic: true, size: 2048 });

      if (!bannerUrl) {
        return message.reply(`❌ Người dùng **${targetUser.username}** không có ảnh bìa hồ sơ!`);
      }

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`🖼️ Banner của ${targetUser.username}`)
        .setImage(bannerUrl);

      message.reply({ embeds: [embed] });
    } catch (err) {
      message.reply('❌ Gặp lỗi khi tải dữ liệu ảnh bìa!');
    }
  }
};