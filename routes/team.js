var mongoose = require("mongoose");
var globals = require("../globalFunctions");
var tableMapper = require("../tableMapper");

module.exports = function(app)
{
	app.get('/team', function(req, res) {
		
		var filler = {};
		
		var query = {};
		query.datedeleted = null;
		query.active = true;
		
		mongoose.model('Player').find(query, null, {sort: 'lastname'}, function(err, players) {
			var playerMap = [];

			players.forEach(function(player) {
			  playerMap.push({
					id: player._id,
					number: player.number,
					firstname: player.firstname,
					lastname: player.lastname,
					positions: player.positions
			  });
			});
			
			filler.tableMap = tableMapper.PlayerTable();
			res.render('team', globals.PropertyList(req, err, playerMap, filler)); 
		  });
	});
}