const db = require('../database'); // Lùi 1 cấp chính xác

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
          const verifyRoleId = config.verify_role_id; // Vai trò Member nhận được sau khi xác minh
          const autoRoleId = config.autorole_id;       // Vai trò Unverified nhận tự động khi vào server

          if (!verifyRoleId) {
            return interaction.editReply({ content: '❌ Cổng xác minh chưa được cài đặt vai trò mở khóa bởi Admin!' });
          }

          const memberRole = interaction.guild.roles.cache.get(verifyRoleId);
          if (!memberRole) {
            return interaction.editReply({ content: '❌ Không tìm thấy vai trò Thành viên (Member) trong máy chủ này!' });
          }

          if (interaction.member.roles.cache.has(verifyRoleId)) {
            return interaction.editReply({ content: '⚠️ Bạn đã được xác minh từ trước rồi!' });
          }

          // A. Tiến hành thêm vai trò Thành viên (Member)
          await interaction.member.roles.add(memberRole);

          // B. Tiến hành gỡ bỏ vai trò Chưa xác minh (Unverified) nếu có
          if (autoRoleId) {
            const unverifiedRole = interaction.guild.roles.cache.get(autoRoleId);
            if (unverifiedRole && interaction.member.roles.cache.has(autoRoleId)) {
              await interaction.member.roles.remove(unverifiedRole);
            }
          }

          await interaction.editReply({ content: '✅ Xác minh thành công! Bạn đã được nhận vai trò Thành viên và gỡ bỏ vai trò Chưa xác minh.' });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: `❌ Bot không có đủ quyền hạn để thực hiện gán/gỡ vai trò: ${err.message}` });
        }
      }
    }
  }
};