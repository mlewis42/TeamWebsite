var mongoose = require("mongoose");
var globals = require("../globalFunctions");
var tableMapper = require("../tableMapper");

module.exports = function(app)
{
	

	app.get("/schedule",function(req,res){
		var currdate = new Date();
		var results = {
			seasontitle : currdate.getFullYear()
		}
		
		
		if (!req.session.user) {
			//not logged in, display basic team game and scrimmage schedule
			
			mongoose.model('Event').find({eventdate: {$gte: currdate}, type: {$in: ['Game', 'Scrimmage']}, datedeleted: null }, null, {sort: {'eventdate': 1}}, function(err, events) {
				if(events != null)
				{
					var eventMap = [];

					events.forEach(function(event) {
					  eventMap.push({
							id: event._id,
							name: event.name,
							eventdate: !event.cancelled ? globals.FormatDate(event.eventdate) : 'CANCELLED',
							type: event.type,
							locationname: event.location ? event.location.name : '',
							cancelled: event.cancelled
					  });
					});
					var filler = {};
					filler.tableMap = tableMapper.ScheduleTable();
					results = eventMap;
					req.route.path = '/schedule/viewcalendar';
					res.render('schedule', globals.PropertyList(req, "", results, filler));
				}
			});
				
	
		} else {
			//logged in, display all events and schedule interaction
			
			mongoose.model('Event').find({eventdate: {$gte: currdate}, datedeleted: null }, null, {sort: {'eventdate': 1}}, function(err, events) {
				var eventMap = [];

				events.forEach(function(event) {
				  eventMap.push({
						id: event._id,
						name: event.name,
						eventdate: !event.cancelled ? globals.FormatDate(event.eventdate) : 'CANCELLED',
						type: event.type,
						locationname: event.location ? event.location.name : '',
						readhref: '/schedule/viewevent?id=' + event._id,
						cancelled: event.cancelled
				  });
				});
				var filler = {};
				filler.tableMap = tableMapper.ScheduleUserTable();
				results = eventMap;
				req.route.path = '/schedule/viewcalendar';
				res.render('schedule', globals.PropertyList(req, "", results, filler));
			  });
		}
	});
	
	app.get('/schedule/viewevent', globals.RequireLogin, function(req, res) {
		mongoose.model('Event').findOne({ _id: req.query.id }, function(err, event) {
		if(event != null){
				var e = 
				{
					id : event.id,
					name : event.name,
					eventdate : globals.FormatDate(event.eventdate),
					type : event.type,
					location: event.location,
					spectating : event.spectating,
					attending : event.attending,
					absent : event.absent,
					cancelled : event.cancelled
				}
				
				//if the event is a game / practice / or scrimmage remove non-players from attending and absent
				if(e.type == "Game" || e.type == "Practice" || e.type == "Scrimmage")
				{
					if(e.attending != null)
					{
						for(var i = 0; i < e.attending.length; i++){
							if(e.attending[i].number == null){
								e.attending.splice(i, 1);
								i--;
							}
						}				
					}
					if(e.absent != null)
					{
						for(var i = 0; i < e.absent.length; i++){
							if(e.absent[i].number == null){
								e.absent.splice(i, 1);
								i--;
							}
						}				
					}
				}
				res.render('schedule', globals.PropertyList(req, err, e));			
			}
		});    
		
	});
		
	app.post('/schedule/replyevent', globals.RequireLogin, (req, res) => {

		//get player
		mongoose.model('Player').findOne({ "datedeleted" : null, _id : req.session.user.playerid, active: true }, function(err, player) {	
		
			var set = {};
			
			var participant = {
				email : req.session.user.email
			}; 
			if(player != null){
				participant.firstname = player.firstname;
				participant.lastname = player.lastname;
				participant.number = player.number;
				participant.position = player.position;
			}else{
				participant.firstname = req.session.user.firstname;
				participant.lastname = req.session.user.lastname;
			}
			
			switch(req.body.reply){
				case "attending":
					set = { attending : participant };
					break;
				case "absent":
					set = { absent : participant };
					break;
				case "spectating":
					set = { spectating : participant };
					break;
				default :
					set = { absent : participant };
				break;
			}
			
			//first, remove any existing response from the same user
			mongoose.model('Event').update({ "_id": req.body.id }, {"$pull" : { "attending" : {email: req.session.user.email} }}, function(err, pullRes){
				//first, remove any existing response from the same user
				mongoose.model('Event').update({ "_id": req.body.id }, {"$pull" : { "absent" : {email: req.session.user.email} }}, function(err, pullRes){	
					//first, remove any existing response from the same user
					mongoose.model('Event').update({ "_id": req.body.id }, {"$pull" : { "spectating" : {email: req.session.user.email} }}, function(err, pullRes){
						mongoose.model('Event').update({ "_id": req.body.id }, {$addToSet : set}, function(err, raw){
							if (err) {
							  res.render('schedule', globals.PropertyList(req));
							}
							else{
								res.redirect('/schedule/viewevent?id=' + req.body.id);
							}
						});
					});					
				});				
			});
		});
	});
	
}