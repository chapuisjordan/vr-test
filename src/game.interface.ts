export interface IDataGameObject {
    player: string;
    state: string;
    cardValue: string;
    suit: string;
}

export interface ITeamsGameObject {
    teamA: {players: string};
    teamB: {players: string};
}

export interface IGameObject {
    id: string;
    trump: string;
    data: IDataGameObject[];
    teams: ITeamsGameObject;
}

export interface IGameSaveItem {
    index: { N: string};
    teamB: { S: string};
    teamA: { S: string};
    pointsTeamB: { N: string};
    pointsTeamA: { N: string};
    id: { S: string};
}

export interface IGameSave {
    Item: IGameSaveItem;
