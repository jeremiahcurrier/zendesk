(function() {

  return {
    requests: {
        fetchUser: function () {
            var currentUser = this.currentUser();
            var currentUserID = currentUser.id();
            return {
                url: '/api/v2/users/' + currentUserID + '.json',
                type: 'GET',
            };
        }
    },
    events: {
      'app.activated':'minRead',
      'fetchUser.done': 'success',
      'fetchUser.fail': 'failure'
    },
    success: function(data) {
        console.log(data.user.user_fields.words_per_minute);
    },
    failure: function(data) {
        console.log("FAIL");
    },
     minRead: function() {
        var wordsPerMinute = this.setting('endUserSpeed'), // how fast most people can read on a monitor according to [Wikipedia](http://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension)
            currentComment = this.comment().text(), // the text of the current comment being entered
            words = currentComment.split(' '), // substring array of each word in the comment
            length = words.length, // size of the array
            time = length / wordsPerMinute, // how many minutes to read floating point integer
            minutes = Math.round(time), // how many minutes to read rounded up to nearest integer
            string;
        if (minutes < 1) {
            string = 'less than 1';
        } else {
            string = minutes;
        }
        this.switchTo('show', {
            minReadRounded: string,
        });
        var string2,
            ticket = this.ticket(),
            ticketComments = ticket.comments(),
            ticketCommentsMap = _.map(ticketComments, function(comment){ return comment.value(); }), // array of substrings where each substring is an entire comment on the ticket
            ticketCommentsMapJoined = ticketCommentsMap.join(), // turn ticketCommentsMap into an entire string of all comments together
            ticketCommentsMapJoinedSplit = ticketCommentsMapJoined.split(' '), // turn ticketCommentsMapJoined into array of substrings, all words
            ticketCommentsMapJoinedSplitSize = ticketCommentsMapJoinedSplit.length, // number of substrings/words in ticketCommentsMapJoinedSplit
            test2 = ticketCommentsMapJoinedSplitSize / this.setting('agentSpeedDefault'), // how many minutes to read floating point integer
            minReadRoundedAll = Math.round(test2); // how many minutes to read rounded up to nearest integer
        if (minReadRoundedAll < 1) {
            string2 = 'less than 1';
        } else {
            string2 = minReadRoundedAll;
        }
        this.switchTo('show', {
            minReadRounded: string,
            minReadRoundedAll: string2,
        });
        // this.ajax('fetchUser');
    }
};
}());
