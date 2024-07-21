const MinecraftCommand = require('../../contracts/MinecraftCommand')

class Onlinecommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'on'
    this.aliases = []
    this.description = ''
  }

  onCommand(username, message) {
    this.send(`/g online ${username}`)
    this.send(`/gc ${replyingTo} ${username}`)
  }
}

module.exports = Onlinecommand


// /gc ${replyingTo ? `${username} replying to ${replyingTo}:` : `${username}:`} ${message}