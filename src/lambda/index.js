"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGameFinished = void 0;
var game_enum_1 = require("../game.enum");
var AWS = require('aws-sdk');
var region = process.env.DYNAMODB_REGION;
var accessKeyId = process.env.DYNAMODB_ACCESS_KEY_ID;
var secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY;
var tableName = process.env.DYNAMODB_TABLE_NAME;
var dynamoDB = new AWS.DynamoDB({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
});
var onGameFinished = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var result, body, stateOrder, statePoint, _a, game, id, data, trump, state, player, states, players, getGame, object, _b, suitArray, notSuitArray, suitArraySort, notSuitArraySort, trickOrder, points, winner, winnerTeam, index, newIndex, pointsTeamA, pointsTeamB, total, total;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                body = event.body;
                stateOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
                statePoint = { 'A': 13, 'K': 12, 'Q': 11, 'J': 10, 'T': 9, '9': 8, '8': 7, '7': 6, '6': 5, '5': 4, '4': 3, '3': 2, '2': 1 };
                _a = JSON.parse(body), game = _a.game, id = _a.id;
                data = game.split('#');
                trump = data[0];
                state = data[1];
                player = data[2];
                states = state.split('-');
                players = player.split(',');
                return [4 /*yield*/, getItem(id)];
            case 1:
                getGame = _c.sent();
                if (states.length != 4)
                    throw new Error("State not complete");
                object = createGameObject(trump, states, players, id);
                if (getGame.Item) {
                    object.teams[game_enum_1.EGameTeams.TEAM_A].players = getGame.Item[game_enum_1.EGameTeams.TEAM_A].S;
                    object.teams[game_enum_1.EGameTeams.TEAM_B].players = getGame.Item[game_enum_1.EGameTeams.TEAM_B].S;
                    if (getGame.Item.index.N === '13') {
                        throw new Error("Game is finish");
                    }
                }
                _b = partition(object.data, function (el) { return el.suit === object.trump; }), suitArray = _b[0], notSuitArray = _b[1];
                suitArraySort = sortByCardValue(suitArray, stateOrder);
                notSuitArraySort = sortByCardValue(notSuitArray, stateOrder);
                trickOrder = suitArraySort.concat(notSuitArraySort);
                points = calculPoints(object, statePoint);
                winner = trickOrder[0];
                winnerTeam = findWinnerTeam(winner.player, object);
                if (!!getGame.Item) return [3 /*break*/, 6];
                if (!(winnerTeam === game_enum_1.EGameTeams.TEAM_A)) return [3 /*break*/, 3];
                result = "".concat(points.toString(), "-0#").concat(object.teams.teamA.players, "#").concat(object.teams.teamB.players);
                return [4 /*yield*/, saveTrick(id, object, points.toString(), '0', '1')];
            case 2:
                _c.sent();
                return [3 /*break*/, 5];
            case 3:
                result = "0-".concat(points.toString(), "#").concat(object.teams.teamB.players, "#").concat(object.teams.teamA.players);
                return [4 /*yield*/, saveTrick(id, object, '0', points.toString(), '1')];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5: return [3 /*break*/, 10];
            case 6:
                index = getGame.Item.index.N;
                newIndex = parseInt(index) + 1;
                pointsTeamA = getGame.Item[game_enum_1.EGamePoints.POINTS_TEAM_A].N;
                pointsTeamB = getGame.Item[game_enum_1.EGamePoints.POINTS_TEAM_B].N;
                if (!(winnerTeam === game_enum_1.EGameTeams.TEAM_A)) return [3 /*break*/, 8];
                total = +pointsTeamA + points;
                result = "".concat(total, "-").concat(pointsTeamB, "#").concat(object.teams.teamA.players, "#").concat(object.teams.teamB.players);
                return [4 /*yield*/, saveTrick(id, object, total.toString(), pointsTeamB, newIndex.toString())];
            case 7:
                _c.sent();
                return [3 /*break*/, 10];
            case 8:
                total = +pointsTeamB + points;
                result = "".concat(total, "-").concat(pointsTeamA, "#").concat(object.teams.teamB.players, "#").concat(object.teams.teamA.players);
                return [4 /*yield*/, saveTrick(id, object, pointsTeamA, total.toString(), newIndex.toString())];
            case 9:
                _c.sent();
                _c.label = 10;
            case 10: return [2 /*return*/, {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: result,
                        input: event,
                    }, null, 2),
                }];
        }
    });
}); };
exports.onGameFinished = onGameFinished;
function saveTrick(id, data, pointsTeamA, pointsTeamB, index) {
    return __awaiter(this, void 0, void 0, function () {
        var params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
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
                    return [4 /*yield*/, dynamoDB.putItem(params).promise()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getItem(id) {
    return __awaiter(this, void 0, void 0, function () {
        var params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        Key: {
                            id: {
                                S: id
                            }
                        },
                        TableName: tableName
                    };
                    return [4 /*yield*/, dynamoDB.getItem(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function findWinnerTeam(winner, teams) {
    return teams.teams.teamA.players.includes(winner) ? game_enum_1.EGameTeams.TEAM_A : game_enum_1.EGameTeams.TEAM_B;
}
function calculPoints(data, statePoint) {
    var points = 0;
    for (var i = 1; i < data.data.length; i++) {
        var element = data.data[i];
        points += element.suit === data.trump ? statePoint[element.cardValue] * 2 : statePoint[element.cardValue];
    }
    return points;
}
function sortByCardValue(data, stateOrder) {
    console.log('DATA : ', data);
    return data.sort(function (a, b) {
        var aState = stateOrder.indexOf(a.cardValue);
        var bState = stateOrder.indexOf(b.cardValue);
        return aState - bState;
    });
}
function partition(array, callback) {
    var matches = [];
    var nonMatches = [];
    array.forEach(function (element) { return (callback(element) ? matches : nonMatches).push(element); });
    return [matches, nonMatches];
}
function getCharAt(state, index) {
    return state.charAt(index);
}
function createGameObject(trump, states, players, id) {
    return {
        id: id,
        trump: trump,
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
                players: [players[0], players[2]].join(","),
            },
            teamB: {
                players: [players[1], players[3]].join(","),
            }
        }
    };
}
