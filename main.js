/**
 * A program to generate team pairings for a game that faces off two tables of
 * two versus two. Each player gets matched with every other player once. 
 * Intended to run for 8 players.
 */

/**
 * Utility class to wrap the results of a team configuration
 */
class PossibleTeam {
  /**
  * @param {boolean} possible - Denotes if it was possible to create a valid team configuration
  * @param {Pairing[]} teamConfig - this.configuration is the team configuration
  * if it was possible to create a valid configuration. Otherwise, it is an
  * empty array.
  */
  constructor(possible, teamConfig) {
    this.possible = possible;
    this.configuration = teamConfig;
  }
}

class Pairing {
  constructor(p1, p2) {
    if (!p1 || !p2 || p1 === p2) {
      throw new Error('A pairing must include two unique players.')
    }
    this.value = [p1, p2];
  }

  /**
   * @param {Pairing} otherPairing - compares this {Pairing} with a target {Pairing}
   * @return {boolean} - Returns true if this {Pairing} has the same players
   * as the target {Pairing} regardless of order.
   * returns false if pairings contain different players.
   */
  equals(otherPairing) {
    return _.isEmpty(_.xor(this.value, otherPairing.value));
  }
}

class TeamConfigurations {
  /**
   * @param {string[]} players - an array of strings that represent player ids / unique names
   */
  constructor(players) {
    if (_.unique(players).length !== players.length) {
      throw new Error('Player identifiers must be unique');
    }

    if (players.length !== 8) {
      throw new Error(`8 players needed. You provided ${players.length}.`)
    }

    this.teams = [];
    this.players = players;

    // this.memo is used for recording pairs that have been matched not only
    // for the current team being constructed, but for past teams as well
    this.memo = new Array(players.length);
    for (let i = 0; i < players.length; ++i) {
      this.memo[i] = new Array(players.length);
      this.memo[i].fill(0);
    }
  }

  createTeams() {
    while (!this._allTeamsGenerated()) {
      let possibleTeam = this._createTeam([], this.players);
      if (possibleTeam.possible) {
        this.teams.push(possibleTeam.configuration);
        this._updateMemo(possibleTeam.configuration);
      }
    }

    return this.teams;
  }

  printMatchUps() {
    for (let m = 0; m < this.teams.length; ++m) {
      console.log(`Round ${m+1}`);
      let msg = `
        Table 1: ${this.teams[m][0].value.join(' and ')} vs ${this.teams[m][1].value.join(' and ')}.
        Table 2: ${this.teams[m][2].value.join(' and ')} vs ${this.teams[m][3].value.join(' and ')}.
      `;
      console.log(msg);
    }
  }

  /**
   * Updates the memo to include all the pairings of the valid team
   */
  _updateMemo(validTeam) {
    for (let pairIdx = 0; pairIdx < validTeam.length; ++pairIdx) {
      let p1Idx = this.players.indexOf(validTeam[pairIdx].value[0]);
      let p2Idx = this.players.indexOf(validTeam[pairIdx].value[1]);
      this.memo[p1Idx][p2Idx] = 1;
      this.memo[p2Idx][p1Idx] = 1;
    }
  }

  /**
   * @return {boolean} - whether or not all teams have been generated
   */
  _allTeamsGenerated() {
    for (let memoY = 0; memoY < this.memo.length; memoY++) {
      if (this.memo[memoY].reduce((a,b) => a+b, 0) !== this.players.length - 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a new {PossibleTeam}
   * @param {Pairing[]} - an intermediate team result
   * @param {string[]} - an array of available players to pick from
   * @return {PossibleTeam}
   */
  _createTeam(team, choices) {
    let lastPairing = _.last(team);
    let [memoIdx1, memoIdx2] = lastPairing ?
      [this.players.indexOf(lastPairing.value[0]),
      this.players.indexOf(lastPairing.value[1])] : [-1, -1];
    if (lastPairing && this.memo[memoIdx1][memoIdx2]) {
      // the last pairing is a repeat pairing
      return new PossibleTeam(false, []);
    }

    if (choices.length === 0) {
      return new PossibleTeam(true, team);
    }

    // at each loop, choose two of the choices and test the choice.
    for (let player1Idx = 0; player1Idx < choices.length - 1; ++player1Idx) {
      for (let player2Idx = player1Idx + 1; player2Idx < choices.length; ++player2Idx) {
        let newTeam = team.slice().concat([new Pairing(choices[player1Idx], choices[player2Idx])]);
        let newChoices = _.without(choices, choices[player1Idx], choices[player2Idx]);
        let possibleTeam = this._createTeam(newTeam, newChoices);
        if (possibleTeam.possible) {
          return possibleTeam;
        } else {
          continue;
        }
      }
    }
    return new PossibleTeam(false, []);
  }
}

let tc1 = new TeamConfigurations(['1', '2', '3', '4', '5', '6', '7', '8']);
tc1.createTeams();
tc1.printMatchUps();

let tc2 = new TeamConfigurations(['Alice', 'Bob', 'Charlie', 'Daniel', 'Ellie', 'Frank', 'George', 'Helga']);
tc2.createTeams();
tc2.printMatchUps();
