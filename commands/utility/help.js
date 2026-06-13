const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Hiển thị danh sách các lệnh cấu hình và điều hành'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('📖 DANH SÁCH LỆNH HỆ THỐNG')
      .setDescription(
        `**🛠️ Điều hành:**\n` +
        `└ \`?ban\`, \`?kick\`, \`?timeout\`, \`?unban\`, \`?purge\`, \`?slowmode\`, \`?lock\`, \`?unlock\`, \`?warn\`, \`?warnings\`, \`?clearwarn\`\n\n` +
        `**🔒 Bảo mật:**\n` +
        `└ \`?antispam\`, \`?antimention\`, \`?antilink\`, \`?antiinvite\`, \`?antiraid\`\n\n` +
        `**⚙️ Cấu hình:**\n` +
        `└ \`?autorole\`, \`?customcmd\`, \`?sticky\`, \`?setup-welcome\`, \`?setup-verification\`\n\n` +
        `**🎨 Tiện ích:**\n` +
        `└ \`?av\`, \`?userinfo\`, \`?serverinfo\`, \`?ping\`, \`?remind\`, \`?nickname\``
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async executePrefix(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('📖 DANH SÁCH LỆNH HỆ THỐNG')
      .setDescription(
        `**🛠️ Điều hành:**\n` +
        `└ \`?ban\`, \`?kick\`, \`?timeout\`, \`?unban\`, \`?purge\`, \`?slowmode\`, \`?lock\`, \`?unlock\`, \`?warn\`, \`?warnings\`, \`?clearwarn\`\n\n` +
        `**🔒 Bảo mật:**\n` +
        `└ \`?antispam\`, \`?antimention\`, \`?antilink\`, \`?antiinvite\`, \`?antiraid\`\n\n` +
        `**⚙️ Cấu hình:**\n` +
        `└ \`?autorole\`, \`?customcmd\`, \`?sticky\`, \`?setup-welcome\`, \`?setup-verification\`\n\n` +
        `**🎨 Tiện ích:**\n` +
        `└ \`?av\`, \`?userinfo\`, \`?serverinfo\`, \`?ping\`, \`?remind\`, \`?nickname\``
      );
    message.reply({ embeds: [embed] });
  }
};