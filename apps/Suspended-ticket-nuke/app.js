(function () {

  return {

    requests: {

      deleteIt: function(filteredTickets) { // The only or the remaining IDs from 'filteredTickets'
        return {
          url: '/api/v2/suspended_tickets/destroy_many.json?ids=' + filteredTickets,
          type: 'DELETE'
        };
      },

      deleteItBatch: function(batch) { // Sub-arrays of 'filteredTickets'
        return {
          url: '/api/v2/suspended_tickets/destroy_many.json?ids=' + batch,
          type: 'DELETE'
        };
      },

      fetchTickets: function(next_page) {
        return {
          url: next_page || '/api/v2/suspended_tickets.json',
          type: 'GET'
        };
      }

    },

    events: {

      // Lifecycle Events
      'app.created': 'init',
      
      // AJAX Events & Callbacks
      'fetchTickets.done':'filterResults',
      'fetchTickets.fail':'fetchTicketsFail',
      
      // DOM Events
      'click .filter-all': 'fetch',
      'click .submit': 'processInputValue', // This is confirming the value you entered matches then sending request(s) to delete suspended tickets w the relevant IDs
      'keyup #inputValueId': function(event){
        if(event.keyCode === 13)
          return this.processInputValue();
      }

    },

    init: function () {

      this.popover({
        width: 300,
        height: 300
      });

      this.switchTo('modal');

      this.blacklist_map = []; // build array of substrings containing causes of suspension
      
      if (this.setting('\"Email is from a blacklisted sender or domain\"') === true) {
        this.blacklist_map.push("Email is from a blacklisted sender or domain");
      }
      if (this.setting('\"Email for \"noreply\" address\"') === true) {
        this.blacklist_map.push("Email for \"noreply\" address");
      }
      if (this.setting('\"Automated response email, out of office\"') === true) {
        this.blacklist_map.push("Automated response email, out of office");
      }
      if (this.setting('\"Received from Support Address\"') === true) {
        this.blacklist_map.push("Received from Support Address");
      }
      if (this.setting('\"Detected as email loop\"') === true) {
        this.blacklist_map.push("Detected as email loop");
      }
      if (this.setting('\"Automatic email processing failed\"') === true) {
        this.blacklist_map.push("Automatic email processing failed");
      }
      if (this.setting('\"Detected as spam\"') === true) {
        this.blacklist_map.push("Detected as spam");
      }
      if (this.setting('\"Submitted by registered user while logged out\"') === true) {
        this.blacklist_map.push("Submitted by registered user while logged out");
      }
      if (this.setting('\"Automated response email, delivery failed\"') === true) {
        this.blacklist_map.push("Automated response email, delivery failed");
      }
      if (this.setting('\"Automated response email\"') === true) {
        this.blacklist_map.push("Automated response email");
      }
      if (this.setting('\"Detected email as being from a system user\"') === true) {
        this.blacklist_map.push("Detected email as being from a system user");
      }

    },

    deleteResults: function(filteredTickets) { // This function handles the IDs sending AJAX request for every 100 IDs

      this.switchTo('loading');

      services.notify('Deleting ' + filteredTickets.length + ' suspended tickets', 'notice');

      while (filteredTickets.length > 100) { // There are more than n tickets in filteredTickets - sending it in pieces to 'deleteItBatch'
        
        var batch = filteredTickets.splice(0, 100);
        
        this.ajax('deleteItBatch', batch) // Send this batch to 'deleteItBatch'
          .done(
            console.log('Batch of suspended tickets deleted successfully - while loop continues..')
          )
          .fail(
            console.log('Failed to delete suspended tickets ' + batch)
          );
      }

      if (filteredTickets.length <= 100) { // There are 2 or fewer IDs to delete so send filteredTickets to 'deleteIt'

        console.log('less than or equal to 2 tickets');

        this.ajax('deleteIt', filteredTickets) // Send last batch to 'deleteIt'
          .done( function() {
              this.switchTo('nuke');
              services.notify('Suspended tickets deleted successfully');
          })
          .fail( function() { 
              console.log('Failed to delete suspended tickets ' + filteredTickets);
          });
      
      }

    },

    fetch: function() {
      this.suspended_tickets = [];
      this.ajax('fetchTickets');
      this.switchTo('loading');
    },

    fetchTicketsFail: function(response) {
      services.notify('Oops... something went wrong when getting the Suspended Tickets.');
      console.log(response);
    },

    filterResults: function(data) { // Get all suspended tickets, filter for IDs w cause matching any app settings cause that's true

      var next_page         = data.next_page,
          previous_page     = data.previous_page,
          finalTicketCount  = data.count,
          filteredTickets   = [];

      if( next_page ) { // Keep sending AJAX requests until all pages of results obtained

        this.ajax('fetchTickets', next_page);
        this.suspended_tickets = this.suspended_tickets.concat(data.suspended_tickets);

      } else if ( !previous_page && !next_page ) { // Execute this code block if account has LESS THAN 101 suspended tickets

        // console.log('All suspended tickets retrieved - there was 1 page.');

        this.suspended_tickets = data.suspended_tickets;

        for (var i = 0; this.suspended_tickets.length > i; i++ ) { // Looping & checking if any settings causes match any suspended ticket causes
          if (_.contains(this.blacklist_map, this.suspended_tickets[i].cause)) {
            filteredTickets.push(this.suspended_tickets[i].id);
          }
        }

        if (filteredTickets.length > 0) {
          this.switchTo('confirm', {
            finalTicketCount: finalTicketCount,
            filteredTickets: filteredTickets.length
          });
        } else {
          this.switchTo('nothingToDelete');
        }
        
        this.filteredTickets = filteredTickets; // Anchoring 'filteredTickets' too app at the root 'this'

      } else { // Execute this code block once FINAL page of paginated results retrieved

        // console.log('All suspended tickets retrieved - there were 2+ pages.');

        this.suspended_tickets = this.suspended_tickets.concat(data.suspended_tickets);

        for (var j = 0; this.suspended_tickets.length > j; j++ ) { // Looping & checking if any settings causes match any suspended ticket causes
          if (_.contains(this.blacklist_map, this.suspended_tickets[j].cause)) {
            filteredTickets.push(this.suspended_tickets[j].id);
          }
        }

        if (filteredTickets.length > 0) {
          this.switchTo('confirm', {
            finalTicketCount: finalTicketCount,
            filteredTickets: filteredTickets.length
          });
        } else {
          this.switchTo('nothingToDelete');
        }

        this.filteredTickets = filteredTickets; // Anchoring 'filteredTickets' too app at the root 'this'

      }
    
    },

    processInputValue: function() { // Evaluate entered value vs value to delete

      var filteredTickets     = this.filteredTickets, // All suspended ticket IDs if cause = any app parameter cause that is TRUE
          filteredTicketsSize = filteredTickets.length, // Number of total suspended tickets with cause matching a true checkbox in app settings
          result              = this.$('input#inputValueId').val();

      if (result == filteredTickets.length ) {
        this.$('#inputValueId').val('');
        this.deleteResults(filteredTickets); // Pass filtered results of all matching IDs to the deleteResults function for handling
      } else {
        this.$('#inputValueId').val('');
        services.notify('Please enter ' + filteredTicketsSize + ' to confirm', 'error');
      }
    }

  };

}());

//
// 
//            * * * Suspended Ticket Nuke App * * *
// 
//
//                      __,-~~/~    `---.
//                    _/_,---(      ,    )
//                __ /        <    /   )  \___
// - ------===;;;'====------------------===;;;===----- -  -
//                   \/  ~"~"~"~"~"~\~"~)~"/
//                   (_ (   \  (     >    \)
//                    \_( _ <         >_>'
//                       ~ `-i' ::>|--"
//                           I;|.|.|
//                          <|i::|i|`.
//                         (` ^'"`-' ")
// ------------------------------------------------------------------
//