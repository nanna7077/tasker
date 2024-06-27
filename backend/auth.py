import datetime
from hashlib import sha256
from flask_httpauth import HTTPTokenAuth

from models import *

auth = HTTPTokenAuth(scheme="Bearer", realm=None, header="Authentication")

@auth.verify_token
def verify_password(sessionkey):
    session = Session.query.filter_by(sessionkey=sessionkey).first()
    if not session or session.expiredOn < datetime.datetime.utcnow():
        return False
    account = User.query.filter_by(id=session.accountID).first()
    if not account:
        return False
    return True

@auth.error_handler
def handle401(error):
    return {"error": "UnAuthorized"}, 401

def createSession(accountID, deviceName, IPAddress):
    session = Session(
        sessionkey=sha256((str(accountID) + str(deviceName) + str(IPAddress) + str(datetime.datetime.utcnow())).encode()).hexdigest(),
        accountID=accountID,
        expiredOn=datetime.datetime.utcnow() + datetime.timedelta(days=120),
        deviceName=deviceName,
        IPAddress=IPAddress
    )
    db.session.add(session)
    db.session.commit()

    return session.sessionkey


def getRequestUser(sessionkey):
    requestsession = Session.query.filter_by(sessionkey=sessionkey).first()
    
    if not requestsession:
        return {"error": "Invalid SessionKey"}, 404
    if requestsession.expiredOn <= datetime.datetime.now():
        return {"error": "Session Expired"}, 401
    
    requestuser = User.query.filter_by(id=requestsession.accountID).first()
    if not requestuser:
        return {"error": "Account associated with SessionKey does not exist!"}, 404
    
    return requestuser
