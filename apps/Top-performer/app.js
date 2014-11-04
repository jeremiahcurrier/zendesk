(function() {

  function asTwoDigits(number) { // formats number to a two digit output
    number = '' + number;
    if (number.length === 1) { number = '0' + number; } // starts number at 1 instead of 0
    return number;
  }

  function todayFormatted() { // formats the date to use in search API call
    var now = new Date(),
        month = now.getMonth() + 1;
    return now.getFullYear() + '-' + asTwoDigits(month) + '-' + asTwoDigits(now.getDate());
  }

  return {
    events: {
      'app.activated': 'start', // initialize 'start' function that calls the 'solvedTodayByMe' function
      'solvedTodayByMe.done': 'renderCountMe' // when 'solvedTodayByMe' is finished do 'renderCountMe' function
    },

    requests: { // AJAX Query using search API for all tickets solved by currently logged in agent today
      solvedTodayByMe: function() {
        return {
          url: '/api/v2/search.json?query=assignee:me+status:solved+solved:' + todayFormatted(),
          dataType: 'json',
          type: 'GET'
        };
      }
    },

    start: function() {
      this.ajax('solvedTodayByMe');
    },

    renderCountMe: function(searchResults) {
      var currentUser = this.currentUser();
      var name = currentUser.name();
      var count = searchResults.count; // counts value returned in array from search API query
      if (count <= 2) {
        this.switchTo('show', { count: count, text: "slacker...", color: "red", name: name });
      } else if (count >= 3  && count <= 10 ) {
        this.switchTo('show', { count: count, text: "keep going...", color: "yellow", name: name });
      } else {
        this.switchTo('show', { count: count, text: "great job!", color: "green", name: name });
      }      
  }
};

}());







    
