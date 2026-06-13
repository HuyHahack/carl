const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Tạo một cuộc biểu quyết bình chọn có nút bấm emoji bỏ phiếu')
    .addStringOption(opt => opt.setName('question').setDescription('Câu hỏi bầu chọn').setRequired(true))
    .addStringOption(opt => opt.setName('option1').setDescription('Lựa chọn số 1').setRequired(true))
    .addStringOption(opt => opt.setName('option2').setDescription('Lựa chọn số 2').setRequired(true))
    .addStringOption(opt => opt.setName('option3').setDescription('Lựa chọn số 3').setRequired(false)),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const op1 = interaction.options.getString('option1');
    const op2 = interaction.options.getString('option2');
    const op3 = interaction.options.getString('option3');

    let desc = `**📊 CÂU HỎI:** ${question}\n\n1️⃣ | ${op1}\n2️⃣ | ${op2}`;
    if (op3) desc += `\n3️⃣ | ${op3}`;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 BIỂU QUYẾT BÌNH CHỌN')
      .setDescription(desc)
      .setFooter({ text: `Khởi tạo bởi ${interaction.user.username}` })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('1️⃣');
    await msg.react('2️⃣');
    if (op3) await msg.react('3️⃣');
  },

  async executePrefix(message, args) {
    const input = args.join(' ');
    if (!input) return message.reply('❌ Cú pháp: `?poll Câu hỏi | Lựa chọn 1 | Lựa chọn 2`');

    const parts = input.split('|');
    const question = parts[0]?.trim();
    const op1 = parts[1]?.trim();
    const op2 = parts[2]?.trim();

    if (!question || !op1 || !op2) {
      return message.reply('❌ Vui lòng nhập đủ câu hỏi và tối thiểu 2 lựa chọn biểu quyết!');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 BIỂU QUYẾT BÌNH CHỌN')
      .setDescription(`**📊 CÂU HỎI:** ${question}\n\n1️⃣ | ${op1}\n2️⃣ | ${op2}`)
      .setTimestamp();

    const msg = await message.reply({ embeds: [embed] });
    await msg.react('1️⃣');
    await msg.react('2️⃣');
  }
};