(function() {

  return {

    // defaultState: 'spinner',

    // THE CODE NEEDS TO GET SOME 'DRY' ACTION - BADLY.

    events: {
      'app.activated' : 'buildLink',
      'ticket.custom_field_{{reference_field_id}}.changed' : 'dataChanged'
    },

    buildLink: function() {

      var currentAccount = this.currentAccount(),
          subdomain = currentAccount.subdomain(),
          ticket = this.ticket(),
          z = this.setting('id'), // id of custom drop down field used
          t = ticket.customField("custom_field_" + z), // custom field from settings
          a = 'api', // Related API article: https://rfc.zendesk.com/hc/en-us/articles/203251130-API-API-API-ALL-DAY
          b = 'apps', // Related APPS article: https://rfc.zendesk.com/hc/en-us/articles/203016354-APPS-APPS-APPS-ALL-DAY
          c = 'sso'; // Related SSO article: https://rfc.zendesk.com/hc/en-us/articles/203016364-SSO-SSO-SSO-ALL-DAY

      if (t === a) {
        this.switchTo('results', {
          flowchart: a,
          subdomain: subdomain, 
          article: 203251130
        });
      } else if (t === b) {
        this.switchTo('results', {
          flowchart: b,
          subdomain: subdomain,
          article: 203016354
        });
      } else if (t === c) {
        this.switchTo('results', {
          flowchart: c,
          subdomain: subdomain,
          article: 203016364
        });
      }

    },

    dataChanged: function() {
      var currentAccount = this.currentAccount(),
          subdomain = currentAccount.subdomain(),
          ticket = this.ticket(),
          z = this.setting('id'),
          t = ticket.customField("custom_field_" + z),
          a = 'api', // Related API article: https://rfc.zendesk.com/hc/en-us/articles/203251130-API-API-API-ALL-DAY
          b = 'apps', // Related APPS article: https://rfc.zendesk.com/hc/en-us/articles/203016354-APPS-APPS-APPS-ALL-DAY
          c = 'sso'; // Related SSO article: https://rfc.zendesk.com/hc/en-us/articles/203016364-SSO-SSO-SSO-ALL-DAY

      if (t === a) {
        this.switchTo('results', {
          flowchart: a,
          subdomain: subdomain, 
          article: 203251130
        });
      } else if (t === b) {
        this.switchTo('results', {
          flowchart: b,
          subdomain: subdomain,
          article: 203016354
        });
      } else if (t === c) {
        this.switchTo('results', {
          flowchart: c,
          subdomain: subdomain,
          article: 203016364
        });
      }
      console.log("The value for custom field id: z now has a value of: " + t);
    }
  };

}());
