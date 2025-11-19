# models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)  # 注意：这里不加密，但强烈建议在生产环境使用哈希
    role = db.Column(db.String(10), default='normal')  # 'normal' 或 'admin'
    score = db.Column(db.Integer, default=1500)
    wins = db.Column(db.Integer, default=0)
    draws = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<User {self.username}>'

    @property
    def serialize(self):
        """返回序列化的用户数据，用于JSON响应"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'score': self.score,
            'wins': self.wins,
            'draws': self.draws,
            'losses': self.losses
        }