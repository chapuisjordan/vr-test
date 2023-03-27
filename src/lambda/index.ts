import { EGamePoints, EGameTeams } from "../game.enum";
import { IDataGameObject, IGameObject, IGameSave } from "../game.interface"
let AWS = require('aws-sdk');

const region = process.env.DYNAMODB_REGION;
const accessKeyId = process.env.DYNAMODB_ACCESS_KEY_ID;
const secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY;
const tableName =  process.env.DYNAMODB_TABLE_NAME;
const dynamoDB = new AWS.DynamoDB({
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});

export const onGameFinished = async (event) => {
  let result: string;
  const { body } = event;
  const stateOrder: string[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
  const statePoint = {'A': 13, 'K': 12, 'Q': 11, 'J': 10, 'T': 9, '9': 8, '8': 7, '7': 6, '6': 5, '5': 4, '4': 3, '3': 2, '2': 1};
  
  const { game, id } = JSON.parse(body);
  const data = game.split('#');
  const trump: string = data[0];
  const state: string = data[1];
  const player: string = data[2];
  const states: string[] = state.split('-');
  const players: string[] = player.split(',');

  const getGame: IGameSave = await getItem(id);

  if (states.length != 4) throw new Error("State not complete");
  
  let object: IGameObject = createGameObject(trump, states, players, id);

  if(getGame.Item) {
    object.teams[EGameTeams.TEAM_A].players = getGame.Item[EGameTeams.TEAM_A].S;
    object.teams[EGameTeams.TEAM_B].players = getGame.Item[EGameTeams.TEAM_B].S;
    if (getGame.Item.index.N === '13') {
      throw new Error("Game is finish");
    }
  }

  // Have the cards in order from strongest to weakest
  const [suitArray, notSuitArray] = partition(object.data, (el: any) => el.suit === object.trump);
  const suitArraySort = sortByCardValue(suitArray, stateOrder);
  const notSuitArraySort = sortByCardValue(notSuitArray, stateOrder);
  const trickOrder = suitArraySort.concat(notSuitArraySort);
  
  const points: number = calculPoints(object, statePoint);
  const winner = trickOrder[0];
  const winnerTeam = findWinnerTeam(winner.player, object);

  if(!getGame.Item) {
    if(winnerTeam === EGameTeams.TEAM_A) {
      result = `${points.toString()}-0#${object.teams.teamA.players}#${object.teams.teamB.players}`;
      await saveTrick(id, object, points.toString(), '0', '1');
    }else {
      result = `0-${points.toString()}#${object.teams.teamB.players}#${object.teams.teamA.players}`;
      await saveTrick(id, object, '0', points.toString(), '1');
    }
  }else {
    const index = getGame.Item.index.N;
    const newIndex = parseInt(index) + 1;
    const pointsTeamA = getGame.Item[EGamePoints.POINTS_TEAM_A].N;
    const pointsTeamB = getGame.Item[EGamePoints.POINTS_TEAM_B].N;
    if(winnerTeam === EGameTeams.TEAM_A) {
      const total: number = +pointsTeamA + points;
      result = `${total}-${pointsTeamB}#${object.teams.teamA.players}#${object.teams.teamB.players}`;
      await saveTrick(id, object, total.toString(), pointsTeamB, newIndex.toString());
    }else {
      const total: number = +pointsTeamB + points;
      result = `${total}-${pointsTeamA}#${object.teams.teamB.players}#${object.teams.teamA.players}`;
      await saveTrick(id, object, pointsTeamA, total.toString(), newIndex.toString());
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: result,
        input: event,
      },
      null,
      2
    ),
  };
};

async function saveTrick(
    id: string, 
    data: IGameObject, 
    pointsTeamA: string, 
    pointsTeamB: string, 
    index: string
): Promise<void> {
  const params = {
    Item: {
      id: {
        S: id
      },
      teamA: {
        S: data.teams.teamA.players
      },
      teamB: {
        S: data.teams.teamB.players
      },
      pointsTeamA: {
        N: pointsTeamA
      },
      pointsTeamB: {
        N: pointsTeamB
      },
      index: {
        N: index
      }
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: tableName,
  };
  await dynamoDB.putItem(params).promise();
}

async function getItem(id: string): Promise<IGameSave> {
  var params = {
    Key: {
     id: {
       S: id
      }
    }, 
    TableName: tableName
   };
  return await dynamoDB.getItem(params).promise();
}

function findWinnerTeam(winner: string, teams: IGameObject): EGameTeams {
  return teams.teams.teamA.players.includes(winner) ? EGameTeams.TEAM_A : EGameTeams.TEAM_B;
}

function calculPoints(data: IGameObject, statePoint: any): number {
  let points = 0;
  for (let i = 1; i < data.data.length; i++) {
    const element = data.data[i];
    points += element.suit === data.trump ? statePoint[element.cardValue] * 2: statePoint[element.cardValue];
  }
  return points
}

function sortByCardValue(data: IDataGameObject[], stateOrder: string[]) {
  return data.sort((a, b) => {
    const aState = stateOrder.indexOf(a.cardValue)
    const bState = stateOrder.indexOf(b.cardValue)
    return aState - bState;
  });
}

function partition(array: IDataGameObject[], callback: Function) {
  const matches = []
  const nonMatches = []

  array.forEach(element => (callback(element) ? matches : nonMatches).push(element))
  return [matches, nonMatches]
}

function getCharAt(state: string, index: number): string {
  return state.charAt(index);
}

function createGameObject(trump: string, states: string[], players: string[], id: string): IGameObject {
  return {
    id,
    trump,
    data: [
      {
        player: players[0],
        state: states[0],
        cardValue: getCharAt(states[0], 0),
        suit: getCharAt(states[0], 1)
      },
      {
        player: players[1],
        state: states[1],
        cardValue: getCharAt(states[1], 0),
        suit: getCharAt(states[1], 1)
      },
      {
        player: players[2],
        state: states[2],
        cardValue: getCharAt(states[2], 0),
        suit: getCharAt(states[2], 1)
      },
      {
        player: players[3],
        state: states[3],
        cardValue: getCharAt(states[3], 0),
        suit: getCharAt(states[3], 1)
      },
    ],
    teams: {
      teamA: {
        players : [players[0], players[2]].join(","),
      },
      teamB: {
        players: [players[1], players[3]].join(","),
      }
    }
  }
}