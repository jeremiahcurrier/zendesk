=begin
This script will suspend all Agents and Admins (non-owners) in the account(s) listed.
This uses the Users endpoint. More info at http://developer.zendesk.com/documentation/rest_api/users.html

Rachel Wolthuis
Zendesk
April 2014
=end

require 'zendesk_api'
require 'open-uri'
require 'json'
require 'progress_bar'

class Suspend

  ACCOUNTS = [
    # account one
    {
      :subdomain => '<subdomain>', #eg: 'support' if url is support.zendesk.com
      :email     => '<email>', #email address of admin
      :api_token => '<token>', #account API token
      :owner_id  => <user_id> #user_id for the owner of the account
    }
    # uncomment the block below to add another account.
    # the block can be copied and pasted

    # ,# account two
    # {
    #   :subdomain => '<domain>',
    #   :email     => '<email address>',
    #   :api_token => '<token>',
    #   :owner_id  => '<user_id>'
    # }
  ]

  def initialize
  end

  def fetch!
    # Runs the get_agents_for and suspend_agents_for
    # blocks for each account listed above
    ACCOUNTS.each do |account|
      puts "-- Creating a list of agents & admins to suspend on #{account[:subdomain]}.zendesk.com --"
      agents = get_agents_for(account)
      puts "-- #{agents.length} agents & admins to be suspended on #{account[:subdomain]}.zendesk.com --"
      suspend_agents_for(account, agents)
    end
  end

  def get_agents_for(account)
    subdomain = account[:subdomain]
    email     = account[:email]
    token     = account[:api_token]

    # reads the first page of results from the URL below
    # and assigns the returned users to the users_array
    # next_page gets assigned nil (if no next page) or a string of the next page's URL
    url = "https://#{subdomain}.zendesk.com/api/v2/users.json?role[]=agent&role[]=admin"
    result = open(url, :http_basic_authentication => ["#{email}/token", token])
    returned = JSON.parse(result.read)
    next_page = returned['next_page']
    users_array = returned['users']

    # while next_page has a URL the following pages are called
    # and their returned users are added to the users_array
    while (next_page != nil)
      result_next = open(next_page, :http_basic_authentication => ["#{email}/token", token])
      returned_next = JSON.parse(result_next.read)
      next_page = returned_next['next_page']
      
      returned_next['users'].each do |user|
        users_array << user
      end
      
    end

    return users_array # returns an array of users to be run on suspend_agents_for
  end

  # This block changes the suspend state to true/false for
  # all users in the users_array created in get_agents_for
  def suspend_agents_for(account, agents)
    subdomain = account[:subdomain]
    email     = account[:email]
    token     = account[:api_token]
    owner     = account[:owner_id]
    bar       = ProgressBar.new(agents.length) # progress bar
    suspended_agents = 0 # counter for *actual* suspended users

    # credentials needed to connect using the zendesk_api gem
    client = ZendeskAPI::Client.new do |config|
      config.url = "https://#{subdomain}.zendesk.com/api/v2"
      config.username = "#{email}/token"
      config.token = token
    end

    puts "-- Suspending all admins & agents on #{account[:subdomain]}.zendesk.com --"

    agents.each do |agent|
      # verifies user is not and end-user (not critical but nice to check)
      # or the owner of the account (using the user_id inputed on line 23)
      if(agent['role'] != 'end-user' && agent['id'] != owner)
        # To do a PUT,
        # first GET the item to change,
        # make changes
        # then save
        found_user = client.users.find(:id => agent['id']) # GETs the user by id from user_arry
        found_user.suspended = true # changes suspend to true
        found_user.save # save the new state of the user

        suspended_agents += 1 # *actual* suspend count
      else
        puts "!! User #{agent['id']} is an end-user or the Owner. User skipped. !!"
      end
        sleep 0.1 # progress bar
        bar.increment! 
    end
    puts "-- #{suspended_agents} admins & agents on #{account[:subdomain]}.zendesk.com have been suspended --"

  end

end

run = Suspend.new
run.fetch!