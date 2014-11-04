=begin
This script creates a CSV of all the users in the specified account(s).
CSV fields include the user's ID, their name, their role, and their last login time.
This uses the Users endpoint. More info at http://developer.zendesk.com/documentation/rest_api/users.html

Rachel Wolthuis
Zendesk
March 2014
=end

require 'open-uri'
require 'json'
require 'csv'
require 'progress_bar'
 
class Export

  ACCOUNTS = [
    # account one
    {
      :subdomain => '<domain>', #eg: 'support' if url is support.zendesk.com
      :email     => '<email address>', #email address of admin
      :api_token => '<token>' #account API token
    }
    #uncomment the block below to add another account.
    #the block can be compied and pasted

    # ,# account two
    # {
    #   :subdomain => '<domain>',
    #   :email     => '<email address>',
    #   :api_token => '<token>'
    # }
  ]
 
  def initialize
  end
 
  def fetch!
    ACCOUNTS.each do |account|
      puts "-- Running report for #{account[:subdomain]}.zendesk.com ---"
      get_data_for(account)
    end
  end
 
  def get_data_for(account)
    subdomain = account[:subdomain]
    email     = account[:email]
    token     = account[:api_token]
 
    url = "https://#{subdomain}.zendesk.com/api/v2/users.json?role[]=admin&role[]=agent"
    result = open(url, :http_basic_authentication => ["#{email}/token", token])
 
    users_array = JSON.parse(result.read)["users"]
 
    data = users_array.map do |user|
      {
        :id => user['id'],
        :name => user['name'],
        :role => user['role'],
        :last_login_at => user['last_login_at']
      }
    end
 
    # file creation save to CSV
    time = Time.now.strftime("%d-%m-%Y")
    bar = ProgressBar.new(data.length)
    file = "#{subdomain}_Agent_Report_#{time}.csv"
    CSV.open("#{file}", "w") do |csv| #open new file for write
      csv << ["id", "name", "role", "last_login"]
      data.each do |hash| #open json to parse
        csv << hash.values #write value to file

        sleep 0.1 #progress bar
        bar.increment!
      end
    end
    puts "-- #{file} created! --" #file is created in the same directory the script is ran
 
  end
end
 
 
run = Export.new
run.fetch!