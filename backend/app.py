import os
from flask import Flask
from flask_cors import CORS
from models import db, User

from tasks_crud import tasks_crud
from user_crud import user_crud

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.urandom(40)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_BINDS"] = {}

db.init_app(app)

try:
    User.first()
except:
    with app.app_context():
        db.create_all()

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def index():
    """
    Hello World Index Page
    """
    return {"message": "Hello World!"}, 200

app.register_blueprint(tasks_crud, url_prefix="/tasks")
app.register_blueprint(user_crud, url_prefix="/user")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=58673, debug=True)