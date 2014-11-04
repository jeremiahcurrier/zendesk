(function() {

  return {
  blacklist_map: [
    // "Email is from a blacklisted sender or domain",
    // "Automated response mail, out of office",
    // "Detected as mail loop",
    "Detected as spam"
    // "Submitted by registered user while logged out",
    // "Automated response email, delivery failed"
  ],

  requests: {

	fetchTickets: function() {

		return {
		url: '/api/v2/suspended_tickets.json',
		type: 'GET',
		contentType: 'application/json'
			};
		},
	deleteIt: function(id) {
		return {
			url: helpers.fmt('/api/v2/suspended_tickets/%@.json', id),
			type: 'DELETE',
			contentType: 'application/json'
		};
	}
	},

events: {
  'click .btn': 'fetch',
  'fetchTickets.done':'filterAndDelete'
},

fetch: function() {
	this.ajax('fetchTickets');
},

filterAndDelete: function(data) { // Loop through all suspended tickets in page 1 of results and send respective AJAX request to delete suspended ticket if cause is "Email is from a blacklisted sender or domain", "Automated response mail, out of office", or "Detected as mail loop"

	// *******************
	// Underscore wizardry start
	// -----
  var map = this.blacklist_map;
	var suspended = data.suspended_tickets;
	var mailFail = _.filter(suspended, function(item){
  	return map.indexOf(item.cause) > -1;
  });
  console.log(mailFail);
  _.each(mailFail, _.bind(function(item) {
    this.ajax('deleteIt', item.id);
  }, this));
	// });
	// console.log(mailFail);
    // -----
	// Underscore wizardry end
    // *******************
    // *******************
	// Small time wizardry start
    // -----
    /*
	for (var i = 0; data.suspended_tickets.length > 0; i++) { // Each if statement is checking a cause of suspension for suspended tickets
		var id = data.suspended_tickets[i].id;
		// Automated response mail, out of office
		// Detected as mail loop
		// Email is from a blacklisted sender or domain
		if (data.suspended_tickets[i].cause == "Email is from a blacklisted sender or domain") { // DELETE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			this.ajax('deleteIt', id);
		} else if (data.suspended_tickets[i].cause == "Automated response mail, out of office") { // DELETE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			this.ajax('deleteIt', id);
		} else if (data.suspended_tickets[i].cause == "Detected as mail loop") { // DELETE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			this.ajax('deleteIt', id);
		} else if (data.suspended_tickets[i].cause == "Detected as spam") { // DO NOT DELETE SUSPENDED TICKETS WITH THIS CAUSE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			// this.ajax('deleteIt', id);
		} else if (data.suspended_tickets[i].cause == "Submitted by registered user while logged out") { // DO NOT DELETE SUSPENDED TICKETS WITH THIS CAUSE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			// this.ajax('deleteIt', id);
		} else if (data.suspended_tickets[i].cause == "Automated response email, delivery failed") { // DELETE
			console.log('Ticket ID #' + data.suspended_tickets[i].id + ' has a cause of: ' + data.suspended_tickets[i].cause + ' and will be deleted.');
			this.ajax('deleteIt', id);
		}

		// Automated response email, delivery failed
	}
    // -----
    */
	// Small time wizardry end
	// *******************
}
  };

}());