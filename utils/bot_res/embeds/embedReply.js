import discord from 'discord.js'
import color from 'color'
import { SapDiscClient } from '@pluto-core'
import embedColors from '../../../lib/colorsConfig.js'
import { GuildManager } from '../classes/GuildManager.js'

const { EmbedBuilder } = discord

export const guildImgURL = (client) => {
	let guild
	if (client) {
		guild = client.guilds.cache.first() // get the first guild in the cache
	}
	if (!client) {
		// Fetch guild info based on server id
		const serverId = process.env.server_ID
		guild = SapDiscClient.guilds.cache.get(serverId)
	}
	if (!guild) {
		return null // no guild found
	}
	const iconURL = guild.iconURL({ dynamic: true }) // get the guild's icon URL
	return iconURL
}

export function convertColor(colorCode) {
	if (colorCode.toString().includes('#')) {
		return color(colorCode).rgbNumber()
	}
	return colorCode
}

/**
 * @module embedReply
 * @description Constructor function for creating & sending embeds
 * @param {message} interaction The message object that was sent.
 * @param {embedContent} embedContent Object supplied to be converted into an embed.
 * Example model of a `embedContent`:
 *
 * ```embedContent = { title: '', description: '', color: '', footer: '', fields: [ { name: '', value: '', inline: '' }, etc. ] }```
 * @returns {embed} embedWithFields or noFieldsEmbed - self-descriptive returns.
 */

export async function embedReply(
	interaction,
	embedContent,
	interactionEph,
) {
	const guildMngr = await new GuildManager(
		interaction.guild,
	)
	const embedColor =
		convertColor(embedContent.color) ||
		embedColors.PlutoYellow
	const embedTitle = embedContent?.title ?? null
	const embedDescription =
		embedContent?.description ?? null
	const embedFields = embedContent?.fields
	const embedFooter =
		embedContent?.footer ??
		`Pluto | Dev. by fenixforever`
	const hasFields = embedFields ?? false
	const confirmFields = !!hasFields
	const target = embedContent?.target || 'reply'
	const isSilent = embedContent?.silent || false
	const isDeferred = interaction?.deferred || false
	const isFollowUp = !!isDeferred // Holds boolean of whether or not the interaction is a follow-up based on isDeferred
	let followUp =
		embedContent?.followUp || isFollowUp || false
	const editReply = embedContent?.editReply || false
	const thumbnail =
		embedContent?.thumbnail ||
		guildImgURL(interaction?.client)
	let reqChan
	if (
		interaction &&
		interaction?.deferred &&
		interaction?.deferred === true
	) {
		followUp = true
	}

	// # Embed with no fields response
	if (!confirmFields) {
		const noFieldsEmbed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(embedTitle)
			.setThumbnail(thumbnail)
			.setDescription(embedDescription)
			.setFooter({ text: embedFooter })
		if (target === 'reply' && isSilent === true) {
			if (followUp) {
				return interaction.followUp({
					embeds: [noFieldsEmbed],
					ephemeral: true,
				})
			}
			return interaction.reply({
				embeds: [noFieldsEmbed],
				ephemeral: true,
			})
		}
		if (target === 'reply' && isSilent === false) {
			if (editReply) {
				return interaction.editReply({
					embeds: [noFieldsEmbed],
				})
			}
			if (followUp) {
				return interaction.followUp({
					embeds: [noFieldsEmbed],
				})
			}
			return interaction.reply({
				embeds: [noFieldsEmbed],
			})
		}
		// # Fields-Embed Destination to a specific channel
		if (target !== 'reply') {
			reqChan = await Promise.resolve(
				guildMngr.fetchChannelViaId(target),
			)
			return reqChan.send({ embeds: [noFieldsEmbed] })
		}
	}

	// # Embeds with fields response
	if (hasFields !== false) {
		const embedWithFields = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(embedTitle)
			// .setThumbnail(thumbnail)
			.setDescription(embedDescription)
			.addFields(...embedContent.fields)
			.setFooter({ text: embedFooter })
		if (
			(target === 'reply' &&
				interactionEph === true) ||
			(target === 'reply' && isSilent === true)
		) {
			// # switch .reply to .followUp if the followUp prop is true [deferred replies from slash commands]
			if (followUp === true) {
				return interaction.followUp({
					embeds: [embedWithFields],
					ephemeral: true,
				})
			}
			await interaction.reply({
				embeds: [embedWithFields],
				ephemeral: true,
			})
		} else if (target === 'reply' && !interactionEph) {
			return interaction.reply({
				embeds: [embedWithFields],
			})

			// # Non-Field Embed Destination to a specific channel
		} else if (target !== 'reply') {
			if (isSilent === false) {
				reqChan = await Promise.resolve(
					guildMngr.fetchChannelViaId(target),
				)
				return reqChan.send({
					embeds: [embedWithFields],
				})
			}
			if (isSilent) {
				return reqChan.send({
					embeds: [embedWithFields],
					ephemeral: true,
				})
			}
		}
	}
}

export async function sendErrorEmbed(
	interaction,
	str,
	replyType,
) {
	const errorEmb = new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle('🚩 Error')
		.setDescription(str)
		.setFooter({ text: `Pluto | Dev. by fenixforever` })
		.setTimestamp()
	if (replyType === 1) {
		return interaction.editReply({
			content: ``,
			embeds: [errorEmb],
			components: [],
		})
	}
	if (replyType === 2) {
		return interaction.followUp({
			content: ``,
			embeds: [errorEmb],
			components: [],
		})
	}
	if (replyType === 3) {
		return interaction.reply({
			content: ``,
			embeds: [errorEmb],
			components: [],
		})
	}
	return interaction.followUp({
		content: ``,
		embeds: [errorEmb],
		components: [],
	})
}

export async function QuickError(
	message,
	text,
	interactionEph,
) {
	const embed = new EmbedBuilder()
		.setColor('#ff0000')
		.setTitle(':triangular_flag_on_post: Error')
		.setDescription(text)
		.setFooter({ text: 'Pluto | Dev. by fenixforever' })
	if (message?.deferred === true) {
		if (interactionEph === true) {
			await message.followUp({
				embeds: [embed],
				ephemeral: true,
			})
		} else {
			await message.followUp({ embeds: [embed] })
		}
	} else {
		if (interactionEph === true) {
			message.reply({
				embeds: [embed],
				ephemeral: true,
			})
			return
		}
		if (!interactionEph) {
			message.reply({ embeds: [embed] })
			return
		}
		if (interactionEph === true) {
			message.followUp({
				embeds: [embed],
				ephemeral: true,
			})
		} else if (!interactionEph) {
			message.followUp({ embeds: [embed] })
		}
	}
}
