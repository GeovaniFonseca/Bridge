class MessageHandler {
  constructor(discord, command) {
    this.discord = discord
    this.command = command
  }

  async onMessage(message) {
    const officerBroadcast = this.shouldBroadcastOfficerMessage(message);
    const regularBroadcast = this.shouldBroadcastMessage(message);

    if (officerBroadcast || regularBroadcast) {
      if (this.command.handle(message)) {
        return;
      }

      const content = this.stripDiscordContent(message.content).trim();
      const attachments = message.attachments.array();
      let imageLink = '';

      if (attachments.length > 0) {
        const attachment = attachments[0];
        imageLink = attachment.url;
      }

      const mentionedUsers = message.mentions.users;
      const mentionedUsernames = mentionedUsers.map((user) => `@${user.username}`);
      const formattedMentions = mentionedUsernames.join(' ');

      let formattedMessage = content;

      if (mentionedUsernames.length > 0) {
        formattedMessage += ` ${formattedMentions}`;
      }

      if (formattedMessage.length === 0 && imageLink.length === 0) {
        return;
      }

      if (officerBroadcast) {
        this.discord.broadcastOfficer({
          username: message.member.displayName,
          message: formattedMessage,
          image: imageLink,
          replyingTo: await this.fetchReply(message),
        });
      } else {
        this.discord.broadcastMessage({
          username: message.member.displayName,
          message: formattedMessage,
          image: imageLink,
          replyingTo: await this.fetchReply(message),
        });
      }
    }
  }

  async fetchReply(message) {
    try {
      if (!message.reference) return null

      const reference = await message.channel.messages.fetch(message.reference.messageID)

      return reference.member ? reference.member.displayName : reference.author.username
    } catch (e) {
      return null
    }
  }

  stripDiscordContent(message) {
    return message
      .replace(/<[@|#|!|&]{1,2}(\d+){16,}>/g, '')
      .replace(/<:\w+:(\d+){16,}>/g, '')
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}<>+\-|/\\[\]{}]/gu, '')
      .split('\n')
      .map(part => {
        part = part.trim();

        return part.length === 0 ? '' : part + ' ';
      })
      .join('');
  }

  shouldBroadcastMessage(message) {
    return !message.author.bot && message.channel.id == this.discord.app.config.discord.channel
  }

  shouldBroadcastOfficerMessage(message) {
    return !message.author.bot && message.channel.id == this.discord.app.config.discord.officerChannel
  }
}

module.exports = MessageHandler