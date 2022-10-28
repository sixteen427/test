import { Log, container } from '#config'

import { checkCompletedLog } from '#winstonLogger'
import { checkProgress } from '../db/matchupOps/progress/checkProgress.js'
import { closeLostBets } from '../db/betOps/closeBets/closeLostBets.js'
import { closeWonBets } from '../db/betOps/closeBets/closeWonBets.js'
import fetch from 'node-fetch'
import { getShortName } from '../bot_res/getShortName.js'
import { locateChannel } from '../db/gameSchedule/locateChannel.js'
import { queueDeleteChannel } from '../db/gameSchedule/queueDeleteChannel.js'
import { resolveToday } from '#dateUtil/resolveToday'
import { setProgress } from '../db/matchupOps/progress/setProgress.js'
import stringifyObject from 'stringify-object'

const url = NFL_SCORE
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'api.the-odds-api.com',
		// eslint-disable-next-line no-undef
		'X-RapidAPI-Key': process.env.odds_API_XKEY,
	},
}
/**
 * @module checkCompleted
 *
 * Calls the odds-api and accesses current score information.
 * Finished games have the `completed` property set to true.
 * When evaluating a matchup, we:
 * 1. Fetch the matchup information from the database to retrieve the ID matching both teams
 * 2. Evaluate the matchup and compare scores in the API to determine the winner
 * 3. Once the winner is determined, the information is sent to {@link closeWonBets} & {@link @closeLostBets} to close the bets for the matchup
 */

export async function checkCompleted(compGameMonitor) {
	container.processQueue = 0
	await checkCompletedLog.info(`Initilization API Call for completed games`)
	await fetch(url, options)
		.then((res) => res.json())
		.then(async (json) => {
			await checkCompletedLog.info(`API Connection successful`)
			var apiCompletedResult = json
			container.apiCompResult = apiCompletedResult
		})
	var compResults = container.apiCompResult
	var todayFull = await new resolveToday().todayFullSlashes
	await checkCompletedLog.info(`API Connection Information:`)
	await checkCompletedLog.info(stringifyObject(compResults))
	let skippedGames = []
	for await (let [key, value] of Object.entries(compResults)) {
		if (value.completed === true) {
			await checkCompletedLog.info(
				`Completed Game Found in API: ${value.home_team} vs ${value.away_team}`,
			)
			await Log.Green(
				`Step 1: - Completed Game Found || ${value.home_team} vs ${value.away_team}`,
			)
			//# Check if we are in the middle of processing bets
			var checkProg = await checkProgress(value.home_team, value.away_team)
			await Log.Blue(`Step 1.5: - Check Progress: ${checkProg}`)
			if (checkProg == false) {
				//# Queue game channel to be closed in 30 minutes
				var gameChan
				var hTeamShort = await getShortName(value.home_team)
				var aTeamShort = await getShortName(value.away_team)
				gameChan = `${hTeamShort}-vs-${aTeamShort}`
				try {
					gameChan = await locateChannel(gameChan)
					if (gameChan) {
						await queueDeleteChannel(gameChan)
						await Log.Green(
							`Step 3: - Game Channel Queued for Deletion || ${gameChan}`,
						)
					}
				} catch (err) {
					await checkCompletedLog.error(
						`Error occured during locate / delete game channel for ${value.home_team} vs. ${value.away_team}`,
					)
				}
				//# determine which prop is the home team's score and away team's score by matching the team name
				let hScoreProp
				let awScoreProp
				if (value.scores[0].name === value.home_team) {
					hScoreProp = value.scores[0]
					awScoreProp = value.scores[1]
				} else if (value.scores[0].name === value.away_team) {
					hScoreProp = value.scores[1]
					awScoreProp = value.scores[0]
				}

				//# determine winner based on the scores
				var homeScore = hScoreProp.score
				var awayScore = awScoreProp.score
				var winner = ''
				var homeOrAwayWon
				var losingTeam
				var losingTeamHomeOrAway
				if (Number(homeScore) > Number(awayScore)) {
					winner = value.home_team
					homeOrAwayWon = 'home'
					losingTeam = value.away_team
					losingTeamHomeOrAway = 'away'
					await checkCompletedLog.info(
						`Winner: Home Team: ${winner} - ${homeScore}`,
					)
				} else if (Number(homeScore) < Number(awayScore)) {
					winner = value.away_team
					homeOrAwayWon = 'away'
					losingTeam = value.home_team
					losingTeamHomeOrAway = 'home'
					await checkCompletedLog.info(
						`Winner: Away Team: ${winner} - ${awayScore}`,
					)
				}
				await Log.Green(`Step 4: Winner Determined || ${winner}`)
				//& Declare the matchup as being processed to prevent overlapping the process of closing bets
				await setProgress(value.home_team, value.away_team)
				await Log.Green(
					`Step 5: Progress Set to true || ${value.home_team} vs ${value.away_team}`,
				)
				//# Close the bets for the winners of the matchup
				await closeWonBets(winner, homeOrAwayWon)
				//# Close the bets for the losers of the matchup
				await closeLostBets(losingTeam, losingTeamHomeOrAway)
			} else {
				await checkCompletedLog.info(
					`Bets for Matchup: ${value.home_team} vs. ${value.away_team} are already being closed. This game will not be queued to be processed.`,
				)
				await Log.Yellow(
					`Bets for Matchup: ${value.home_team} vs. ${value.away_team} are already being closed. This game will not be queued to be processed.`,
				)
				continue
			}
		} else {
			await skippedGames.push(`${value.home_team} vs. ${value.away_team}`)
			continue
		}
	}
	await checkCompletedLog.info(`\nSkipped games:\n${skippedGames.join(`\n`)}\n`)
	await compGameMonitor.ping({
		state: 'complete',
		message: `Completed Finished Game Checks | Sent ${container.processQueue} Games to be closed`,
	})
}
