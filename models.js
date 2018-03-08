var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;

var userSchema = new Schema({
        email : String,
        password : String,
		admin :	Boolean,
		firstname : String,
		lastname : String,
		datedeleted : Date,
		playerid : String
    });;
var User = mongoose.model('User', userSchema);

var playerSchema = new Schema({
        firstname : String,
        lastname : String,
		active :	Boolean,
		number : Number,
		position : String,
		datedeleted : Date
    });
var Player = mongoose.model('Player', playerSchema);

var eventLocationSchema = new Schema({
        name : String,
		address : String
    });
var EventLocation = mongoose.model('EventLocation', eventLocationSchema);

var eventSchema = new Schema({
        name : String,
        eventdate : Date,
		cancelled :	Boolean,
		type : String,
		location : {
						name : String,
						address : String
                   },
		attending : [{
			firstname : String,
			lastname : String,
			number : Number,
			position : String,
			email : String,
			_id : false
		}],
		absent : [{
			firstname : String,
			lastname : String,
			number : Number,
			position : String,
			email : String,
			_id : false
		}],
		spectating : [{
			firstname : String,
			lastname : String,
			number : Number,
			position : String,
			email : String,
			_id : false
		}]
    });
var Event = mongoose.model('Event', eventSchema);

userSchema.pre('save', function(next){
    var user = this;
    if (!user.isModified('password')) return next();
 
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
 
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
 
            user.password = hash;
            next();
        });
    });
});
