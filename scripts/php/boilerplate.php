<?php
define("ZDAPIKEY", "0zponz0i380uNyuqYAobtydqAwxPqcVP7r9RPy7s");
define("ZDUSER", "jcurrier@zendesk.com");
define("ZDURL", "https://rfc.zendesk.com/api/v2");
 
/* Note: do not put a trailing slash at the end of v2 */

$subject = "Test ticket created via PHP script!";
$body = "This is the comment on the ticket.";
$payload = array('ticket' => array('subject' => $subject, 'comment' => array('body' => $body)));

$json = json_encode($payload);
 
function curlWrap($url, $json, $action)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 10 );
    curl_setopt($ch, CURLOPT_URL, ZDURL.$url);
    curl_setopt($ch, CURLOPT_USERPWD, ZDUSER."/token:".ZDAPIKEY);
    switch($action){
        case "POST":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
        case "GET":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
            break;
        case "PUT":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
        case "DELETE":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
            break;
        default:
            break;
    }
 
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
    curl_setopt($ch, CURLOPT_USERAGENT, "MozillaXYZ/1.0");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $output = curl_exec($ch);
    curl_close($ch);
    $decoded = json_decode($output);
    return $decoded;
}
    
    $data = curlWrap("/tickets.json", $json, "POST");
?>