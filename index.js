let googlehome = require('google-home-notifier');
let mlb = require('node-mlb-api');
let schedule = require('node-schedule');
const TEAM_ID = 141; //115
const LANG = 'us';
const API_DELAY = 500;
const GAME_WARNING = 30;
const SHOW_AWAY_GAMES = true;
const UPDATE_INTERVAL = 5 * 60 * 1000; //in ms
const RUN_DIFF = 3;
googlehome.ip('10.0.0.173', LANG);

function dayToString(day) {
    return day.getMonth() + 1 + "/" + day.getDate() + "/" + day.getFullYear();
}

function getNextGame(day) {
    let delay = setInterval(getGame, API_DELAY);
    async function getGame() {
        let games = await mlb.getGames(dayToString(day));
        for (let game in games.dates[0].games) {
            let teams = games.dates[0].games[game].teams;
            //console.log(games.dates[0].games[game].status );
            if (games.dates[0].games[game].status.abstractGameCode != 'F') {
                if (teams.home.team.id == TEAM_ID) {
                    clearInterval(delay);
                    console.log("Home Game: " + new Date(games.dates[0].games[game].gameDate));
                    updateNextGame(games.dates[0].games[game]);
                }
                if (SHOW_AWAY_GAMES && teams.away.team.id == TEAM_ID) {
                    clearInterval(delay);
                    console.log("Away Game: " + new Date(games.dates[0].games[game].gameDate));
                    updateNextGame(games.dates[0].games[game]);
                }
            }
        }
        day.setDate(day.getDate() + 1);
    };
};

function updateNextGame(game) {
    let date = new Date(game.gameDate);
    let curdate = new Date();
    let timeToGame = (date.getTime() - curdate.getTime()) / 60000;
    switch (game.status.abstractGameCode) {
        //If Game In Progress
        case 'L':
            console.log("Game in Progress!");
            //Game Start Event
            gameStartEvent(game);
            break;

        //If Game Over
        case 'F':
            console.log("Game Finished.");
            //Get Next game for day + 1
            date.setDate(date.getDate() + 1);
            getNextGame(date);
            break;

        //If Game Not Started
        case 'P':
            console.log("Game Scheduled");
            //gameStartEvent(game);
            //If game is < x mins away
            if (timeToGame < 30) {
                //remind NOW!
                remiderEvent(game);
            } else {
                //schedule game reminder
                date.setMinutes(date.getMinutes() - 30);
                console.log('Scheduled Reminder for ' + date);
                schedule.scheduleJob(date, remiderEvent.bind(null, game));
            }
            break;
    }
}

function remiderEvent(game) {
    let date = new Date(game.gameDate);
    let curdate = new Date();
    let timeToGame = (date.getTime() - curdate.getTime()) / 60000;
    //Notify game starting soon
    console.log("Game Starting in " + Math.round(timeToGame) + " minutes.")
    teams = [game.teams.away.team.name, game.teams.home.team.name]
    notify('The '+ teams[0] + ' and '+ teams[1] +' game is in '+ Math.round(timeToGame) + ' minutes.');
    //schedule Game Start Event
    //TODO THIS IS 2 Seconds in the future for testing
    //schedule.scheduleJob(curdate.setSeconds(curdate.getSeconds() + 2), gameStartEvent.bind(null, game));
    schedule.scheduleJob(date, gameStartEvent.bind(null, game));
}

function gameStartEvent(game) {
    let curdate = new Date();
    mlb.getGameFeed(game.gamePk).then((result) => {
        if (result.gameData.status.abstractGameCode == 'P') {
            console.log("Game Not Started Yet");
            schedule.scheduleJob(curdate.setMinutes(curdate.getMinutes() + 5), gameStartEvent.bind(null, game));
        } else if (result.gameData.status.abstractGameCode == 'L') {
            console.log("GAME STARTED!");
            startUpdateScore(game);
        } else {
            gameOverEvent(game);
        }
    })
}

function gameOverEvent(game) {
    console.log("Game Over");
    let date = new Date(game.gameDate);
    date.setDate(date.getDate() + 1);
    getNextGame(date);
}

function startUpdateScore(game) {

    let interval = setInterval(updateScore, UPDATE_INTERVAL);
    let gamePk = game.gamePk;
    scoreHome = scoreAway = 0;
    broadcasted = 0;
    function updateScore() {
        mlb.getGameFeed(gamePk).then((result) => {
            if (result.gameData.status.abstractGameCode != 'L') {
                //stop calling updateScore
                clearInterval(interval);
                //notify game over
                console.log('Game Over!');
                //game over event

            }
            let teams = [result.gameData.teams.home.name, result.gameData.teams.away.name];
            let ascore = result.liveData.linescore.teams.away.runs;
            let hscore = result.liveData.linescore.teams.home.runs;
            let delta = ascore - hscore;
            if (broadcasted != 0) {
                if (broadcasted * delta <= 0) {
                    if (delta == 0) {
                        console.log("The game is all tied.");
                        notify("The game is all tied.");
                        broadcasted = 0;
                    } else {

                    }
                    let message = "The " + teams[((delta < 0) ? 0 : 1)] + " have taken a " + Math.abs(delta) + " run lead over the " + teams[((delta > 0) ? 0 : 1)];
                    console.log(message);
                    notify(message);
                }
            } else {
                if (Math.abs(delta) >= RUN_DIFF) {
                    broadcasted = delta;
                    let message = "The " + teams[((delta < 0) ? 0 : 1)] + " have taken a " + Math.abs(delta) + " run lead over the " + teams[((delta > 0) ? 0 : 1)];
                    console.log(message);
                    notify(message);
                }
            }
        });
    }
}

function onStart() {
    //Notify Of Startup (Optional)

    //Get Next Game
    let day = new Date();
    //day.setDate(day.getDate()-1);
    getNextGame(day);


}

function notify(message) {
    googlehome.notify(message, function (res) {
        console.log(res);
    });
}
onStart();