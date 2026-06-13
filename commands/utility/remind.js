const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Lên lịch hẹn giờ nhắc nhở công việc cá nhân')
    .addStringOption(opt => opt.setName('time').setDescription('Thời gian (Ví dụ: 10s, 5m, 1h)').setRequired(true))
    .addStringOption(opt => opt.setName('content').setDescription('Nội dung cần nhắc nhở').setRequired(true)),

  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const content = interaction.options.getString('content');

    let milliseconds = 0;
    const num = parseInt(timeStr);
    
    if (timeStr.endsWith('s')) milliseconds = num * 1000;
    else if (timeStr.endsWith('m')) milliseconds = num * 60000;
    else if (timeStr.endsWith('h')) milliseconds = num * 3600000;
    else {
      return interaction.reply({ content: '❌ Định dạng thời gian không hợp lệ! Hãy sử dụng ký tự đuôi `s` (giây), `m` (phút), hoặc `h` (giờ) (Ví dụ: `10m`, `1h`)', ephemeral: true });
    }

    await interaction.reply({ content: `✅ Đã thiết lập nhắc nhở thành công! Tôi sẽ nhắc bạn sau **${timeStr}**.`, ephemeral: true });

    setTimeout(async () => {
      await interaction.user.send({ content: `⏰ **LỜI NHẮC HẸN GIỜ:** ${content}` }).catch(() => {
        interaction.channel.send({ content: `⏰ <@${interaction.user.id}> **LỜI NHẮC HẸN GIỜ:** ${content}` });
      });
    }, milliseconds);
  },

  async executePrefix(message, args) {
    const timeStr = args[0];
    const content = args.slice(1).join(' ');

    if (!timeStr || !content) {
      return message.reply('❌ Cú pháp: `?remind <thời_gian> <nội_dung>` (Ví dụ: `?remind 5m Làm bài tập`)');
    }

    let milliseconds = 0;
    const num = parseInt(timeStr);
    
    if (timeStr.endsWith('s')) milliseconds = num * 1000;
    else if (timeStr.endsWith('m')) milliseconds = num * 60000;
    else if (timeStr.endsWith('h')) milliseconds = num * 3600000;
    else {
      return message.reply('❌ Định dạng thời gian sai! Sử dụng đuôi `s`, `m` hoặc `h`.');
    }

    message.reply(`✅ Đã thiết lập nhắc nhở thành công sau **${timeStr}**!`);

    setTimeout(async () => {
      await message.author.send({ content: `⏰ **NHẮC HẸN GIỜ:** ${content}` }).catch(() => {
        message.channel.send({ content: `⏰ <@${message.author.id}> **NHẮC HẸN GIỜ:** ${content}` });
      });
    }, milliseconds);
  }
};