const db = require('../database');

// Bộ nhớ đệm lưu trữ số lượng tin nhắn tạm thời để chống Spam
const antiSpamMap = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const config = await db.getGuildConfig(message.guild.id);

    // ============ PHẦN 1: CÁC MODULE BẢO MẬT TIN NHẮN ============

    // A. ANTI-MENTION (Chống spam tag)
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    const mentionLimit = config.anti_mention_limit || 5;
    if (mentionCount > mentionLimit) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, không được tag quá nhiều người cùng một lúc!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // B. ANTI-INVITE (Chặn link mời server khác)
    if (config.anti_invite_toggle && /discord\.(gg|com\/invite)\/[a-zA-Z0-9]+/i.test(message.content)) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, quảng cáo link máy chủ khác bị cấm ở đây!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // C. ANTI-LINK (Chặn các liên kết ngoài)
    if (config.anti_link_toggle && (message.content.includes('http://') || message.content.includes('https://'))) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, liên kết ngoài bị cấm tại kênh chat này!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // D. ANTI-SPAM (Chặn gửi tin nhắn liên tục)
    if (config.anti_spam_toggle) {
      const now = Date.now();
      const userData = antiSpamMap.get(message.author.id) || [];
      userData.push(now);

      const recentMessages = userData.filter(time => now - time < 5000); // Lọc tin nhắn gửi trong 5 giây qua
      antiSpamMap.set(message.author.id, recentMessages);

      if (recentMessages.length > 5) { // Spam quá 5 tin/5 giây
        await message.delete().catch(() => {});
        return message.channel.send(`⚠️ **${message.author.username}**, phát hiện spam tin nhắn liên tục!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      }
    }

    // ============ PHẦN 2: TIN NHẮN DÍNH (STICKY MESSAGES) ============
    const stickyRes = await db.pool.query('SELECT * FROM sticky_messages WHERE channel_id = $1', [message.channel.id]).catch(() => ({ rows: [] }));
    if (stickyRes.rows.length > 0) {
      const sticky = stickyRes.rows[0];
      
      // Xóa tin nhắn dính cũ
      if (sticky.last_message_id) {
        const lastMsg = await message.channel.messages.fetch(sticky.last_message_id).catch(() => null);
        if (lastMsg) await lastMsg.delete().catch(() => {});
      }

      // Gửi tin nhắn dính mới xuống dưới cùng
      const newStickyMsg = await message.channel.send({ content: `📌 **LƯU Ý:**\n${sticky.content}` });
      await db.pool.query('UPDATE sticky_messages SET last_message_id = $1 WHERE channel_id = $2', [newStickyMsg.id, message.channel.id]).catch(() => {});
    }

    // ============ PHẦN 3: XỬ LÝ LỆNH PREFIX & CUSTOM COMMANDS ============
    const prefix = config.prefix || '?';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // 1. Chạy lệnh hệ thống gốc
    const command = client.commands.get(commandName);
    if (command && typeof command.executePrefix === 'function') {
      try {
        await command.executePrefix(message, args);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 2. Chạy lệnh tùy chỉnh (Custom Commands) do Admin tự tạo
    const customRes = await db.pool.query('SELECT response_text FROM custom_commands WHERE guild_id = $1 AND cmd_name = $2', [message.guild.id, commandName]).catch(() => ({ rows: [] }));
    if (customRes.rows.length > 0) {
      await message.reply(customRes.rows[0].response_text).catch(() => {});
    }
  }
};