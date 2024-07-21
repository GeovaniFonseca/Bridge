const CommunicationBridge = require('../contracts/CommunicationBridge')
const StateHandler = require('./handlers/StateHandler')
const MessageHandler = require('./handlers/MessageHandler')
const CommandHandler = require('./CommandHandler')
const Discord = require('discord.js-light')

class DiscordManager extends CommunicationBridge {
  constructor(app) {
    super()

    this.app = app

    this.stateHandler = new StateHandler(this)
    this.messageHandler = new MessageHandler(this, new CommandHandler(this))
  }

  connect() {
    this.client = new Discord.Client({
      cacheGuilds: true,
      cacheChannels: true,
      cacheOverwrites: false,
      cacheRoles: true,
      cacheEmojis: false,
      cachePresences: false,
    })

    this.client.on('ready', () => this.stateHandler.onReady())
    this.client.on('message', message => this.messageHandler.onMessage(message))

    this.client.login(this.app.config.discord.token).catch(error => {
      this.app.log.error(error)

      process.exit(1)
    })

    process.on('SIGINT', () => this.stateHandler.onClose())
  }

  onBroadcast({ username, message, guildRank }) {
    this.app.log.broadcast(`${username} [${guildRank}]: ${message}`, `Discord`);
    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        const { cleanMessage, imageLinks } = this.extractCleanMessageAndImageLinks(message);
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            embed: {
              description: cleanMessage,
              color: '6495ED',
              timestamp: new Date(),
              footer: {
                text: guildRank,
              },
              author: {
                name: username,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
              image: {
                url: imageLinks.length > 0 ? imageLinks[0] : null,
              },
            },
          });
        });
        break;

      case 'webhook':
        message = message.replace(/@/g, ''); // Stop pinging @everyone or @here
        this.app.discord.webhook.send(
          message, { username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username }
        );
        break;

      default:
        throw new Error('Invalid message mode: must be bot or webhook');
    }
  }

  onBroadcastOfficer({ username, message, guildRank }) {
    if (username === "DoritoBridge") {
      return;
    }

    this.app.log.broadcast(`${username} [${guildRank}]: ${message}`, `Discord`);
    this.app.discord.client.channels.fetch(this.app.config.discord.officerChannel).then(officerChannel => {
      const { cleanMessage, imageLinks } = this.extractCleanMessageAndImageLinks(message);

      officerChannel.send({
        embed: {
          description: cleanMessage,
          color: '6495ED',
          timestamp: new Date(),
          footer: {
            text: guildRank,
          },
          author: {
            name: username,
            icon_url: 'https://www.mc-heads.net/avatar/' + username,
          },
          image: {
            url: imageLinks.length > 0 ? imageLinks[0] : null,
          },
        },
      });
    });
  }

  extractCleanMessageAndImageLinks(message) {
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    const words = message.split(' ');
  
    const cleanWords = words.filter(word => {
      const lowerCaseWord = word.toLowerCase();
      return !imageExtensions.some(extension => lowerCaseWord.includes(extension));
    });
  
    const cleanMessage = cleanWords.join(' ');
  
    const imageLinks = words.filter(word => {
      const lowerCaseWord = word.toLowerCase();
      return imageExtensions.some(extension => lowerCaseWord.includes(extension));
    });
  
    return { cleanMessage, imageLinks };
  }


  onBroadcastCleanEmbed({ message, color }) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embed: {
          color: color,
          description: message,
        }
      })
    })
  }

  onBroadcastHeadedEmbed({ message, title, icon, color }) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embed: {
          color: color,
          author: {
            name: title,
            icon_url: icon,
          },
          description: message,
        }
      })
    })
  }

  onPlayerToggle({ username, message, color }) {
    this.app.log.broadcast(username + ' ' + message, 'Event')

    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            embed: {
              color: color,
              timestamp: new Date(),
              author: {
                name: `${username} ${message}`,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }
          })
        })
        break

      case 'webhook':
        this.app.discord.webhook.send({
          username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username, embeds: [{
            color: color,
            description: `${username} ${message}`,
          }]
        })
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }
}

module.exports = DiscordManager
