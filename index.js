let mlb = require('node-mlb-api');
let schedule = require('node-schedule');
const TEAM_ID = 115; //115
const LANG = 'us';
const API_DELAY = 500;
const SHOW_AWAY_GAMES = true;

function dayToString(day){
	return day.getMonth() + 1 + "/" + day.getDate() + "/" + day.getFullYear();
}

function getNextGame(day){
    let delay = setInterval(getGame, API_DELAY);
    async function getGame(){
        let games = await mlb.getGames(dayToString(day));
        for(let game in games.dates[0].games){
            let teams = games.dates[0].games[game].teams;
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
        day.setDate(day.getDate() + 1);
    };
};

function updateNextGame(game){
    let date = new Date(game.gameDate);
    //console.log(game);
    switch(game.status.codedGameState) {
    //If Game In Progress
        case 'I':
            console.log("Game in Progress!");
            //Game Start Event
            break;
    //If Game Over
        case 'F':
            console.log("Game Finished.");
            //Get Next game for day + 1
            break;

    //If Game Not Started
        case 'S':
            console.log("Game Scheduled");
        //If game is < x mins away
            //Notify game is starting soon
            console.log("Game Starting in X minutes")
            //schedule game start
            schedule.sc
        //If game is > x mins away
            //schedule game reminder
            break;
    }
}

function remiderEvent(){
    //Notify game starting soon
    //schedule Game Start Event
}

function gameStartEvent(){
    //Check if game has started
    //Notify Game Is Starting
    //create interval of calling update Score
}

function updateScore(){
    //get gamescore
    //if game is over
        //stop calling updateScore
        //notify game over
        //game over event
    //if either team is smashing
        //notify X team is winning by Y runs
}

function onStart() {
    //Notify Of Startup (Optional)
    
    //Get Next Game
    let day = new Date();
    //day.setDate(day.getDate()-1);
    console.log(day);
    getNextGame(day);


}

onStart();