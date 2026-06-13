const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Thay đổi biệt danh (nickname) của một thành viên trong Server')
    .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần đổi').setRequired(true))
    .addStringOption(opt => opt.setName('new_name').setDescription('Biệt danh mới (bỏ trống để khôi phục mặc định)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const targetMember = interaction.options.getMember('user');
    const newName = interaction.options.getString('new_name');

    if (!targetMember) return interaction.reply({ content: '❌ Không tìm thấy thành viên này!', ephemeral: true });

    try {
      await targetMember.setNickname(newName);
      if (newName) {
        await interaction.reply({ content: `✅ Đã thay đổi biệt danh của **${targetMember.user.username}** thành: **${newName}**` });
      } else {
        await interaction.reply({ content: `✅ Đã khôi phục biệt danh mặc định cho thành viên **${targetMember.user.username}**` });
      }
    } catch (err) {
      await interaction.reply({ content: `❌ Bot không đủ thẩm quyền thay đổi biệt danh của người này: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return message.reply('❌ Bạn cần có quyền Manage Nicknames để dùng lệnh này!');
    }

    const targetMember = message.mentions.members.first();
    const newName = args.slice(1).join(' ');

    if (!targetMember) return message.reply('❌ Cú pháp: `?nickname @user <Biệt_danh_mới>`');

    try {
      await targetMember.setNickname(newName || null);
      if (newName) {
        message.reply(`✅ Đã đổi biệt danh của **${targetMember.user.username}** thành: **${newName}**`);
      } else {
        message.reply(`✅ Đã khôi phục tên mặc định cho **${targetMember.user.username}**`);
      }
    } catch (err) {
      message.reply(`❌ Lỗi phân quyền: ${err.message}`);
    }
  }
};