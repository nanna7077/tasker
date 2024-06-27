from hashlib import sha256
from flask import Blueprint, jsonify, request

from models import *
from auth import *

user_crud = Blueprint("user_crud", __name__)


@user_crud.route("/self") # View
@auth.login_required
def get_user():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        
        user = User.query.filter_by(id=getRequestUser(sessionkey).id).first()
        return jsonify({"user": user.to_dict()}), 200
    
    except Exception as e:
        return {"error": str(e)}

@user_crud.route("/register", methods=["POST"]) # Create
def register_user():
    try:
        requestData = request.get_json(force=True)

        username = requestData.get("username")
        email = requestData.get("email")
        password = requestData.get("password")
        if not username or not email or not password:
            return {"error": "Missing required fields"}, 400
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 409

        user = User(username=username, email=email, password_hash=sha256(password.encode()).hexdigest())
        db.session.add(user)
        db.session.commit()

        return jsonify({"user": user.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}


@user_crud.route("/login", methods=["POST"]) # Create - Session
def login_user():
    try:
        requestData = request.get_json(force=True)

        username = requestData.get("username")
        password = requestData.get("password")
        if not username or not password:
            return {"error": "Missing required fields"}, 400
        user = User.query.filter_by(username=username).first()
        if not user or user.password_hash != sha256(password.encode()).hexdigest():
            return {"error": "Invalid username or password"}, 401

        session = createSession(user.id, user.username, request.remote_addr)
        return jsonify({"session": session}), 200

    except Exception as e:
        return {"error": str(e)}


@user_crud.route("/logout") # Delete
@auth.login_required
def logout_user():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        session = Session.query.filter_by(sessionkey=sessionkey).first()
        if not session:
            return {"error": "Invalid SessionKey"}, 401
        session.expiredOn = datetime.datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Successfully logged out"}), 200

    except Exception as e:
        return {"error": str(e)}


@user_crud.route("/update", methods=["POST"]) # Update
@auth.login_required
def update_user():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = User.query.filter_by(id=getRequestUser(sessionkey).id).first()
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        requestData = request.get_json(force=True)

        username = requestData.get("username")
        email = requestData.get("email")
        if username:
            user.username = username
        if email:
            user.email = email
        db.session.commit()
        return jsonify({"user": user.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}