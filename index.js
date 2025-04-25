const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonComponent, ButtonStyle, ActionRowBuilder, PermissionsFlags, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, AttachmentBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, AuditLogEvent } = require("discord.js");
const fs = require("fs")
const ayarlar = require("./ayarlar.js");
const { prefix, color, durumyazi, logKanal, seskanal } = require("./ayarlar.js")
const db = require("croxydb")
const Discord = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ],
});

module.exports = client;

const { error } = require("console");

client.login(ayarlar.token)

client.commands = new Collection();
client.aliases = new Collection();

client.on('ready', () => {

    client.user.setPresence({ activities: [{ name: durumyazi }] });

    console.log('_________________________________________');
    console.log(`Bot    : ${client.user.username}`);
    console.log(`Users  : ${client.users.cache.size}`);
    console.log(`Durum  : Already Active!`);
    console.log('_________________________________________');

});
/*
client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let command = message.content.toLocaleLowerCase().split(" ")[0].slice(prefix.length);
    let params = message.content.split(" ").slice(1);
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (cmd) {
        cmd.run(client, message, params)
    }
});
 */
/*
fs.readdir("./komutlar", (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });

})
 */


function createEmbed(eventType, description, color) {
    try {
        return new EmbedBuilder()
            .setAuthor({ name: 'Log Sistemi', iconURL: client.user.displayAvatarURL() })
            .setTitle(`**${eventType}**`)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `Log ID: ${Date.now()}`, iconURL: client.user.avatarURL() })
            .setTimestamp()
            .setThumbnail(client.user.avatarURL());
    } catch (err) {
        console.log(err)
    }
}

async function sendLog(embed) {
    try {
        const channel = client.channels.cache.get(ayarlar.logKanal);
        if (!channel) return console.log("Log kanalı bulunamadı!");
        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.log(err)
    }
}



client.on('roleCreate', async (role) => {
    const embed = createEmbed(
        'ROL OLUŞTURULDU',
        `**Rol:** ${role.name} (${role.id})\n**Renk:** ${role.hexColor}\n**İzinler:** ${role.permissions.toArray().join(', ') || 'Yok'}`,
        '#00ff00'
    );
    await sendLog(embed);
});

client.on('roleDelete', async (role) => {
    const embed = createEmbed(
        'ROL SİLİNDİ',
        `**Rol:** ${role.name} (${role.id})\n**Renk:** ${role.hexColor}`,
        '#ff0000'
    );
    await sendLog(embed);
});

client.on('roleUpdate', async (oldRole, newRole) => {
    const changes = [];
    if (oldRole.name !== newRole.name) changes.push(`**İsim:** ${oldRole.name} → ${newRole.name}`);
    if (oldRole.hexColor !== newRole.hexColor) changes.push(`**Renk:** ${oldRole.hexColor} → ${newRole.hexColor}`);
    if (oldRole.permissions !== newRole.permissions) changes.push(`**İzinler:** Değiştirildi`);

    const embed = createEmbed(
        'ROL GÜNCELLENDİ',
        `**Rol:** ${newRole.name} (${newRole.id})\n${changes.join('\n')}`,
        '#ffff00'
    );
    await sendLog(embed);
});

client.on('channelCreate', async (channel) => {
    const embed = createEmbed(
        'KANAL OLUŞTURULDU',
        `**Tür:** ${channel.type}\n**İsim:** ${channel.name}\n**ID:** ${channel.id}`,
        '#00ff00'
    );
    await sendLog(embed);
});

client.on('channelDelete', async (channel) => {
    const embed = createEmbed(
        'KANAL SİLİNDİ',
        `**Tür:** ${channel.type}\n**İsim:** ${channel.name}\n**ID:** ${channel.id}`,
        '#ff0000'
    );
    await sendLog(embed);
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    const changes = [];
    if (oldChannel.name !== newChannel.name) changes.push(`**İsim:** ${oldChannel.name} → ${newChannel.name}`);
    if (oldChannel.topic !== newChannel.topic) changes.push(`**Açıklama:** Değiştirildi`);
    if (oldChannel.parentId !== newChannel.parentId) changes.push(`**Kategori:** Değiştirildi`);

    const embed = createEmbed(
        'KANAL GÜNCELLENDİ',
        `**Kanal:** ${newChannel.name} (${newChannel.id})\n${changes.join('\n')}`,
        '#ffff00'
    );
    await sendLog(embed);
});

client.on('messageDelete', async (message) => {
    const embed = createEmbed(
        'MESAJ SİLİNDİ',
        `**Yazar:** ${message.author?.tag || 'Bilinmiyor'}\n**Kanal:** ${message.channel.name}\n**İçerik:** ${message.content?.slice(0, 1000) || 'İçerik yok'}`,
        '#ff0000'
    );
    await sendLog(embed);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return;
    const embed = createEmbed(
        'MESAJ DÜZENLENDİ',
        `**Yazar:** ${newMessage.author.tag}\n**Kanal:** ${newMessage.channel.name}\n**Eski İçerik:** ${oldMessage.content?.slice(0, 500) || 'Yok'}\n**Yeni İçerik:** ${newMessage.content?.slice(0, 500) || 'Yok'}`,
        '#ffff00'
    );
    await sendLog(embed);
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
    const changes = [];
    if (oldGuild.name !== newGuild.name) changes.push(`**İsim:** ${oldGuild.name} → ${newGuild.name}`);
    if (oldGuild.afkChannel !== newGuild.afkChannel) changes.push(`**AFK Kanalı:** Değiştirildi`);
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`**Doğrulama Seviyesi:** Değiştirildi`);

    const embed = createEmbed(
        'SUNUCU GÜNCELLENDİ',
        changes.join('\n'),
        '#ffa500'
    );
    await sendLog(embed);
});

