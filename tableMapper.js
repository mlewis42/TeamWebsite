exports.PlayerTable = function () {
	return {
			columnMap: [
				['Number', 'number', 'sortTableNumeric'], 
				['First Name', 'firstname', 'sortTableAlpha'], 
				['Last Name', 'lastname', 'sortTableAlpha'], 
				['Positions','positions']
			   ]
			
			};
};
exports.PlayerManagementTable = function () {
	return {
			columnMap: [
				['Number', 'number', 'sortTableNumeric'], 
				['First Name', 'firstname', 'sortTableAlpha'], 
				['Last Name', 'lastname', 'sortTableAlpha'], 
				['Positions','positions'],
				['Active', 'active']
			   ],
			rowClickProperty: 'readhref'
			};
};

exports.AccountManagementTable = function () {
	return {
			columnMap: [
				['First Name', 'firstname', 'sortTableAlpha'], 
				['Last Name', 'lastname', 'sortTableAlpha'], 
				['Email', 'email', 'sortTableAlpha'],
				['Admin', 'admin']
			   ],
			rowClickProperty: 'readhref'
			};
};

exports.HeadlineManagementTable = function () {
	return {
			columnMap: [
				['Title', 'title', 'sortTableAlpha'], 
				['Date', 'timestamp', 'sortTableDate']
			   ],
			rowClickProperty: 'readhref'
			};
};

exports.SponsorManagementTable = function () {
	return {
			columnMap: [
				['Name', 'name', 'sortTableAlpha'], 
				['Order', 'order', 'sortTableNumeric']
			   ],
			rowClickProperty: 'readhref'
			};
};

exports.ScheduleTable = function () {
	return {
			columnMap: [
					['', 'name'], 
					['Event Type', 'type'], 
					['Date', 'eventdate', 'sortTableDate'], 
					['Location','locationname']
				   ]
			};
};
exports.ScheduleUserTable = function () {
	return {
			columnMap: [
					['', 'name', ''], 
					['Event Type', 'type', 'sortTableAlpha'], 
					['Date', 'eventdate', 'sortTableDate'], 
					['Location','locationname']
				   ],
			rowClickProperty: 'readhref'
			};
};
exports.ScheduleManagementTable = function () {
	return {
			columnMap: [
					['Name', 'name', ''], 
					['Event Type', 'type', 'sortTableAlpha'], 
					['Date', 'eventdate', 'sortTableDate'], 
					['Location','locationname']
				   ],
			rowClickProperty: 'readhref'
			};
};
exports.LocationManagementTable = function () {
	return {
			columnMap: [
				['Name', 'name', 'sortTableAlpha'], 
				['Address', 'address']
			   ],
			rowClickProperty: 'readhref'
		};
};
exports.SeasonManagementTable = function () {
	return {
			columnMap: [
				['Name', 'name', 'sortTableAlpha'], 
				['Wins', 'wins', 'sortTableNumeric'], 
				['Losses', 'losses', 'sortTableNumeric'], 
				['Standing', 'standing']
			   ],
			rowClickProperty: 'readhref'
		};
};