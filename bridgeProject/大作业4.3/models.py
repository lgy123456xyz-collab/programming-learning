# models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users' 
    
    id = db.Column(db.String, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False) 
    role = db.Column(db.String(20), default='user') # 角色默认为 user
    
    rating = db.Column(db.Integer, default=1800)
    games = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    ties = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'rating': self.rating,
            'games': self.games,
            'wins': self.wins,
            'ties': self.ties,
            'losses': self.losses
        }

class MatchRecord(db.Model):
    __tablename__ = 'match_records' 
    
    id = db.Column(db.Integer, primary_key=True)
    
    ns1_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    ns2_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    ew1_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    ew2_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    
    ns_rating_change = db.Column(db.Integer, nullable=False)
    ew_rating_change = db.Column(db.Integer, nullable=False)
    
    score_diff = db.Column(db.Integer, nullable=False) 
    
    ns_old_rating = db.Column(db.Integer, nullable=True) 
    ew_old_rating = db.Column(db.Integer, nullable=True) 
    
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'ns1_id': self.ns1_id,
            'ew1_id': self.ew1_id,
            'ns_rating_change': self.ns_rating_change,
            'ew_rating_change': self.ew_rating_change,
            'score_diff': self.score_diff,
            'recorded_at': self.recorded_at.isoformat()
        }
    
class PendingRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenger = db.Column(db.String(80), nullable=False)
    opponent = db.Column(db.String(80), nullable=False)
    result_S = db.Column(db.Float, nullable=False)
    submitted_by = db.Column(db.String(80), nullable=False) 
    status = db.Column(db.String(20), default='Pending')    # Pending, Approved, Rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)