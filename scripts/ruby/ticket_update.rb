=begin
This script will update a specified ticket with a defined number of comments.
This uses the Tickets endpoint. More info at http://developer.zendesk.com/documentation/rest_api/tickets.html

! This doesn't account for rate limiting yet !

Rachel Wolthuis
Zendesk
May 2014
=end

require 'zendesk_api'
require 'progress_bar'

def update_tickets_for
  #########################
  # Insert your info here #
  #########################
  subdomain   = '<subdomain>' # eg: 'support' if url is support.zendesk.com
  email       = '<email>' # email address of admin
  token       = '<token>' # account API token
  ticket_num  = <ticket_num> # ticket to update
  update_num  = <update_num> # number of updates to the ticket

  bar = ProgressBar.new(update_num) # progress bar
  updated_tickets = 1 # counter for *actual* updated tickets

  # credentials needed to connect using the zendesk_api gem
  client = ZendeskAPI::Client.new do |config|
    config.url = "https://#{subdomain}.zendesk.com/api/v2"
    config.username = "#{email}/token"
    config.token = token
  end

  puts "-- Updating ticket ##{ticket_num} on #{subdomain}.zendesk.com with #{update_num} update(s) --"

  while (updated_tickets <= update_num)
    # To do a PUT
    # 1. GET the item to change
    # 2. make changes
    # 3. save
    found_ticket = client.tickets.find(:id => ticket_num) # GETs the specified ticket
    found_ticket.comment = {:public => false, :value => "This is update number #{updated_tickets}" }
    found_ticket.save # saves the new state of the ticket

    updated_tickets += 1 # *actual* update count

    sleep 0.1 # progress bar
    bar.increment! 
  end
  puts "-- #{updated_tickets - 1} update(s) complete! --"

end

update_tickets_for # runs the block above