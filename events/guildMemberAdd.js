const db = require('../database');
const { EmbedBuilder } = require('discord.js');

// Bộ lưu trữ in-memory để chống spam bot gia nhập dồn dập (Anti-raid)
const raidMap = new Map();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = await db.getGuildConfig(member.guild.id);

    // ============ 1. CHỐNG TÀI KHOẢN CLONE (Alt Account check) ============
    const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
    if (accountAgeDays < (config.alt_age_limit || 3)) {
      await member.kick('Tài khoản clone bị bảo vệ tự động bởi hệ thống Anti-Alt.').catch(() => {});
      return;
    }

    // ============ 2. CHỐNG THAM GIA Ồ ẠT (Anti-raid) ============
    const now = Date.now();
    const joinTimestamps = raidMap.get(member.guild.id) || [];
    joinTimestamps.push(now);

    const recentJoins = joinTimestamps.filter(time => now - time < 10000); // Lọc lượng join trong 10 giây qua
    raidMap.set(member.guild.id, recentJoins);

    if (recentJoins.length > (config.anti_raid_limit || 10)) {
      // Nếu số lượng join vượt ngưỡng, bot có thể cảnh báo hoặc tạm thời kick
      await member.kick('Server đang bị tấn công dồn dập (Raid), kích hoạt bảo vệ tự động!').catch(() => {});
      return;
    }

    // ============ 3. GÁN VAI TRÒ TỰ ĐỘNG (Auto-role) ============
    if (config.autorole_id) {
      const role = member.guild.roles.cache.get(config.autorole_id);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // ============ 4. GỬI TIN CHÀO MỪNG (Welcome Message) ============
    if (config.welcome_channel_id && config.welcome_message) {
      const channel = member.guild.channels.cache.get(config.welcome_channel_id);
      if (channel) {
        let msg = config.welcome_message
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{server}/g, `**${member.guild.name}**`);

        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 Chào mừng thành viên mới!')
          .setDescription(msg)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
};