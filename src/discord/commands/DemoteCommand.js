const DiscordCommand = require('../../contracts/DiscordCommand')

class DemoteCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'demote'
    this.aliases = ['down', 'd']
    this.description = 'Rebaixa o jogador selecionado em uma posição na guilda'
  }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()

    this.sendMinecraftMessage(`/g demote ${user ? user : ''}`)
  }
}

module.exports = DemoteCommand
