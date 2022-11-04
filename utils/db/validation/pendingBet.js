import { db } from '#db'

/**
 * @module pendingBet
 * Handle queries to the database regarding pending bets. Note: 'pending bets' here indicate that the user is in the process of closing a bet.
 * This is to prevent the user from fooling the system and duplicating money.
 * - Places a user into pending bets
 * - Checks if a user exists in pending bets
 */

export function pendingBet() {
    //# pending bets table is named `pendingABet`
    this.checkPending = async (userid) => {
        return db.oneOrNone(`SELECT * FROM "NBApendingABet" WHERE userid = $1`, [
            userid,
        ])
    }
    this.insertPending = async (userid) => {
        return db.none(`INSERT INTO "NBApendingABet" (userid) VALUES ($1)`, [
            userid,
        ])
    }
    this.deletePending = async (userid) => {
        return db.none(`DELETE FROM "NBApendingABet" WHERE userid = $1`, [userid])
    }
}
