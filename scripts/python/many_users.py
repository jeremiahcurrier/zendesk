import requests
import time
import json
s = requests.Session()
s.headers.update({'Content-Type': 'application/json'})
s.auth = ('username/token','apikey')

for x in range(1, 3000000):
	payload = '{"user": {"name": "User'+str(x)+'", "email": "somegmail+'+str(x)+'@gmail.com","verified": true}}'
	print payload
	r = s.post("https://SUBDOMAIN.zendesk.com/api/v2/users.json", data=payload)
	print "Request completed with response " + str(r.status_code)