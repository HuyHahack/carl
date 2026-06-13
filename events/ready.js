const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    // Đặt trạng thái hoạt động cho bot
    client.user.setPresence({
      activities: [{ name: '🛡️ Bảo vệ máy chủ | ?help', type: ActivityType.Watching }],
      status: 'online',
    });
    console.log(`📡 Gateway: Bot đã thiết lập trạng thái hoạt động theo dõi.`);
  }
};