client.on('emojiCreate', async (emoji) => {
    const embed = createEmbed(
        'EMOJI EKLENDİ',
        `**İsim:** ${emoji.name}\n**ID:** ${emoji.id}\n**Animasyonlu mu:** ${emoji.animated ? 'Evet' : 'Hayır'}`,
        '#00ff00'
    );
    await sendLog(embed);
});

client.on('emojiDelete', async (emoji) => {
    const embed = createEmbed(
        'EMOJI SİLİNDİ',
        `**İsim:** ${emoji.name}\n**ID:** ${emoji.id}`,
        '#ff0000'
    );
    await sendLog(embed);
});


client.on('webhookUpdate', async (channel) => {
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        type: AuditLogEvent.WebhookCreate,
        limit: 1
    });
    const log = fetchedLogs.entries.first();

    const embed = createEmbed(
        'WEBHOOK DEĞİŞİKLİĞİ',
        `**Kanal:** ${channel.name}\n**Eylem:** ${log.actionType}\n**Yapan:** ${log.executor.tag}`,
        '#8a2be2'
    );
    await sendLog(embed);
});

client.on('guildBoostLevelUp', async (guild, oldLevel, newLevel) => {
    const embed = createEmbed(
        'BOOST SEVİYESİ ARTTI',
        `**Eski Seviye:** ${oldLevel}\n**Yeni Seviye:** ${newLevel}`,
        '#ff73fa'
    );
    await sendLog(embed);
});

client.on('stickerCreate', async (sticker) => {
    const embed = createEmbed(
        'ÇIKARTMA EKLENDİ',
        `**İsim:** ${sticker.name}\n**Açıklama:** ${sticker.description || 'Yok'}\n**Etiket:** :${sticker.tags}:`,
        '#00ff00'
    ).setThumbnail(sticker.url);
    await sendLog(embed);
});

client.on('stickerDelete', async (sticker) => {
    const embed = createEmbed(
        'ÇIKARTMA SİLİNDİ',
        `**İsim:** ${sticker.name}\n**ID:** ${sticker.id}`,
        '#ff0000'
    );
    await sendLog(embed);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const action = newMember.communicationDisabledUntilTimestamp ? 'VERİLDİ' : 'KALDIRILDI';
        const embed = createEmbed(
            `TIMEOUT ${action}`,
            `**Kullanıcı:** ${newMember.user.tag}\n**Süre:** ${action === 'VERİLDİ' ? `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:R>` : 'Yok'}`,
            '#ff5555'
        );
        await sendLog(embed);
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const changes = [];
    if (oldState.channelId !== newState.channelId) {
        changes.push(`**Kanal:** ${oldState.channel?.name || 'Yok'} → ${newState.channel?.name || 'Yok'}`);
    }
    if (oldState.mute !== newState.mute) changes.push(`**Susturulma:** ${newState.mute ? 'Açıldı' : 'Kapatıldı'}`);
    if (oldState.deaf !== newState.deaf) changes.push(`**Sağırlaştırma:** ${newState.deaf ? 'Açıldı' : 'Kapatıldı'}`);

    if (changes.length > 0) {
        const embed = createEmbed(
            'SES DURUMU GÜNCELLENDİ',
            `**Kullanıcı:** ${newState.member.user.tag}\n${changes.join('\n')}`,
            '#1e90ff'
        );
        await sendLog(embed);
    }
});

client.on('guildMemberAdd', async (member) => {
    const embed = createEmbed(
        'ÜYE KATILDI',
        `**Kullanıcı:** ${member.user.tag}\n**Hesap Oluşturulma:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        '#00ff00'
    ).setThumbnail(member.user.displayAvatarURL());
    await sendLog(embed);
});

client.on('guildMemberRemove', async (member) => {
    const embed = createEmbed(
        'ÜYE AYRILDI',
        `**Kullanıcı:** ${member.user.tag}\n**Sunucuda Kalma Süresi:** ${Math.floor((Date.now() - member.joinedTimestamp) / 86400000)} gün`,
        '#ff0000'
    ).setThumbnail(member.user.displayAvatarURL());
    await sendLog(embed);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
        const embed = createEmbed(
            'NICKNAME DEĞİŞTİRİLDİ',
            `**Kullanıcı:** ${newMember.user.tag}\n**Eski:** ${oldMember.nickname || 'Yok'}\n**Yeni:** ${newMember.nickname || 'Yok'}`,
            '#ffd700'
        );
        await sendLog(embed);
    }
});

client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    const changes = [];
    if (oldEmoji.name !== newEmoji.name) changes.push(`**İsim:** ${oldEmoji.name} → ${newEmoji.name}`);
    if (oldEmoji.roles.cache.size !== newEmoji.roles.cache.size) changes.push(`**Rol Kısıtlamaları:** Değiştirildi`);

    const embed = createEmbed(
        'EMOJI GÜNCELLENDİ',
        `**Emoji:** ${newEmoji.name}\n${changes.join('\n')}`,
        '#ffff00'
    ).setThumbnail(newEmoji.url);
    await sendLog(embed);
});

client.on('guildBanAdd', async (ban) => {
    const embed = createEmbed(
        'KULLANICI BANLANDI',
        `**Kullanıcı:** ${ban.user.tag}\n**Sebep:** ${ban.reason || 'Belirtilmemiş'}`,
        '#ff0000'
    );
    await sendLog(embed);
});

client.on('guildBanRemove', async (ban) => {
    const embed = createEmbed(
        'BAN KALDIRILDI',
        `**Kullanıcı:** ${ban.user.tag}`,
        '#00ff00'
    );
    await sendLog(embed);
});
