import { Log } from '#LogColor'
import { TodaysDate } from '#cmdUtil/TodaysDate'
import { container } from '#config'
import { db } from '#db'
import { embedReply } from '#embed'
import { setupBetLog } from '#winstonLogger'

/**
 * @module addNewBet -
 * Adds a new bet to the database with the provided information inside of the betslip object.⁡
 * ⁡⁣⁣⁢Queries the '"NBAactivematchups"' table in the DB to gather the matchup ID using the provided team IDs⁡
 * @param {obj} message - The message object - contains the user info from Discord & allows us to reply to the user.
 * @param {obj} betslip - Object containing the user's bet information. The betslip object model is inherited from: placebet.js (command) > confirmbet.js (user confirms bet).
 * @returns {embed} - Resolves with an embed reply to the user that their bet has been placed.
 *  For documentation / debugging purposes, the object's final structure is compiled as: { userid: '⁡⁣⁣⁢𝙣⁡',  teamid: '⁡⁣⁣⁢𝘯⁡', betid: '⁡⁣⁣⁢𝘯⁡', amount: '⁡⁣⁣⁢𝘯⁡', matchid: '⁡⁣⁣⁢𝙣⁡'  'hasactivebet': '⁡⁣⁣⁢𝙣⁡', 'dateofbet': '⁡⁣⁣⁢𝙣⁡' }
 * @references
 * - {@link confirmBet.js} Origin call of addNewBet.js.
 * - {@link embedReply} - Embed constructor for the reply.
 *
 */

export function addNewBet(message, betslip, interactionEph) {
	//Log.Red(`INTERACTION: ${interactionEph}`)
	/*
    Querying DB using db.tx since we are handling multiple transactions
    First query: Selecting the 'matchid' as its required for us to store the betslip information in the DB.
    */
	db.tx('createNewBet', (t) => {
		return t
			.one(
				`SELECT matchid from "NBAactivematchups" WHERE teamone = $1 OR teamtwo = $1`,
				/**@property {Object} betslip.teamid - The team name the user has input */
				[betslip.teamid],
			)
			.then((data) => {
				console.log(data)
				console.log(betslip)
				console.log(`--`)
				container.temp_matchId = data.matchid
				return t.none(
					`INSERT INTO "NBAbetslips" (userid, teamid, betid, amount, matchid, dateofbet, betresult) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
					[
						betslip.userid,
						betslip.teamid,
						betslip.betid,
						betslip.amount,
						data.matchid,
						TodaysDate(),
						'pending',
					], //? Insert betslip information into the database
				)
			})
			.then((data) => {
				setupBetLog.info(
					`Storing betslip into database - "NBAactivebets"\nData: ${data}\nBetslip: ${betslip}`,
				)
				return t.none(
					`INSERT INTO "NBAactivebets" (betid, userid, teamid, matchid, amount, dateofbet) VALUES ($1, $2, $3, $4, $5, $6)`,
					[
						betslip.betid,
						betslip.userid,
						betslip.teamid,
						container.temp_matchId,
						betslip.amount,
						TodaysDate(),
					], //? Insert betslip information into the database
				)
			})
			.then(() => {
				var isSilent = interactionEph ? true : false
				setupBetLog.info(`Successfully added betslip into the database.`)
				var embedcontent = {
					//? Compiling the properties of the embed to return to the user: confirming their bet has been added to DB
					title: `Bet #${betslip.betid} Slip Confirmed`,
					description: `Congratulations <@${betslip.userid}>! Your bet has been placed! You may view all of your active bets by typing: \`/mybets\`\n\n**__Betslip Details__**\n**Bet ID:** ${betslip.betid}\n**Team:** ${betslip.teamid}\n**Amount:** $${betslip.amount}`,
					color: '#00FF00',
					//footer: 'For more commands, type: ?help',
					silent: isSilent,
					target: `reply`,
				}
				if (isSilent === true) {
					return embedReply(message, embedcontent, true)
				} else {
					return embedReply(message, embedcontent) //? Sending the embed to the user via our embedReply function in [embedReply.js]
				}
			})
			.catch((err) => {
				Log.Error(
					`[addNewBet.js] Error adding bet to "NBAactivebets" table\n${err}`,
				)
				setupBetLog.error(`Error adding bet to "NBAactivebets" table\n${err}`)
				return
			})
	})
}
