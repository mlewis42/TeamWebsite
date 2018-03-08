var mongoose = require("mongoose");

exports.RequireLogin = function (req, res, next) {	
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

exports.RequireAdmin = function (req, res, next){
	if(req.user && req.user.email){
		mongoose.model('User').findOne({ email: req.user.email, admin: true, datedeleted: null }, function(err, user) {
		  if (user) {
			next();
		  }else{
			  res.end('requires admin access.');
		  }
		});
	}else{
		res.redirect('/login');
	}
};

exports.PropertyList = function (req, mess, queryResults, fill){
	var pl = {
		message: mess,
		current: req.route.path,
		accountButtonName: accountButtonName(req),
		admin: isAdmin(req),
		results : queryResults,
		filler : fill
	}
	
	return pl;
};

exports.FormatDate = function(date){
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	var d = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear() + " " + strTime; 
	return d;
};

accountButtonName = function (req) {
  if (!req.session.user) {
	return 'Login';
  } else {
	return req.session.user.firstname;
  }
};

isAdmin = function(req){
	if(req.session.user && req.session.user.admin){
		return true;
	}
	return false;
};




