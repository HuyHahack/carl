const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Tạo một tin nhắn khung nhúng (Embed Message)')
    .addStringOption(opt => opt.setName('title').setDescription('Tiêu đề tin nhắn').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Nội dung chi tiết').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Mã màu Hex (Ví dụ: #FF0000 hoặc Red)').setRequired(false)),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const desc = interaction.options.getString('description');
    const colorInput = interaction.options.getString('color') || '#00FF00';

    const embed = new EmbedBuilder()
      .setColor(colorInput.startsWith('#') ? colorInput : 0x00FF00)
      .setTitle(title)
      .setDescription(desc.replace(/\\n/g, '\n'))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    const input = args.join(' ');
    if (!input) {
      return message.reply('❌ Cú pháp: `?embed <Tiêu_đề> | <Nội_dung>` (Phân tách bởi dấu gạch đứng `|`)');
    }

    const parts = input.split('|');
    const title = parts[0]?.trim();
    const desc = parts[1]?.trim();

    if (!title || !desc) {
      return message.reply('❌ Cú pháp thiếu tiêu đề hoặc nội dung. Vui lòng nhập: `?embed Tiêu đề | Nội dung`!');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(title)
      .setDescription(desc.replace(/\\n/g, '\n'))
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};