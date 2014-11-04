#!/usr/bin/python

import requests, json, os

################################################################
## USERS
################################################################

# Get All Users
get_users_url = 'https://SUBDOMAIN.zendesk.com/api/v2/users.json'
headers = {'Accept':'application/json'}
get_users = requests.get(get_users_url, auth=(os.environ['ZD_USER'], os.environ['ZD_PASS']), headers=headers)
print get_users.headers
print get_users.text