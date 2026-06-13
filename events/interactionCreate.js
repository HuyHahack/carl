const db = require('../database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1. Xử lý Slash Command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        const errPayload = { content: '❌ Có lỗi xảy ra khi thực thi lệnh này!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errPayload).catch(() => {});
        } else {
          await interaction.reply(errPayload).catch(() => {});
        }
      }
    }

    // 2. Xử lý nút bấm xác minh (Verify Button)
    if (interaction.isButton()) {
      if (interaction.customId === 'verify_member_btn') {
        await interaction.deferReply({ ephemeral: true });

        try {
          const config = await db.getGuildConfig(interaction.guild.id);
          const verifyRoleId = config.verify_role_id;

          if (!verifyRoleId) {
            return interaction.editReply({ content: '❌ Cổng xác minh chưa được cài đặt vai trò mở khóa bởi Admin!' });
          }

          const role = interaction.guild.roles.cache.get(verifyRoleId);
          if (!role) {
            return interaction.editReply({ content: '❌ Không tìm thấy vai trò mở khóa trong máy chủ này!' });
          }

          if (interaction.member.roles.cache.has(verifyRoleId)) {
            return interaction.editReply({ content: '⚠️ Bạn đã được xác minh từ trước rồi!' });
          }

          await interaction.member.roles.add(role);
          await interaction.editReply({ content: '✅ Xác minh thành công! Chúc bạn có trải nghiệm vui vẻ trong máy chủ.' });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: `❌ Bot không có đủ quyền hạn để gán vai trò này: ${err.message}` });
        }
      }
    }
  }
};