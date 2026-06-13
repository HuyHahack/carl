const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customcmd')
    .setDescription('Tạo một lệnh trả lời nhanh tùy chỉnh cho Server')
    .addStringOption(opt => opt.setName('command_name').setDescription('Tên lệnh viết liền không khoảng cách').setRequired(true))
    .addStringOption(opt => opt.setName('response').setDescription('Nội dung bot sẽ trả lời').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const cmdName = interaction.options.getString('command_name').toLowerCase().trim();
    const response = interaction.options.getString('response');

    if (cmdName.includes(' ')) return interaction.reply({ content: '❌ Tên lệnh viết liền không được chứa khoảng cách!', ephemeral: true });

    try {
      await db.pool.query(
        'INSERT INTO custom_commands (guild_id, cmd_name, response_text) VALUES ($1, $2, $3) ON CONFLICT (guild_id, cmd_name) DO UPDATE SET response_text = $3',
        [interaction.guild.id, cmdName, response]
      );
      await interaction.reply({ content: `✅ Đã thiết lập lệnh tùy chỉnh thành công! Sử dụng bằng cách gõ: \`?[prefix]${cmdName}\`` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Lỗi cơ sở dữ liệu!', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Yêu cầu quyền quản lý máy chủ!');
    }

    const cmdName = args[0]?.toLowerCase().trim();
    const response = args.slice(1).join(' ');

    if (!cmdName || !response) {
      return message.reply('❌ Cú pháp: `?customcmd <tên_lệnh> <nội_dung_trả_lời>`');
    }

    try {
      await db.pool.query(
        'INSERT INTO custom_commands (guild_id, cmd_name, response_text) VALUES ($1, $2, $3) ON CONFLICT (guild_id, cmd_name) DO UPDATE SET response_text = $3',
        [message.guild.id, cmdName, response]
      );
      message.reply(`✅ Đã cài đặt lệnh tùy chỉnh thành công! Sử dụng bằng cách gõ tiền tố kèm tên lệnh: \`?${cmdName}\``);
    } catch (err) {
      console.error(err);
      message.reply('❌ Gặp lỗi kết nối DB!');
    }
  }
};