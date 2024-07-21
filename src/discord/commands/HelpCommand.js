const DiscordCommand = require('../../contracts/DiscordCommand')

const { version } = require('../../../package.json')

class HelpCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'help'
    this.aliases = ['h', 'info']
    this.description = 'Mostra esse menu de ajuda'
  }

  onCommand(message) {
    let discordCommands = []
    let minecraftCommands = []

    this.discord.messageHandler.command.commands.forEach(command => {
      discordCommands.push(`\`${command.name}\`: ${command.description}`)
    })

    this.discord.app.minecraft.chatHandler.command.commands.forEach(command => {
      minecraftCommands.push(`\`${command.name}\`: ${command.description}`)
    })

    message.channel.send({
      embed: {
        title: 'Ajuda',
        description: ['`< >` = Argumentos obrigatórios', '`[ ]` = Argumentos opcionais'].join('\n'),
        fields: [
          {
            name: 'Comandos do Discord',
            value: discordCommands.join('\n')
          },
          {
            name: 'Comandos do Minecraft',
            value: minecraftCommands.join('\n')
          },
          {
            name: `Informações`,
            value: [
              `Prefixo: \`${this.discord.app.config.discord.prefix}\``,
              `Canal da guilda: <#${this.discord.app.config.discord.channel}>`,
              `Cargo de comando: <@&${this.discord.app.config.discord.commandRole}>`,
              `Versão: \`${version}\``,
            ].join('\n'),
          }
        ],
        color: message.guild.me.displayHexColor,
        footer: {
          text: 'Criado por Senither e neyoa.'
        },
        timestamp: new Date()
      }
    }).then(helpMessage => {
      helpMessage.delete({ timeout: 30000 })
    })
  }
}

module.exports = HelpCommand
