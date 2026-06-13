const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Xóa tin nhắn hàng loạt trong kênh chat')
    .addStringOption(opt => opt.setName('amount').setDescription('Số tin cần xóa (1-100) hoặc gõ "all" để xóa tối đa').setRequired(true))
    .addUserOption(opt => opt.setName('filter').setDescription('Chỉ xóa tin nhắn của người này').setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Bạn cần có quyền Manage Messages!', ephemeral: true });
    }
    const amountInput = interaction.options.getString('amount');
    const filterUser = interaction.options.getUser('filter');
    
    await interaction.deferReply({ ephemeral: true });
    
    let amount = amountInput.toLowerCase() === 'all' ? 100 : parseInt(amountInput);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return interaction.editReply({ content: '❌ Số tin nhắn cần xóa phải từ 1 đến 100 hoặc nhập "all"!' });
    }

    try {
      let messages = await interaction.channel.messages.fetch({ limit: amount });
      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id);
      }
      const deleted = await interaction.channel.bulkDelete(messages, true);
      await interaction.editReply({ content: `✅ Đã xóa thành công **${deleted.size}** tin nhắn!` });
    } catch (err) {
      await interaction.editReply({ content: `❌ Lỗi dọn dẹp tin nhắn: ${err.message}` });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bạn không có quyền Manage Messages!');
    }
    const input = args[0]?.toLowerCase();
    let amount = input === 'all' ? 100 : parseInt(input);
    if (!input || (isNaN(amount) && input !== 'all') || amount < 1 || amount > 100) {
      return message.reply('❌ Cú pháp: `?purge <1-100 hoặc all>`');
    }
    const filterUser = message.mentions.users.first();
    try {
      let messages = await message.channel.messages.fetch({ limit: amount });
      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id);
      }
      const deleted = await message.channel.bulkDelete(messages, true);
      const confirmMsg = await message.channel.send(`✅ Đã dọn dẹp **${deleted.size}** tin nhắn thành công!`);
      
      // Tự động xóa tin nhắn thông báo của bot sau 5 giây
      setTimeout(() => {
        confirmMsg.delete().catch(() => {});
      }, 5000);
    } catch (err) {
      message.reply(`❌ Thất bại: ${err.message}`);
    }
  }
};