# Virtual Regatta technical test

You will build an amazing card game inspired by the Bridge but with simplified rules. You will have to build the code to detect game winners.

You are free to use any language and framework but you must be compliant to AWS. You must provide everything to build, start and deploy your project.

We advise you to use technologies you're familiar with and also to start making simple functions and if you have the time, create a serverless app to host that in AWS (you may want to use [serverless](https://www.serverless.com/framework) or [architect](https://arc.codes/docs/en/get-started/quickstart) which are very simple to use and learn).

This test is pretty difficult, we won't judge if you finished the test but what you did and how you did it. We suggest you to work 4 hours on it, don't go over.

## The rules

- This is a 4 players game of 2 opposing teams.
- Team players sit opposite each other in a North-South vs East-West configuration.
- A trump colour is chosen for each game randomly.
- The dealer randomly deals out 52 cards to the 4 players (so 13 each).
- The game starts by the north player (designated randomly), other game starts by the players who has scored the most points in the previous game.
- Each player takes it in turn to play, which forms a trick (4 cards played).
- Players must follow suit (i.e. play the same suit as the first card played for that trick).
- Players do not need to trump if they cannot follow suit and can play another non trump suit which will always be considered lower than the cards played in the leading suit.
- The player who played for most valuable card in the current trick wins.
- The winner starts the following trick.
- Ace is higher than King > Queen > Jack > 10 > ... > 2.
- Trump cards are higher than other suits but follow the same order Ace > ... > 2.
- Each trick gives points to the winning team depending of the played cards ; Ace gives 13 points, King 12 points ... 2 gives 1 point, the point of a trump card give the double of points, the first played card of each trick don't give points.

## The test

You are working on one ticket, here its content : you have to create a http handler `on-game-finished` method `POST`, it have to parse a game string sent by the frontend app, detect the winner of each trick and then returns the result.

Feel free to add anything you want, for example : saving games and results in database.

After you achieved the test, tell us anything you consider wrong in that document.


## Formats

### Card

- Let a "card" be a 2 character string.
- Example: `AH` is Ace of Hearts.
- Suits are Spades, Hearts, Diamonds, Clubs => respectively S, H, D, C.
- And values range from 2 to Ace => 2...9, T (Ten/10), J (Jack), Q (Queen), K (King) and A (Ace).

### State

- Let the current state of a game be represented by a string of cards played and separated by `-`.
- Example: `AS-KS-QS-TS-KH-AH-QH-TH-KC-QC-AC-TC-AD-KD-QD`.
- Each trick consists of 4 cards played.
- The trick is won by the highest trump card or in the absence of trumps the highest card that followed suit.
- A state can be incomplete, an incomplete trick is considered as null and is not calculated.

### Game

- Let a game be a string composed of `${trump}#${state}#${players}`.
- Example : `S#AS-KS-QS-TS#Marie,Fred,Clément,Bastien`.
- `trump`: is a suit ; example : `S`.
- `state`: is the current game state.
- `players`: is the current players separated by `,`, ordered as : north, east, south and the last south ; in the example above, Marie (north) and Clément (south) are in the same team opposed by Fred (east) and Bastien (west).

### Result

- Let the result be `${points}#${players}`.
- Example: `42-13#Marie,Clément#Bastien,Fred`.
- `points`: the number of points won by the winning team separated by `-` to the points won by the losing team.
- `players`: must be the team player ordered by the points won by the player, each team player are separated by `,`, each team are separated by `-`, in case of equality you must respect North-South and East-West order.

