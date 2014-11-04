(function() {
  return {
    requests: {

      fetchProblems: function() {
        return {
          url: '/api/v2/problems.json?include=incident_counts',
          type: 'GET'
        };
      }
    },

    events: {

      // User events
      'click .btn' : function(){
        this.ajax('fetchProblems');
      },

      // AJAX events
      'fetchProblems.done': 'fetchProblemsSuccess',
      'fetchProblems.fail': 'fetchProblemsFail'
    },

    fetchProblemsSuccess: function(data) {
    // Time variables
    var timeDateRightNow = Date.now();      // Time right now in ms (UTC)
    var oneDays = Date.now() - 86400000;    // 86400000 ms in 24 hours
    var threeDays = Date.now() - 259200000; // 259200000 ms in 72 hours
    var sevenDays = Date.now() - 604800000; // 604800000 ms in 168 hours

    // Parameter Settings Variables
    var day1 = parseInt(this.setting('one'), 10);
    var day3 = parseInt(this.setting('three'), 10);
    var day7 = parseInt(this.setting('seven'), 10);
    var old = parseInt(this.setting('older'), 10);

    function compareTimesTwo() {

      for ( var i = 0 ; i < data.tickets.length ; i++ ) {

        var createdAtTimeToString = Date.parse(data.tickets[i].created_at);

        if (((oneDays < createdAtTimeToString) === true) && (data.tickets[i].incident_count >= day1)) {
          console.log("Problem ID: " + data.tickets[i].id + " = TRENDING, created < 1 day ago & has " + data.tickets[i].incident_count + " incidents");
        } else if (((threeDays < createdAtTimeToString) === true) && (data.tickets[i].incident_count >= day3)) {
          console.log("Problem ID: " + data.tickets[i].id + " = TRENDING, created < 3 days ago and has " + data.tickets[i].incident_count + " incidents");
        } else if (((sevenDays < createdAtTimeToString) === true) && (data.tickets[i].incident_count >= day7)) {
          console.log("Problem ID: " + data.tickets[i].id + " = TRENDING, created < 7 days ago and has " + data.tickets[i].incident_count + " incidents");
        } else if (((sevenDays < createdAtTimeToString) === false) && (data.tickets[i].incident_count > old)) {
          console.log("Problem ID: " + data.tickets[i].id + " was created > 7 days ago but it has > 20 incidents so it's important");
        } else {
          console.log("Problem ID: " + data.tickets[i].id + " = no big deal");
        }
      }
    }

    compareTimesTwo();

    },

    fetchProblemsFail: function() {
      console.log("something's wrong.");
    }

  };

}());