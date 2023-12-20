import { Command } from '@sapphire/framework'
import { processClaim } from '@pluto-process-claim'
import { validateUser } from '@pluto-validate/validateExistingUser.js'

export class dailyClaimSlash extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'dailyClaimSlash',
			aliases: [''],
			description:
				'💲 Claim $20 dollars every 24 hours.',
			chatInputCommand: {
				register: true,
			},
		})
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dailyclaim')
					.setDescription(this.description)
					.setDMPermission(false),
			{ idHints: [`1022940422974226432`] },
		)
	}

	async chatInputRun(interaction) {
		const userid = interaction.user.id
		const isRegistered = await validateUser(
			interaction,
			userid,
		)
		if (!isRegistered) return
		await processClaim(userid, interaction)
	}
}
