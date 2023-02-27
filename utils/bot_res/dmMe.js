import { MessageEmbed } from 'discord.js'
import { SapDiscClient } from '#main'

/**
 * @module dmMe
 * DMs myself a message from the bot, utilized for moving debugging embeds to go directly to me
 */

export default async function dmMe(message, embed) {
	const userid = process.env.botDevID
	await SapDiscClient.users.fetch(`${userid}`).then((user) => {
		if (embed) {
			user.send({ embeds: [embed] })
		} else {
			// # compile embed
			const formatEmb = new MessageEmbed()
				.setTitle(`Notification`)
				.setDescription(message)
				.setColor(`#8080ff`)
			user.send({ embeds: [formatEmb] })
		}
	})
}
