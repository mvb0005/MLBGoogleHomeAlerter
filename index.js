let mlb = require('node-mlb-api');
const TEAM_ID = 115;
const LANG = 'us';
const API_DELAY = 500;
const SHOW_AWAY_GAMES = true;
let next_game = 0;

function dayToString(day){
	return day.getMonth() + 1 + "/" + day.getDate() + "/" + day.getFullYear();
}

function getNextGame(){
    let delay = setInterval(getGame, API_DELAY);
    let day = new Date();
    async function getGame(){
        console.log(dayToString(day));
        let games = await mlb.getGames(dayToString(day));
        for(let game in games.dates[0].games){
            let teams = games.dates[0].games[game].teams;
            if (teams.home.team.id == TEAM_ID) {
                clearInterval(delay);
                console.log("Home Game: " + new Date(games.dates[0].games[game].gameDate));
                next_game = games.dates[0].games[game].gamePK;
            }
            if (SHOW_AWAY_GAMES && teams.away.team.id == TEAM_ID) {
                clearInterval(delay);
                console.log("Away Game: " + new Date(games.dates[0].games[game].gameDate));
                next_game = games.dates[0].games[game].gamePK;
            }
        }
        day.setDate(day.getDate() + 1);
    };
};

getNextGame();