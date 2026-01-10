from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print('REGISTER ->')
resp = client.post('/auth/register', json={"email":"sme@example.com","password":"pass","role":"SME"})
print(resp.status_code, resp.json())

print('\nLOGIN ->')
resp_login = client.post('/auth/login', json={"email":"sme@example.com","password":"pass"})
print(resp_login.status_code, resp_login.json())

token = resp_login.json().get('access_token')
headers = {"Authorization": f"Bearer {token}"}
print('\nDECODING TOKEN ->')
from jose import jwt as _jwt
from app.core.config import SECRET_KEY, ALGORITHM
try:
	import datetime as _dt
	print('now ts:', int(_dt.datetime.utcnow().timestamp()))
	unverified = _jwt.get_unverified_claims(token)
	print('unverified claims:', unverified)
	payload = _jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
	print('payload:', payload)
except Exception as e:
	print('decode error:', e)

print('\nCREATE INVOICE ->')
resp_create = client.post('/invoices/', json={"invoice_number":"INV-001","amount":1000,"buyer_name":"Buyer A"}, headers=headers)
print(resp_create.status_code, resp_create.json())

invoice_id = resp_create.json().get('id')
print('\nSUBMIT INVOICE ->')
resp_submit = client.post(f'/invoices/{invoice_id}/submit', headers=headers)
print(resp_submit.status_code, resp_submit.json())
