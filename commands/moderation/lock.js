const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Khóa hoặc mở khóa kênh chat hiện tại')
    .addBooleanOption(opt => opt.setName('state').setDescription('True = Khóa kênh, False = Mở kênh').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const state = interaction.options.getBoolean('state');

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: !state
      });
      await interaction.reply({
        content: `✅ Đã thiết lập trạng thái kênh chat thành: **${state ? 'KHÓA 🔒' : 'MỞ KHÓA 🔓'}**`
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Thất bại: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Bạn cần quyền quản lý kênh!');
    }

    const input = args[0]?.toLowerCase();
    if (input !== 'true' && input !== 'false') {
      return message.reply('❌ Định dạng lệnh phải là: `?lock true` để khóa, hoặc `?lock false` để mở!');
    }

    const state = input === 'true';
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: !state
      });
      message.reply(`✅ Đã thiết lập trạng thái kênh chat thành: **${state ? 'KHÓA 🔒' : 'MỞ KHÓA 🔓'}**`);
    } catch (err) {
      message.reply(`❌ Lỗi: ${err.message}`);
    }
  }
};