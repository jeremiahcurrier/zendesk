<?php

require 'vendor/autoload.php';
use Zendesk\API\Client as ZendeskAPI;

ini_set('display_errors', 0);
error_reporting(0);

$subdomain = "";
$username = "";
$token = "";

$client = new ZendeskAPI($subdomain, $username);
$client->setAuth('token', $token);

$input = array( 
    'subject' => 'Test Ticket', 
    'type' => 'problem', 
    'priority' => 'low', 
    'description' => 'Test', 
    'external_id' => '25', 
    'status' => 'new', 
    'assignee_id' => '', 
    'requester' => array( 
        "name"=>'Name', 
        "email" => 'email@asdfasdfasdfasdf.com'
    ) 
);

$newTicket = $client->tickets()->create($input);

$ticket_info = $newTicket->ticket; 

echo var_dump($ticket_info);
?>