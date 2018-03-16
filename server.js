var https = require('https');
const express = require('express')
const path = require('path');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var pem = require('pem')
const app = express()
var router = express.Router();
var config = require('./config.json');

const request = require('request');
const apiKey = 'cf9483365f750d9168b985dfcc106db5';

app.use(express.static(path.join(__dirname + '/public')));
app.set('view engine', 'ejs')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(config.connectionString);
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const models = require('./models');
var globals = require("./globalFunctions");

app.use(session({
	secret  : 'Ga54%^&SD#Sdfgsji9@[}',
      key     : 'session_cookie_name',
	  duration: 30 * 60 * 1000,
  activeDuration: 30 * 60 * 1000,
    resave: true,
    saveUninitialized: true
}))

//middleware that checks and validates every user request
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    mongoose.model('User').findOne({ email: req.session.user.email, datedeleted : null }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
		delete req.session.user.password;
        res.locals.user = user;
		
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

app.use(function(req, res, next) {
	//get banner data
	//get the current season
	mongoose.model('Season').findOne({}, {}, { sort: { 'timestamp' : -1 } }, function(err, season) {
		var seasonbanner = {};
		if(season != null){
			
		  seasonbanner.seasonname = season.name;
		  seasonbanner.seasonstanding = season.standing;
		  seasonbanner.seasonrecord = season.record;
		}
		
		var currdate = new Date();
		//get next game
		mongoose.model('Event').findOne({eventdate: {$gte: currdate}, type: {$in: ['Game', 'Scrimmage']}}, {}, { sort: { 'eventdate' : 1 } }, function(err, event) {
			if(event != null){
				var dateFormat = "";
				if(event.eventdate != null && event.eventdate != ""){
					var d = new Date(event.eventdate);
					var month = d.getMonth() + 1;
					var day = d.getDate();
					
					dateFormat = month + "/" + day;
				}
				
				seasonbanner.nextgamename = dateFormat + " " + event.name;
				
				if(event.type == "Scrimmage"){
					seasonbanner.nextgamename += " (scrimmage)";
				}
				
				req.session.seasonbanner = seasonbanner;
			}
			next();
		});
	});
	
});

app.get('/', function (req, res) {
	
	//load headlines		
	mongoose.model('NewsItem').find({datedeleted: null}, null, {sort: { 'timestamp' : -1 }, limit: 10}, function(err, news) {
		var newsMap = [];

		news.forEach(function(nItem) {
		  newsMap.push({
				id: nItem._id,
				title: nItem.title,
				body: nItem.body,
				timestamp: globals.FormatDate(nItem.timestamp),
				thumbnailurl : nItem.thumbnailurl
		  });
		});
		
		res.render('index', globals.PropertyList(req, err, newsMap));
	  });
	
  
});

app.get('/headline', function(req, res) {
		
	mongoose.model('NewsItem').findOne({ _id: req.query.id }, function(err, news) {
			globals.FormatDate(news.timestamp);
			var newsMap = {
				id: news._id,
				title: news.title,
				body: news.body,
				thumbnailurl : news.thumbnailurl,
				timestamp: globals.FormatDate(news.timestamp)
			};
			res.render('headline', globals.PropertyList(req, err, newsMap));  
		});    
});

app.post('/login', function(req, res) {	
	if(req.body.email && req.body.email != "" && req.body.password && req.body.password != ""){
	
		mongoose.model('User').findOne({ email: new RegExp('^'+req.body.email+'$', "i"), datedeleted : null }, function(err, user) {
			if (!user) {
			  res.render('login', globals.PropertyList(req, 'Invalid email or password'));
			} else {
				bcrypt.compare(req.body.password, user.password, function(err, result) {
				  if(result) {
				   // Passwords match
					   req.session.user = user;
					  delete req.session.user.password; 
					res.redirect('/dashboard');
				  } else {
				   // Passwords don't match
				   res.render('login', globals.PropertyList(req, 'Invalid email or password'));
				  } 
				});
			}
		});
	}else{
		res.render('login', globals.PropertyList(req, 'Invalid email or password'));
	}
});

app.post('/changepassword', globals.RequireLogin, (req, res) => {
	
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) res.send(err);
 
        bcrypt.hash(req.body.password, salt, function(err, hash){
            if(err) res.send(err);
 
            req.body.password = hash;
			
			mongoose.model('User').update({ email: req.session.user.email }, {password: req.body.password}, function(err, raw){
				if (err) {
				  res.send(err);
				}
				res.render('dashboard', globals.PropertyList(req, 'Password updated successfully'));
			});
        });
    });		
})

//dashboard for user requires login
router.get('/dashboard', globals.RequireLogin, function(req, res) {
	//console.log(req.session);
    res.render('dashboard', globals.PropertyList(req));
  
});

router.get('/dashboard/changepassword', globals.RequireLogin, function(req, res) {
    res.render('dashboard', globals.PropertyList(req));  
});

router.get("/login",function(req,res){
	if(req.user){
		res.redirect('/dashboard');
	}else{
		res.render('login', globals.PropertyList(req));
	}
});

app.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/');
});

router.get("/contact",function(req,res){
  res.render('contact', globals.PropertyList(req));
});

var management = require('./routes/team')(app);
var management = require('./routes/schedule')(app);
var management = require('./routes/management')(app);

app.use("/",router);

app.use("*",function(req,res){
  res.render('404');
})


//need open ssl for this
/*
pem.config({
      pathOpenSSL: path.join(__dirname, 'openssl', 'windows', 'openssl.exe'),
    })
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {
    throw err
  }
  https.createServer({ key: keys.serviceKey, cert: keys.certificate }, function (req, res) {
    res.end('o hai!')
  }).listen(443)
})*/
app.listen(config.port, function () {
  console.log('App started and listening on port 3000')
})