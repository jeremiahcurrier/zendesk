(function() {

  return {

    resources: {
      PER_PAGE: 25,
      FILTERS: {}
    },

    events: {
      'pane.activated':'init',

      // User events
      'click .pagi': 'handlePageClick',
      'click .btn' : 'generateTrending',
      'change #filter_dropdown': 'handleFilterChange',

      // AJAX events
      'retrieveFieldOptions.done': 'handleFieldResponse'
    },

    requests: {
      retrieveProblems: function(page){
        return {
          url: helpers.fmt('/api/v2/problems.json?include=incident_counts&page=%@', page)
        };
      },
      retrieveIncidents: function(id, page){
        return {
          url: helpers.fmt('/api/v2/problems/%@/incidents.json&page=%@', page)
        };
      },
      retrieveFieldOptions: function(id){
        return {
          url: helpers.fmt('/api/v2/ticket_fields/%@.json', id)
        };
      }
    },

    /* event and data handlers */

    init: function () {
      var filterField = this.setting('filterField');

      if (_.isEmpty(this.resources.FILTERS)) {
        this.ajax('retrieveFieldOptions', filterField);
      } else {
        this.getProblems();
      }
    },

    getProblems: function() { // send a series of requests
      this.switchTo('loading'); // Hi James. I added this so the screen is not just white before the "problem_list.hdbs" file is rendered.
      var problems = this._paginate( { request: 'retrieveProblems',
                                       entity:  'tickets' } );
      problems
        .done(_.bind(function(data){
          this.store('problems', data);
          this.generatePage(1, null);
        }, this))
        .fail(function(){
          console.log('Failed');
        });
    },

    processData: function (data) { // combine pages of data into single array, only grab certain keys
      var desiredKeys = [ 'id',
                          'url',
                          'subject',
                          'description',
                          'assignee_id',
                          'created_at',
                          'updated_at',
                          'incident_count',
                          'priority',
                          'status',
                          'tags' ];

      var processed = _.chain(data)
                       .flatten()
                       .map(function(problem){ return _.pick(problem, desiredKeys); })
                       .value();

      return processed;
    },

    sortData: function (data, sortName) {
      var sort = JSON.parse(this.setting('sorts'))[sortName],
          sorted = _.sortBy(data, function(item){ // use underscore's 'stable sort'
        if (_.isObject(sort.criteria)) {
          var itemValue = item[sort.criteria.name];
          return sort.criteria.map[itemValue];
        } else {
          return item[sort.criteria];
        }
      });
      if (sort.order === "desc") { // reverse descending sorts
        return sorted.reverse();
      } else {
        return sorted;
      }
    },

    generatePage: function(pageNo, filterName){
      var problems = this.store('problems'),
          processed = this.processData(problems),
          filters = this.resources.FILTERS,
          data = this.sortData(this.filterData(processed, filterName), 'priority'), // todo remove hardcoded sort
          totalPages = Math.ceil(data.length / this.resources.PER_PAGE);

      this.switchTo('problem_list', { ticketsInfo: data.slice(this.resources.PER_PAGE * (pageNo - 1), this.resources.PER_PAGE * pageNo),
                                      pages      : _.range(1, totalPages + 1),
                                      filters    : filters });
    },

    handlePageClick: function(event){
      event.preventDefault();
      var pageNo = event.currentTarget.textContent;
      this.generatePage(pageNo, null);
    },

    handleFieldResponse: function(data){
      this.resources.FILTERS = this._prepareOptions(data);
      this.getProblems();
    },

    handleFilterChange: function(event) {
      var filterName = this.$('#filter_dropdown option:selected').val();
      this.generatePage(1, filterName);
    },

    filterData: function(problems, filterName) {
      if (!filterName) {
        return problems;
      }
      return _.filter(problems, function(problem){
        return problem.tags.indexOf(filterName) > -1;
      });
    },

    /* utility functions */

    _prepareOptions: function(data) {
      var options = data.ticket_field.custom_field_options;
      return _.map(options, function(option){
        return { tag : option.value,
                 name: option.name.split('::').join(' > ') };
      });
    },

    _paginate: function(a) { // create and return a of promises
      var results = [],
          initialRequest = this.ajax(a.request, 1);

      var allPages = initialRequest.then(function(data){
        results.push(data[a.entity]);
        var nextPages = [];
        var pageCount = Math.ceil(data.count / 100);
        for (; pageCount > 1; --pageCount) {
          nextPages.push(this.ajax(a.request, pageCount));
        }
        return this.when.apply(this, nextPages).then(function(data){
          var entities = _.chain(arguments)
                          .flatten()
                          .filter(function(item){
                            return (_.isObject(item) && _.has(item, a.entity));
                          })
                          .map(function(item){
                            return item[a.entity];
                          })
                          .value();
          results.push(entities);
        }).then(function(){
          return _.chain(results)
                  .flatten()
                  .compact()
                  .value();
          });
        });
      return allPages;
    },

    generateTrending: function() {

      var data = this.store('problems'),
      // Time variables
          timeDateRightNow = Date.now(),      // Time right now in ms (UTC)
          oneDays = Date.now() - 86400000,    // 86400000 ms in 24 hours
          threeDays = Date.now() - 259200000, // 259200000 ms in 72 hours
          sevenDays = Date.now() - 604800000, // 604800000 ms in 168 hours
      // Parameter Settings Variables
          day1 = parseInt(this.setting('one'), 10),
          day3 = parseInt(this.setting('three'), 10),
          day7 = parseInt(this.setting('seven'), 10),
          old = parseInt(this.setting('older'), 10),
          trendingArray = [],
          importantArray = [],
          filters = this.resources.FILTERS;

      function compareTimesTwo() {

        for ( var i = 0 ; i < data.length ; i++ ) { // Loop through all problem tickets returned from AJAX request that happened in the "getProblems" function

          var createdAtTimeToString = Date.parse(data[i].created_at);

          if (((oneDays < createdAtTimeToString) === true) && (data[i].incident_count >= day1)) { // this needs to be DRYed out - but how?
            trendingArray.push({ // Build on array of TRENDING problem tickets
              id: data[i].id,
              subject: data[i].subject,
              incidents: data[i].incident_count
            });
          } else if (((threeDays < createdAtTimeToString) === true) && (data[i].incident_count >= day3)) {
            trendingArray.push({ // Build on array of TRENDING problem tickets
              id: data[i].id,
              subject: data[i].subject,
              incidents: data[i].incident_count
            });
          } else if (((sevenDays < createdAtTimeToString) === true) && (data[i].incident_count >= day7)) {
            trendingArray.push({ // Build on array of TRENDING problem tickets
              id: data[i].id,
              subject: data[i].subject,
              incidents: data[i].incident_count
            });
          } else if (((sevenDays < createdAtTimeToString) === false) && (data[i].incident_count > old)) {
            importantArray.push({ // Build on array of IMPORTANT problem tickets
              id: data[i].id,
              subject: data[i].subject,
              incidents: data[i].incident_count
            });
          }
        }
      }

      compareTimesTwo();

      var html = this.renderTemplate('trending', { // Declare variable that renders the "trending.hdbs" template file
        trending  : trendingArray,
        important : importantArray,
        filters   : filters
      });

      this.$('div.buttonHolder').html(html); // replace my "GET Trending & Important Problem Tickets" button with contents of the "trending.hdbs" template file

    }
  };

}());
