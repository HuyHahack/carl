const db = require('../database'); // Đã sửa lại đường dẫn lùi 1 cấp chính xác

// Bộ nhớ đệm lưu trữ số lượng tin nhắn tạm thời để chống Spam
const antiSpamMap = new Map();
// Bộ nhớ đệm đếm số lần vi phạm của từng người dùng để phân cấp hình phạt cách ly
const spamInfractionMap = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // A. PHÁT HIỆN LỆNH TÙY CHỈNH CHẠY KHÔNG CẦN PREFIX (Không cần ?)
    const triggerWord = message.content.toLowerCase().trim();
    const customRes = await db.pool.query(
      'SELECT response_text FROM custom_commands WHERE guild_id = $1 AND cmd_name = $2',
      [message.guild.id, triggerWord]
    ).catch(() => ({ rows: [] }));

    if (customRes.rows.length > 0) {
      return await message.reply(customRes.rows[0].response_text).catch(() => {});
    }

    const config = await db.getGuildConfig(message.guild.id);

    // B. ANTI-MENTION (Chống spam tag)
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    const mentionLimit = config.anti_mention_limit || 5;
    if (mentionCount > mentionLimit) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, không được tag quá nhiều người cùng một lúc!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // C. ANTI-INVITE (Chặn link mời server khác)
    if (config.anti_invite_toggle && /discord\.(gg|com\/invite)\/[a-zA-Z0-9]+/i.test(message.content)) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, quảng cáo link máy chủ khác bị cấm ở đây!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // D. ANTI-LINK (Chặn các liên kết ngoài)
    if (config.anti_link_toggle && (message.content.includes('http://') || message.content.includes('https://'))) {
      await message.delete().catch(() => {});
      return message.channel.send(`⚠️ **${message.author.username}**, liên kết ngoài bị cấm tại kênh chat này!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // E. ANTI-SPAM BẢO MẬT (Message rate limiting & mute escalation)
    if (config.anti_spam_toggle) {
      const now = Date.now();
      const userData = antiSpamMap.get(message.author.id) || [];
      userData.push(now);

      const recentMessages = userData.filter(time => now - time < 5000); // Lọc tin nhắn gửi trong 5 giây qua
      antiSpamMap.set(message.author.id, recentMessages);

      if (recentMessages.length > 5) { // Spam quá 5 tin/5 giây
        await message.delete().catch(() => {}); // Xóa tin nhắn spam

        // Hệ thống đếm số lần vi phạm trong bộ nhớ đệm
        const violationCount = (spamInfractionMap.get(message.author.id) || 0) + 1;
        spamInfractionMap.set(message.author.id, violationCount);

        const member = await message.guild.members.fetch(message.author.id).catch(() => null);

        if (violationCount === 1) {
          // Lần 1: Cảnh báo 1/5 gửi tin riêng tư qua DM
          await message.author.send('⚠️ **CẢNH BÁO SPAM (1/5):** Vui lòng không gửi tin nhắn quá nhanh trong máy chủ!').catch(() => {});
          const pubMsg = await message.channel.send(`⚠️ Phát hiện hành vi spam từ <@${message.author.id}>! Đã xóa tin nhắn và cảnh báo riêng.`);
          setTimeout(() => pubMsg.delete().catch(() => {}), 5000);
        } else if (violationCount === 2) {
          // Lần 2: Mute 10 giây
          if (member && member.moderatable) {
            await member.timeout(10 * 1000, 'Spam lần 2');
            const pubMsg = await message.channel.send(`🔇 Phát hiện spam từ <@${message.author.id}>! Đã tiến hành cách ly **10 giây** (Cảnh báo 2/5).`);
            setTimeout(() => pubMsg.delete().catch(() => {}), 5000);
          }
        } else if (violationCount === 3) {
          // Lần 3: Mute 1 phút
          if (member && member.moderatable) {
            await member.timeout(60 * 1000, 'Spam lần 3');
            const pubMsg = await message.channel.send(`🔇 Phát hiện spam từ <@${message.author.id}>! Đã tiến hành cách ly **1 phút** (Cảnh báo 3/5).`);
            setTimeout(() => pubMsg.delete().catch(() => {}), 5000);
          }
        } else if (violationCount === 4) {
          // Lần 4: Mute 30 phút
          if (member && member.moderatable) {
            await member.timeout(30 * 60 * 1000, 'Spam lần 4');
            const pubMsg = await message.channel.send(`🔇 Phát hiện spam từ <@${message.author.id}>! Đã tiến hành cách ly **30 phút** (Cảnh báo 4/5).`);
            setTimeout(() => pubMsg.delete().catch(() => {}), 5000);
          }
        } else if (violationCount >= 5) {
          // Lần 5+: Mute 1 ngày (86400 giây)
          if (member && member.moderatable) {
            await member.timeout(24 * 60 * 60 * 1000, 'Spam lần 5');
            const pubMsg = await message.channel.send(`🔇 Phát hiện spam nghiêm trọng từ <@${message.author.id}>! Đã cách ly **1 ngày** (Cảnh báo 5/5).`);
            setTimeout(() => pubMsg.delete().catch(() => {}), 10000);
          }
        }
        return; // Dừng xử lý các logic khác của tin nhắn này
      }
    }

    // F. STICKY MESSAGES (Tin nhắn dán cuối kênh chat)
    const stickyRes = await db.pool.query('SELECT * FROM sticky_messages WHERE channel_id = $1', [message.channel.id]).catch(() => ({ rows: [] }));
    if (stickyRes.rows.length > 0) {
      const sticky = stickyRes.rows[0];
      
      if (sticky.last_message_id) {
        const lastMsg = await message.channel.messages.fetch(sticky.last_message_id).catch(() => null);
        if (lastMsg) await lastMsg.delete().catch(() => {});
      }

      const newStickyMsg = await message.channel.send({ content: `📌 **LƯU Ý:**\n${sticky.content}` });
      await db.pool.query('UPDATE sticky_messages SET last_message_id = $1 WHERE channel_id = $2', [newStickyMsg.id, message.channel.id]).catch(() => {});
    }

    // G. Xử lý các lệnh prefix hệ thống thông thường khác
    const prefix = config.prefix || '?';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (command && typeof command.executePrefix === 'function') {
      try {
        await command.executePrefix(message, args);
      } catch (err) {
        console.error(err);
      }
    }
  }
};