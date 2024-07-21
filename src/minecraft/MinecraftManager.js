const CommunicationBridge = require('../contracts/CommunicationBridge')
const CommandHandler = require('./CommandHandler')
const StateHandler = require('./handlers/StateHandler')
const ErrorHandler = require('./handlers/ErrorHandler')
const ChatHandler = require('./handlers/ChatHandler')
const mineflayer = require('mineflayer')
const Filter = require('./Filter')

class MinecraftManager extends CommunicationBridge {
  constructor(app) {
    super()

    this.app = app

    this.stateHandler = new StateHandler(this)
    this.errorHandler = new ErrorHandler(this)
    this.chatHandler = new ChatHandler(this, new CommandHandler(this))
    this.filter = new Filter(0)
  }

  connect() {
    this.bot = this.createBotConnection()

    this.errorHandler.registerEvents(this.bot)
    this.stateHandler.registerEvents(this.bot)
    this.chatHandler.registerEvents(this.bot)
  }

  createBotConnection() {
    return mineflayer.createBot({
      host: this.app.config.server.host,
      port: this.app.config.server.port,
      username: this.app.config.minecraft.username,
      password: this.app.config.minecraft.password,
      version: false,
      auth: this.app.config.minecraft.accountType,
    })
  }

  processAndBroadcastMessage(username, message, replyingTo, image, chatCommand) {
    this.app.log.broadcast(`${username}: ${message}`, 'Minecraft');
    var finalMessage = `${message}`;
    finalMessage = this.filter.filter(finalMessage);
    
    if (finalMessage === "<Message Deleted>") {
        this.app.log.warn(`${username}'s message was deleted because it was flagged as inappropriate`);
    }

    if (this.bot.player !== undefined) {
        const fullMessage = `${replyingTo ? `${username} para ${replyingTo} >` : `${username} >`} ${finalMessage}`;
        if (fullMessage.length > 0) {
            if (image && image.length > 0) {
                this.bot.chat(`${chatCommand} ${fullMessage} ${image}`);
            } else {
                this.bot.chat(`${chatCommand} ${fullMessage}`);
            }
        } else if (image && image.length > 0) {
            this.bot.chat(`${chatCommand} ${image}`);
        }
    }
  }

  onBroadcast({ username, message, replyingTo, image }) {
      this.processAndBroadcastMessage.call(this, username, message, replyingTo, image, '/gc');
  }

  onBroadcastOfficer({ username, message, replyingTo, image }) {
      this.processAndBroadcastMessage.call(this, username, message, replyingTo, image, '/oc');
  }

}

module.exports = MinecraftManager;