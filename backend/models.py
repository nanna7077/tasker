from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(600), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }
    
class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    due_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0) # 0 - Not started, 1 - In progress, 2 - Completed, -1 - Discarded
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return '<Task %r>' % self.title
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.due_at else 'N/A',
            "status": self.status,
            "due_at": self.due_at.strftime("%Y-%m-%d %H:%M") if self.due_at else 'N/A'
        }
    
    def to_mini_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "due_at": self.due_at.strftime("%Y-%m-%d %I:%M %P") if self.due_at else 'N/A'
        }

class Session(db.Model):
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    sessionkey = db.Column(db.String(80), unique=True, nullable=False)
    accountID = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expiredOn = db.Column(db.DateTime, nullable=False)
    deviceName = db.Column(db.String(80), nullable=False)
    IPAddress = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return '<Session %r>' % self.sessionkey