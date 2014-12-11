(function () {

  var resultsSet = [],
      requestCount = 0; // Once this is equal to the # of AJAX requests sent to ~/audits.json - switch to results table

  return {

    requests: {

      getAuditWithSideLoadTicket: function(id) {
        return {
          url: '/api/v2/tickets/' + id + '/audits.json?include=tickets',
          type: 'GET'
        };
      },

      getClosedTickets: function(next_page) {
        return {
          url: next_page || '/api/v2/search.json?query=status:closed',
          type: 'GET'
        };
      }

    },

    events: {

      // Lifecycle Events
      'app.created': 'init',
      
      // AJAX Events & Callbacks
      'getClosedTickets.done':'getClosedTicketsDone',
      'getClosedTickets.fail':'getClosedTicketsFail',
      'getAuditWithSideLoadTicket.done': 'getAuditWithSideLoadTicketDone',
      'getAuditWithSideLoadTicket.fail': 'getAuditWithSideLoadTicketFail',
      
      // DOM Events
      'click .search': 'fetch', // Get closed tickets
      'click .refresh': 'fetch', // Get closed tickets
      'click .go_back': function(){ // Go back to first page
        
        console.log('*** *** clicked .go_back *** ***');

        resultsSet = []; // This line prevents duplicating the results set

        this.switchTo('done', {
          filteredTickets : this.totalRequestsCount
        });

      },
      'click .get_follow_ups': function(){
        this.getFollowUps(this.filteredTickets); // Pass all closed ticket IDs to getFollowUps
      }

    },

    init: function () {
      this.switchTo('main');
    },

    fetch: function() {
      this.filteredTickets = []; // Results of search
      this.ajax('getClosedTickets');
      this.switchTo('loading');
    },

    getClosedTicketsFail: function(response) {
      services.notify('FAIL');
      console.log('response');
      console.log(response);
    },

    getClosedTicketsDone: function(data) { // Get all closed tickets in the account & filter to just the IDs

      var next_page         = data.next_page,
          previous_page     = data.previous_page,
          finalTicketCount  = data.count,
          filteredTickets   = [];

      
      if( next_page ) { // Keep sending AJAX requests until all pages of results obtained

        console.log('greater than 100 results - 2+ pages - next request: ');
        console.log(next_page);
        this.filteredTickets = this.filteredTickets.concat(data.results);
        this.ajax('getClosedTickets', next_page);

      } else if ( !previous_page && !next_page ) { // Execute this code block if account has LESS THAN 101 suspended tickets
        
        console.log('all results retrieved - 1 page only - no more requests required');
        // build array of ticket IDs:
        this.results = data.results;
        console.log('results:');
        console.log(this.results);
        console.log('filtered results / closed ticket ids: ');

        for (var i = 0; this.results.length > i; i++) {
          filteredTickets.push(this.results[i].id);
        }

        console.log('There are ' + filteredTickets.length + ' closed tickets');
        console.log(filteredTickets);
        
        if (filteredTickets.length > 0) { // No closed tickets
          this.switchTo('noTickets');
        }

        this.switchTo('done', {
          filteredTickets: filteredTickets.length
        });

        this.filteredTickets = filteredTickets;
        console.log('click the \'Get the Follow Ups\' button in the app');

      } else { // Execute this code block once FINAL page of paginated results retrieved

        console.log('all results retrieved - 2+ pages - no more requests required');

        // Build array of ticket IDs:
        this.filteredTickets = this.filteredTickets.concat(data.results);
        this.results = this.filteredTickets;
        var results = this.results;
        console.log('results:');
        console.log(results);
        console.log('filtered results / closed ticket ids: ');

        for (var j = 0; this.results.length > j; j++) {
          filteredTickets.push(this.results[j].id);
        }

        console.log('There are ' + filteredTickets.length + ' closed tickets');
        console.log(filteredTickets);

        this.switchTo('done', {
          filteredTickets: filteredTickets.length
        });

        this.filteredTickets = filteredTickets;
        console.log('click the \'Get the Follow Ups\' button in the app');
      }    
    },

    getAuditWithSideLoadTicketDone: function(data) {

      this.switchTo('loading2');

      console.log('--- Start ---');

      var next_page         = data.next_page,
          previous_page     = data.previous_page;

      if (!next_page) { // If there is only 1 page of audits for a given closed ticket
        if (data.tickets.length < 2) { // If there are not 2 or more closed tickets
          if (data.tickets[0].followup_ids.length !== undefined && data.tickets[0].followup_ids.length > 0) { 
          // If there are follow up tickets for the closed ticket result
            
            var followUpIds = [];

            for (var i = 0; data.tickets[0].followup_ids.length > i; i++) { // Add follow up IDs to followUpIds array
              followUpIds.push(data.tickets[0].followup_ids[i]);
            }

            var closed              = data.audits[0].ticket_id,
                closedAndFollowUps  = [closed, followUpIds];
            
            resultsSet.push(closedAndFollowUps);
            console.log('closed ticket ID: ' + data.audits[0].ticket_id + ' with follow up ID(s): ' + followUpIds);
            console.log('followUpIds for ticket ' + data.audits[0].ticket_id + ':');
            console.log(followUpIds);
            console.log('******************');
            console.log('closedAndFollowUps');
            console.log(closedAndFollowUps);
          }
        } else {
          console.log(data.audits[0].ticket_id + ' has no follow up tickets');
        }
      } else {
        console.log('there is a next_page: ');
        console.log(next_page);
      }

      requestCount++; // Increase the counter of AJAX requests to the ~/audits.json endpoint by 1
      console.log('requestCount:');
      console.log(requestCount);
      console.log('totalRequestsCount:');
      console.log(this.totalRequestsCount);

      if (requestCount === this.totalRequestsCount) {
        console.log('All AJAX requests to the ~/audits/{id}.json complete');
        console.log('Results:');
        console.log(resultsSet);

        var resultsSetObject = resultsSet.map(function(element){
          return {closedTicketID: element[0], followupIDs: element[1]};
        });

        // Anchors

        this.resultsSetObject = resultsSetObject;
        this.resultsSet = resultsSet;

        console.log('resultsSetObject:');
        console.log(resultsSetObject);
        console.log('requestCount');
        console.log(requestCount);
        console.log('this.resultsSetObject:');
        console.log(this.resultsSetObject);
        console.log('this.requestCount');
        console.log(this.requestCount);

        // Switch to template w/list of tickets & CSV download button

        this.switchTo('done2', {
          results : resultsSetObject,
          filteredTickets: resultsSet.length
        });

      }
      console.log('--- End ---');
    },


    getAuditWithSideLoadTicketFail: function() {
      services.notify('getAuditWithSideLoadTicketFail', 'error');
    },

    getFollowUps: function() { // Get audits for each closed ticket ID - 1 AJAX request @ a time

      requestCount= 0;

      var filteredTickets     = this.filteredTickets,
          totalRequestsCount  = filteredTickets.length;
      this.totalRequestsCount = totalRequestsCount; // Total number of closed tickets you will sending AJAX requests for

      console.log('start \'getFollowUps\'');
      console.log('## |start| for loop to ticket audits for each closed ticket id ##');

      for (var i = 0; filteredTickets.length > i; i++) {
        var id = filteredTickets[i];
        this.ajax('getAuditWithSideLoadTicket', id);
        console.log('Sending AJAX request to ~/audits.json with closed ticket ID: ' + id);
      }

      console.log('end \'getFollowUps\'');
      console.log('## |end| for loop to ticket audits for each closed ticket id ##');

    }

  };

}());