//var googlehome = require('google-home-notifier');
var language = 'us';
const ROCKIES_ID = 115;
var mlb = require('node-mlb-api');
var test = require('./index');


//googlehome.ip('10.0.0.173', language);

// googlehome.notify("Shit", function(res) {
// 	console.log(res)
// });


mlb.getTeams().then((result) => {
	console.log(result);
})
// function startUpdateScore(game){
    
//     interval = setInterval(updateScore, 3000);
//     s1 = s2 = 0;
//     console.log(s1, s2);
//     function updateScore(){
//         console.log(game);
//         game++;
//         console.log(interval);
//     }
//     //get gamescore
//     //if game is over
//         //stop calling updateScore
//         //notify game over
//         //game over event
//     //if either team is smashing
//         //notify X team is winning by Y runs
// }

// startUpdateScore(0);

