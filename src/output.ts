import { Handler } from 'aws-lambda';
import { createRedisClient } from './database/config';
import dotenv from 'dotenv'
dotenv.config();

export const saveInput: Handler = async (event, context) => {
  try {
    const idInput = event.pathParameters.id
    let valueObject = null
    let redisClient = createRedisClient()

    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();

    if (!idInput) {
      valueObject = { message: "Set idInput LCR Parameter" }
    } else {
      const value: string | null = await redisClient.get(idInput);
      await redisClient.disconnect();
      if (value) {
        valueObject = []
        const newRound = (JSON.parse(value))
        const gameKeys:GameInt|any = {};
        for (let i = 0; i < newRound.length; i++) {
          const ronda = newRound[i];
          const round = ronda.split(' ')
          const numPlayers = parseInt(round[0])
          const results = round[1]

          if (numPlayers === 0 && !results) {
            break
          }

          if (numPlayers >= 3 && numPlayers <= 10) {        
            const game = new GameLCR(numPlayers)
            const result = game.playLCRRound(results.split(''))
            const gameKey = `game ${i + 1}`;
            gameKeys[gameKey] = result;
          }
        }
        valueObject = gameKeys
      } else {
        valueObject = "Key not found"
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(valueObject)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};



class Player {
  name: string;
  chips: number;
  state: string;

  constructor(name: string, chips: number) {
    this.name = name;
    this.chips = chips;
    this.state = '';
  }

  giveChip(): boolean {
    this.chips--;
    return true;
  }

  receiveChip(): void {
    this.chips++;
  }

  setStatePlayer(text: string): void {
    this.state = text;
  }
}
interface GameInt {
  playersState: Array<{
    name: string;
    chips: number;
    state: string;
  }>;
  center: number;
}

class GameLCR {
  output: Player[];
  mesa: number;

  constructor(players: number) {
    this.output = [];
    for (let i = 0; i < players; i++) {
      this.output.push(new Player(`Player ${i + 1}`, 3));
    }
    this.mesa = 0;
  }

  receiveChip(): void {
    this.mesa++;
  }

  getNextPlayer(currentPlayer: Player, direction: string): Player {
    const currentIndex = this.output.indexOf(currentPlayer);

    let increment = direction === "left" ? -1 : 1;
    const nextIndex = (currentIndex - increment + this.output.length) % this.output.length;

    return this.output[nextIndex];
  }

  playLCRRound(results: string[]): { playersState: Player[], center: number } {
    let copyResults = results.slice()
    let index = 0
    for (let i = 0; i < copyResults.length; i = i + 3) {

      const lastPlayer = this.output[(index - 1) % this.output.length];
      const nextPlayer = this.output[(index + 1) % this.output.length];
      if (lastPlayer) {
        lastPlayer.setStatePlayer('')
      }

      const currentPlayer = this.output[index % this.output.length];

      currentPlayer.setStatePlayer('*')

      const valRolls = results.splice(0, currentPlayer.chips >= 3 ? 3 : currentPlayer.chips)

      for (let j = 0; j < valRolls.length; j++) {
        const oneDiceVal = valRolls[j];
        if (oneDiceVal === "L") {
          const nextPlayer = this.getNextPlayer(currentPlayer, "left");

          if (currentPlayer.giveChip()) {
            nextPlayer.receiveChip();
          }
        } else if (oneDiceVal === "C") {
          if (currentPlayer.giveChip()) {
            this.receiveChip();
          }
        } else if (oneDiceVal === "R") {
          const nextPlayer = this.getNextPlayer(currentPlayer, "right");
          if (currentPlayer.giveChip()) {
            nextPlayer.receiveChip();
          }
        } else if (oneDiceVal === ".") {
          //DO nothing
        }
      }
      index++
      if ((currentPlayer.chips + this.mesa) === this.output.length * 3) {
        currentPlayer.setStatePlayer('w')
        break
      }
      else if (lastPlayer && (lastPlayer.chips + this.mesa) === this.output.length * 3) {
        lastPlayer.setStatePlayer('w')
        break
      }
      else if ((nextPlayer.chips + this.mesa) === this.output.length * 3) {
        currentPlayer.setStatePlayer('')
        nextPlayer.setStatePlayer('w')
        break
      }

    }
    return { playersState: this.output, center: this.mesa }
  }
}



