import { formatISO, isAfter, parseISO } from 'date-fns'

import { NFL_ACTIVEMATCHUPS } from '#config'
import { db } from '#db'

/**
 * @module gameActive.js
 * 1. Query DB to locate the matchup via the name of one of the teams, and the matchup ID.
 * 2. Check the time of the game, and compare it to the current time.
 * 3. If the game has already started, return true. Otherwise, return false
 * @param {string} teamid - The team name to search for in the DB
 * @param {integer} matchupId - The matchup ID to search for in the DB
 * @returns {boolean} - True if the game has already started, false if it has not.
 */

export async function gameActive(teamName, matchupId) {
	var searchForActive = await db
		.oneOrNone(
			`SELECT * FROM "${NFL_ACTIVEMATCHUPS}" WHERE "teamone" = $1 OR "teamtwo" = $1 AND "matchid" = $2 OR "teamone" = $1 OR "teamtwo" = $1`,
			[teamName, matchupId],
		)
		.then((dbMatchup) => {
			// console.log(dbMatchup)
			var gameStart = dbMatchup.startTime
			var today = new Date()
			var gameTimeIso = parseISO(gameStart)
			//gameTimeIso = formatISO(gameTimeIso)
			var todayISO = formatISO(today, { representation: 'complete' })
			var todayParsed = parseISO(todayISO)
			var startedOrNot = isAfter(todayParsed, gameTimeIso)
			console.log(
				`Todays Iso formatted: ${todayISO} || Game time iso formatted: ${gameTimeIso}`,
			)
			console.log(`Started or not: ${startedOrNot}`)
			if (startedOrNot) {
				return true
			} else {
				return false
			}
		})
	return searchForActive
}
