import { isNaN } from 'lodash'

/**
 * Calculates payout and profit based on match odds and bet amount.
 * Converts the odds to decimal format for calculation.
 *
 * @param {string|number} matchOdds - The odds of the match. Can be negative or positive.
 * @param {string|number} betAmount - The amount of the bet.
 * @return {Object} `{ payout: number, profit: number}`
 * @throws {Error} Throws an error if inputs are invalid or odds are zero.
 */
export async function resolvePayouts(matchOdds, betAmount) {
	const oddsNum = Number(matchOdds)
	const ogBetAmount = Number(betAmount)

	// Validate inputs
	if (
		isNaN(oddsNum) ||
		isNaN(ogBetAmount) ||
		oddsNum === 0
	) {
		throw new Error('Invalid match odds or bet amount')
	}

	let decimalOdds

	if (oddsNum > 0) {
		decimalOdds = oddsNum / 100 + 1
	} else {
		decimalOdds = 1 - 100 / oddsNum
	}

	const payout = parseFloat(
		(ogBetAmount * decimalOdds).toFixed(2),
	)
	const profit = parseFloat(
		(payout - ogBetAmount).toFixed(2),
	)

	return { payout, profit }
}
