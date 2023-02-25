import { formatISO, isAfter, parseISO } from 'date-fns'

import { db } from '#db'
import { LIVEMATCHUPS } from '#config'

/**
 * @module gameActive
 * 1. Query DB to locate the matchup via the name of one of the teams, and the matchup ID.
 * 2. Check the time of the game, and compare it to the current time.
 * 3. If the game has already started, return true. Otherwise, return false
 * @param {string} teamid - The team name to search for in the DB
 * @param {integer} matchupId - The matchup ID to search for in the DB
 * @returns {boolean} - True if the game has already started, false if it has not.
 */

export async function gameActive(teamName, matchupId) {
	const searchForActive = await db
		.oneOrNone(
			`SELECT * FROM "${LIVEMATCHUPS}" WHERE "teamone" = $1 OR "teamtwo" = $1 AND "matchid" = $2 OR "teamone" = $1 OR "teamtwo" = $1`,
			[teamName, matchupId],
		)
		.then((dbMatchup) => {
			const gameStart = dbMatchup.startTime
			const today = new Date()
			const gameTimeIso = parseISO(gameStart)
			const todayISO = formatISO(today, { representation: 'complete' })
			const todayParsed = parseISO(todayISO)
			const startedOrNot = isAfter(todayParsed, gameTimeIso)
			if (startedOrNot) {
				return true
			}
			return false
		})
	return searchForActive
}
