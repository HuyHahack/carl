const db = require('../database');
const { EmbedBuilder, AuditLogEvent } = require('discord.js');

// Quản lý lượng thao tác chỉnh sửa kênh tạm thời của từng Admin để chống phá (Anti-nuke)
const nukeChannelMap = new Map();

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel) {
    const guild = oldChannel.guild;
    const config = await db.getGuildConfig(guild.id);

    try {
      // 1. Quét Audit Logs lấy danh tính người chỉnh sửa kênh gần nhất
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelUpdate,
      }).catch(() => null);

      if (!fetchedLogs) return;
      const logEntry = fetchedLogs.entries.first();
      if (!logEntry) return;

      const executor = logEntry.executor;
      if (executor.id === guild.ownerId || executor.bot) return; // Bỏ qua chủ sở hữu hoặc Bot chỉnh sửa

      // 2. THEO DÕI ANTI-NUKE CHANNEL
      const now = Date.now();
      const adminActions = nukeChannelMap.get(executor.id) || [];
      adminActions.push(now);

      const recentActions = adminActions.filter(time => now - time < 60000); // Lọc lượng chỉnh sửa trong 60 giây qua
      nukeChannelMap.set(executor.id, recentActions);

      const limit = config.anti_nuke_limit || 3;
      if (recentActions.length > limit) {
        // Thu hồi toàn bộ vai trò của Admin phá hoại để bảo vệ máy chủ
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
          await member.roles.set([]).catch(() => {}); // Gỡ sạch Roles
          console.log(`🛡️ Anti-nuke: Đã thu hồi vai trò của Admin chỉnh sửa kênh hàng loạt: ${executor.tag}`);
        }
      }

      // 3. GHI NHẬT KÝ LOG KÊNH CHAT
      if (config.log_channel_id) {
        const logChannel = guild.channels.cache.get(config.log_channel_id);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📺 KÊNH CHAT BỊ CHỈNH SỬA')
            .setDescription(`Kênh: <#${newChannel.id}> (\`${newChannel.name}\`)\nNgười thực hiện: <@${executor.id}>`)
            .setTimestamp();
          await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
};