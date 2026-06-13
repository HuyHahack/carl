const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Xóa số lượng lớn tin nhắn trong kênh')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Số tin nhắn cần xóa (1 - 100)').setRequired(true))
    .addUserOption(opt => opt.setName('filter').setDescription('Chỉ xóa tin nhắn của người này').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const filterUser = interaction.options.getUser('filter');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Chỉ được chọn xóa từ 1 đến 100 tin nhắn cùng lúc!', ephemeral: true });
    }

    try {
      let messages = await interaction.channel.messages.fetch({ limit: amount });
      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id);
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);
      await interaction.reply({ content: `✅ Đã xóa thành công **${deleted.size}** tin nhắn!`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `❌ Lỗi dọn dẹp tin nhắn: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bạn không có quyền Manage Messages!');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Vui lòng nhập số lượng tin nhắn hợp lệ cần dọn dẹp từ 1 đến 100!');
    }

    const filterUser = message.mentions.users.first();
    try {
      let messages = await message.channel.messages.fetch({ limit: amount });
      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id);
      }

      const deleted = await message.channel.bulkDelete(messages, true);
      const confirm = await message.channel.send(`✅ Đã dọn dẹp **${deleted.size}** tin nhắn thành công!`);
      setTimeout(() => confirm.delete().catch(() => {}), 5000);
    } catch (err) {
      message.reply(`❌ Thất bại: ${err.message}`);
    }
  }
};