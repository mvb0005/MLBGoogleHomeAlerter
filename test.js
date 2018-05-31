var googlehome = require('google-home-notifier');
var language = 'us';
const ROCKIES_ID = 115;
var mlb = require('node-mlb-api');


//googlehome.ip('10.0.0.173', language);

//googlehome.notify('test', function(res) {
//	console.log(res)
//});


mlb.getTeams().then((result) => {
	console.log(result);
})

		




