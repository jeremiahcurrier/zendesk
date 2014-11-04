(function() { // This app doesn't scale to tens of thousands of users unless they have up several hours and won't close the browser window.
  return {

    users: [],

    requests: {

      url: function(url) {
        return {
          url: url
        };
      }
    },

    events: {
      'click .build': 'init'

    },

    init: function() {
      this.switchTo('loading');
      this.getAll('/api/v2/users.json', [], this.doWork);
    },

    buildList: function() { // Parse results of users in the account

      var data = this.users;

      var suspendedUsers = _.filter(data, function(user){ // Filter results of all users down to just suspended users
        return user.suspended === true;
      });

      console.log(suspendedUsers);

      this.switchTo('draw', {
        users: suspendedUsers
      });

    },

    getAll: function(url, data, fn) {
      if(data === null) {
        data = [];
      }
      if(url === null) {
      fn(data, this);
      } else {
      this.ajax('url', url).done(function(newdata){
      data = data.concat(newdata.users);
      this.getAll(newdata.next_page, data, fn);
      });
      }
    },

    doWork: function(data, that) {
      that.users = data;
      that.buildList();
    }

  };

}());