var mongoose = require("mongoose");
var globals = require("../globalFunctions");

module.exports = function(app)
{
	

	app.get('/management', globals.RequireAdmin, function(req, res) {
		res.render('management', globals.PropertyList(req));
	  
	});
	
	//***ACCOUNTS****///

	app.get('/management/createaccount', globals.RequireAdmin, function(req, res) {
		res.render('../views/management', globals.PropertyList(req));  
	});
	
	app.post('/management/createuser', globals.RequireAdmin, (req, res) => {
	
		var newUser = mongoose.model('User')({
			email : req.body.email,
			password : req.body.password,
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			admin : (req.body.admin === "true")
		});
		
		req.route.path = '/management/createaccount';
		newUser.save(function(err) {
			if(err)
			{
				if(err.code == 11000){
					res.render('management', globals.PropertyList(req, 'An account already exists with that email.'));
				}else{
					res.render('management', globals.PropertyList(req, err));
				}
				
			}else{
				res.redirect('/management/viewaccounts');
			}
		});
	});
	
	app.post('/management/edituser', globals.RequireAdmin, (req, res) => {
		//updating pw
		if(req.body.password && req.body.password.length > 0)
		{
			bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
				if(err) res.send(err);
		 
				bcrypt.hash(req.body.password, salt, function(err, hash){
					if(err) res.send(err);
					 
					req.body.password = hash;
					mongoose.model('User').update({ email: req.body.email }, {password: req.body.password, firstname: req.body.firstname, lastname: req.body.lastname, admin: req.body.admin, playerid: req.body.playerlink}, function(err, raw){
						if (err) {
						  res.render('management', globals.PropertyList(req));
						}
						res.redirect('/management/viewaccounts');
					});		
				});
			});
		}else{
			//not updating pw
			mongoose.model('User').update({ email: req.body.email }, {firstname: req.body.firstname, lastname: req.body.lastname, admin: req.body.admin, playerid: req.body.playerlink}, function(err, raw){
				if (err) {
				  res.render('management', globals.PropertyList(req));
				}
				res.redirect('/management/viewaccounts');
			});	
		}
	});

	app.get('/management/editaccount', globals.RequireAdmin, function(req, res) {
		mongoose.model('User').findOne({ _id: req.query.id }, function(err, user) {
				delete user.password;
				mongoose.model('Player').find({ "datedeleted" : null }, null, {sort: 'lastname'}, function(err, players) {
					var fill = [];
				  var playerMap = [];

					players.forEach(function(player) {
					  playerMap.push({
							id: player._id,
							number: player.number,
							firstname: player.firstname,
							lastname: player.lastname
					  });
					});
					fill.playerChoices = playerMap;
					res.render('management', globals.PropertyList(req, err, user, fill));  
				});
				
			});    
	});

	app.get('/management/viewaccounts', globals.RequireAdmin, function(req, res) {
		mongoose.model('User').find({ "datedeleted" : null }, function(err, users) {
			var userMap = [];

			users.forEach(function(user) {
			  userMap.push({
					id: user._id,
					email: user.email,
					firstname: user.firstname,
					lastname: user.lastname,
					admin: user.admin
			  });
			});
			
			res.render('management', globals.PropertyList(req, err, userMap)); 
		  });
		 
	});
	
	app.get('/management/viewaccountsrestore', globals.RequireAdmin, function(req, res) {
		mongoose.model('User').find({ "datedeleted" : { $ne: null } }, function(err, users) {
			var userMap = [];

			users.forEach(function(user) {
			  userMap.push({
					id: user._id,
					email: user.email,
					firstname: user.firstname,
					lastname: user.lastname,
					admin: user.admin
			  });
			});
			res.render('management', globals.PropertyList(req, err, userMap)); 
		  });
		 
	});
	
	app.post('/management/restoreaccount', globals.RequireAdmin, (req, res) => {
		mongoose.model('User').update({ _id: req.body.id }, {datedeleted: null}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/viewaccounts');
		});	
	});
	
	app.post('/management/deleteaccount', globals.RequireAdmin, (req, res) => {
		var datetime = new Date();
		mongoose.model('User').update({ _id: req.body.id }, {datedeleted: datetime}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/viewaccounts');
		});	
	});
	
	
	//***PLAYERS****///
	
	app.get('/management/createplayer', globals.RequireAdmin, function(req, res) {
		res.render('../views/management', globals.PropertyList(req));  
	});
	
	app.post('/management/createplayer', globals.RequireAdmin, (req, res) => {
		
		if(req.body.number == "0")
			req.body.number = "00";
		
		var newUser = mongoose.model('Player')({
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			active : (req.body.active === "true"),
			number : req.body.number,
			position : req.body.position
		});
		
		req.route.path = '/management/createplayer';
		newUser.save(function(err) {
			if(err)
			{
				if(err.code == 11000){
					res.render('management', globals.PropertyList(req, 'That player already exists.'));
				}else{
					res.render('management', globals.PropertyList(req, err));
				}
				
			}else{
				res.redirect('/management/viewplayers');
			}
		});
	});
	
	app.get('/management/viewplayers', globals.RequireAdmin, function(req, res) {
		
		var filler = [];
		
		var query = {};
		query.datedeleted = null;
		
		if(req.query.showinactive == undefined || req.query.showinactive == false){
			query.active = true;
		}else{
			filler.showinactive = true;
		}
		
		mongoose.model('Player').find(query, null, {sort: 'lastname'}, function(err, players) {
			var playerMap = [];

			players.forEach(function(player) {
			  playerMap.push({
					id: player._id,
					number: player.number,
					firstname: player.firstname,
					lastname: player.lastname,
					position: player.position,
					active: player.active
			  });
			});
			res.render('management', globals.PropertyList(req, err, playerMap, filler)); 
		  });
		 
	});
	
	app.get('/management/editplayer', globals.RequireAdmin, function(req, res) {
		
		mongoose.model('Player').findOne({ _id: req.query.id }, function(err, player) {
				res.render('management', globals.PropertyList(req, err, player));  
			});    
	});
	
	app.post('/management/editplayer', globals.RequireAdmin, (req, res) => {
		
		if(req.body.number == "0")
			req.body.number = "00";
		
		mongoose.model('Player').update({ _id: req.body.id }, {firstname: req.body.firstname, lastname: req.body.lastname, number: req.body.number, position: req.body.position, active: req.body.active === "true"}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/viewplayers');
		});	
		
	});
	
	app.get('/management/viewplayerrestore', globals.RequireAdmin, function(req, res) {
		mongoose.model('Player').find({ "datedeleted" : { $ne: null } }, function(err, players) {
			var playerMap = [];

			players.forEach(function(player) {
			  playerMap.push({
					id: player._id,
					number: player.number,
					firstname: player.firstname,
					lastname: player.lastname,
					position: player.position
			  });
			});
			res.render('management', globals.PropertyList(req, err, playerMap)); 
		  });
		 
	});
	
	app.post('/management/restoreplayer', globals.RequireAdmin, (req, res) => {
		mongoose.model('Player').update({ _id: req.body.id }, {datedeleted: null}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/viewplayers');
		});	
	});
	
	app.post('/management/deleteplayer', globals.RequireAdmin, (req, res) => {
		var datetime = new Date();
		mongoose.model('Player').update({ _id: req.body.id }, {datedeleted: datetime}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/viewplayers');
		});	
	});
	
	//***SCHEDULE EVENTS****///
	
	app.get('/management/addevent', globals.RequireAdmin, function(req, res) {
		mongoose.model('EventLocation').find({}, null, {sort: 'name'}, function(err, locations) {
			var fill = [];
		    var locationMap = [];

			locations.forEach(function(location) {
			  locationMap.push({
					id: location._id,
					name: location.name
			  });
			});
			fill.locationChoices = locationMap;
			res.render('../views/management', globals.PropertyList(req, err, {}, fill));			
		});
	});
	
	app.get('/management/updateteamschedule', globals.RequireAdmin, function(req, res) {
		
		var currdate = new Date();
		mongoose.model('Event').find({eventdate: {$gte: currdate}}, null, {sort: {'eventdate': 1}}, function(err, events) {
			var eventMap = [];

			events.forEach(function(event) {
			  eventMap.push({
					id: event._id,
					name: event.name,
					eventdate: globals.FormatDate(event.eventdate),
					type: event.type,
					location : event.location,
					cancelled: event.cancelled
			  });
			});
			res.render('management', globals.PropertyList(req, err, eventMap)); 
		  });
		 
	});
	
	app.get('/management/editevent', globals.RequireAdmin, function(req, res) {
		mongoose.model('Event').findOne({ _id: req.query.id }, function(err, event) {
				var e = 
				{
					id : event.id,
					name : event.name,
					eventdate : globals.FormatDate(event.eventdate),
					type : event.type,
					location: event.location,
					cancelled : event.cancelled
				}
				mongoose.model('EventLocation').find({}, null, {sort: 'name'}, function(err, locations) {
					var fill = [];
					var locationMap = [];

					locations.forEach(function(location) {
					  locationMap.push({
							id: location._id,
							name: location.name
					  });
					});
					fill.locationChoices = locationMap;
					res.render('management', globals.PropertyList(req, err, e, fill));			
				}); 
			});    
	});
		
	app.post('/management/editevent', globals.RequireAdmin, (req, res) => {
		mongoose.model('EventLocation').findOne({ _id: req.body.locationlink}, function(err, loc) {
			mongoose.model('Event').update({ _id: req.body.id }, {name: req.body.eventname, type: req.body.eventtype, cancelled: req.body.cancelled === "true", location: loc}, function(err, raw){
				if (err) {
				  res.render('management', globals.PropertyList(req));
				}
				else{
					res.redirect('/management/updateteamschedule');
				}
			});	
		});
	});
	
	app.post('/management/createevent', globals.RequireAdmin, (req, res) => {
		var timestamp=Date.parse(req.body.eventdatetime)
		if (isNaN(timestamp)==false)
		{
			mongoose.model('EventLocation').findOne({ _id: req.body.locationlink}, function(err, loc) {
				var d=new Date(timestamp);
				var newEvent = mongoose.model('Event')({
					eventdate : d,
					name : req.body.eventname,
					type : req.body.eventtype,
					location: loc
				});
				
				req.route.path = '/management/createevent';
				newEvent.save(function(err) {
					if(err)
					{
						res.render('management', globals.PropertyList(req, err));
						
					}else{
						res.redirect('/management/updateteamschedule');
					}
				});
			});

		}else{
			res.render('management', globals.PropertyList(req, 'Invalid date and time format.'));
		}
	});

	//***EVENT LOCATIONS****///
	
	app.get('/management/addeventlocation', globals.RequireAdmin, function(req, res) {
		res.render('../views/management', globals.PropertyList(req));  
	});
	
	app.post('/management/createlocation', globals.RequireAdmin, (req, res) => {
			var newLocation = mongoose.model('EventLocation')({
				name : req.body.locationname,
				address : req.body.locationaddress
			});
			
			req.route.path = '/management/createlocation';
			newLocation.save(function(err) {
				if(err)
				{
					res.render('management', globals.PropertyList(req, err));
					
				}else{
					res.redirect('/management/editeventlocations');
				}
			});
	});
	
	app.get('/management/editeventlocations', globals.RequireAdmin, function(req, res) {
		
		mongoose.model('EventLocation').find({}, null, {sort: {'name': 1}}, function(err, locations) {
			var locationMap = [];

			locations.forEach(function(location) {
			  locationMap.push({
					id: location._id,
					name: location.name,
					address: location.address
			  });
			});
			res.render('management', globals.PropertyList(req, err, locationMap)); 
		  });
		 
	});
	
	app.get('/management/editlocation', globals.RequireAdmin, function(req, res) {
		mongoose.model('EventLocation').findOne({ _id: req.query.id }, function(err, location) {
				res.render('management', globals.PropertyList(req, err, location));  
			});    
	});
		
	app.post('/management/editlocation', globals.RequireAdmin, (req, res) => {
		mongoose.model('EventLocation').update({ _id: req.body.id }, {name: req.body.locationname, address: req.body.locationaddress}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			else{
				res.redirect('/management/editeventlocations');
			}
		});	
	});
	
	app.post('/management/deletelocation', globals.RequireAdmin, (req, res) => {
		var datetime = new Date();
		mongoose.model('EventLocation').remove({ _id: req.body.id }, function(err){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			res.redirect('/management/editeventlocations');
		});	
	});
	
	//***SEASONS****///
	
	app.get('/management/createseason', globals.RequireAdmin, function(req, res) {
		res.render('../views/management', globals.PropertyList(req));  
	});
	
	app.post('/management/createseason', globals.RequireAdmin, (req, res) => {
			var newSeason = mongoose.model('Season')({
				name : req.body.seasonname,
				timestamp : new Date(),
				standing: "1rst place",
				record : { wins : 0, losses : 0 }				
			});
			
			req.route.path = '/management/createseason';
			newSeason.save(function(err) {
				if(err)
				{
					res.render('management', globals.PropertyList(req, err));
					
				}else{
					res.redirect('/management/editseasons');
				}
			});
	});
	
	app.get('/management/editseasons', globals.RequireAdmin, function(req, res) {
		
		mongoose.model('Season').find({datedeleted : null}, null, {sort: {'timestamp': 1}}, function(err, seasons) {
			var seasonMap = [];

			seasons.forEach(function(season) {
			  seasonMap.push({
					id: season._id,
					name: season.name,
					standing: season.standing,
					record: season.record
			  });
			});
			res.render('management', globals.PropertyList(req, err, seasonMap)); 
		  });
		 
	});
	
	app.get('/management/editseason', globals.RequireAdmin, function(req, res) {
		mongoose.model('Season').findOne({ _id: req.query.id, datedeleted: null }, function(err, season) {
				res.render('management', globals.PropertyList(req, err, season));  
			});    
	});
		
	app.post('/management/editseason', globals.RequireAdmin, (req, res) => {
		mongoose.model('Season').update({ _id: req.body.id }, {name: req.body.name, standing: req.body.standing, record: { wins: req.body.wins, losses: req.body.losses}}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			else{
				res.redirect('/management/editseasons');
			}
		});	
	});
	
	app.post('/management/deleteseason', globals.RequireAdmin, (req, res) => {
		var datetime = new Date();
		mongoose.model('Season').update({ _id: req.body.id }, {datedeleted: datetime}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			else{
				res.redirect('/management/editseasons');
			}
		});	
	});
	
	//***NEWS****///
	
	app.get('/management/createheadline', globals.RequireAdmin, function(req, res) {
		res.render('../views/management', globals.PropertyList(req));  
	});
	
	app.post('/management/createheadline', globals.RequireAdmin, (req, res) => {
			var newNews = mongoose.model('NewsItem')({
				title : req.body.title,
				timestamp : new Date(),
				body: req.body.body,
				thumbnailurl : req.body.thumbnailurl
			});
			req.route.path = '/management/createheadline';
			newNews.save(function(err) {
				if(err)
				{
					res.render('management', globals.PropertyList(req, err));
					
				}else{
					res.redirect('/management/editheadlines');
				}
			});
	});
	
	app.get('/management/editheadlines', globals.RequireAdmin, function(req, res) {
		
		mongoose.model('NewsItem').find({datedeleted : null}, null, {sort: {'timestamp': 1}}, function(err, newsitems) {
			var newsMap = [];
			newsitems.forEach(function(news) {
			  newsMap.push({
					id: news._id,
					title: news.title,
					timestamp: globals.FormatDate(news.timestamp)
			  });
			});
			res.render('management', globals.PropertyList(req, err, newsMap)); 
		  });
		 
	});
	
	app.get('/management/editheadline', globals.RequireAdmin, function(req, res) {
		mongoose.model('NewsItem').findOne({ _id: req.query.id, datedeleted: null }, function(err, news) {
				res.render('management', globals.PropertyList(req, err, news));  
			});    
	});
		
	app.post('/management/editheadline', globals.RequireAdmin, (req, res) => {
		mongoose.model('NewsItem').update({ _id: req.body.id }, {title: req.body.title, body: req.body.body, thumbnailurl: req.body.thumbnailurl}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			else{
				res.redirect('/management/editheadlines');
			}
		});	
	});
	
	app.post('/management/deleteheadline', globals.RequireAdmin, (req, res) => {
		var datetime = new Date();
		mongoose.model('NewsItem').update({ _id: req.body.id }, {datedeleted: datetime}, function(err, raw){
			if (err) {
			  res.render('management', globals.PropertyList(req));
			}
			else{
				res.redirect('/management/editheadlines');
			}
		});	
	});
}