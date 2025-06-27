from database import db
from datetime import datetime

# Association table for many-to-many relationship between games and tags
game_tags = db.Table('game_tags',
    db.Column('game_id', db.Integer, db.ForeignKey('game.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    bgg_id = db.Column(db.Integer)
    owner = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    min_players = db.Column(db.Integer)
    max_players = db.Column(db.Integer)
    playing_time = db.Column(db.Integer)
    complexity = db.Column(db.Float)
    image_url = db.Column(db.String(500))
    description = db.Column(db.Text)
    rank_overall = db.Column(db.Integer)
    rank_strategy = db.Column(db.Integer)
    rank_family = db.Column(db.Integer)
    price_new = db.Column(db.Float)  # Current retail price
    price_used = db.Column(db.Float)  # Used market price
    msrp = db.Column(db.Float)  # Manufacturer's suggested retail price
    personal_rating = db.Column(db.Float)  # User's personal rating 1-10
    acquisition_price = db.Column(db.Float)  # What user paid for it
    purchase_date = db.Column(db.DateTime)  # When user bought it
    rulebook_pdf = db.Column(db.String(500))  # Path to uploaded rulebook PDF
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sessions = db.relationship('GameSession', backref='game', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('Tag', secondary=game_tags, lazy='subquery', backref=db.backref('games', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'bgg_id': self.bgg_id,
            'owner': self.owner,
            'location': self.location,
            'min_players': self.min_players,
            'max_players': self.max_players,
            'playing_time': self.playing_time,
            'complexity': self.complexity,
            'image_url': self.image_url,
            'description': self.description,
            'rank_overall': self.rank_overall,
            'rank_strategy': self.rank_strategy,
            'rank_family': self.rank_family,
            'price_new': self.price_new,
            'price_used': self.price_used,
            'msrp': self.msrp,
            'personal_rating': self.personal_rating,
            'acquisition_price': self.acquisition_price,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'rulebook_pdf': self.rulebook_pdf,
            'tags': [tag.to_dict() for tag in self.tags],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sessions = db.relationship('GamePlayer', backref='player', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)
    photo_url = db.Column(db.String(500))  # Path to uploaded session photo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    players = db.relationship('GamePlayer', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'game_id': self.game_id,
            'game': self.game.to_dict() if self.game else None,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'photo_url': self.photo_url,
            'players': [gp.to_dict() for gp in self.players],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class GamePlayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('game_session.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    score = db.Column(db.Integer)
    is_winner = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'player': self.player.to_dict() if self.player else None,
            'score': self.score,
            'is_winner': self.is_winner
        }

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#3B82F6')  # Hex color code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    bgg_id = db.Column(db.Integer)
    priority = db.Column(db.String(20), default='medium')  # high, medium, low
    notes = db.Column(db.Text)
    price_target = db.Column(db.Float)  # Target price to buy at
    image_url = db.Column(db.String(500))
    complexity = db.Column(db.Float)
    min_players = db.Column(db.Integer)
    max_players = db.Column(db.Integer)
    playing_time = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'bgg_id': self.bgg_id,
            'priority': self.priority,
            'notes': self.notes,
            'price_target': self.price_target,
            'image_url': self.image_url,
            'complexity': self.complexity,
            'min_players': self.min_players,
            'max_players': self.max_players,
            'playing_time': self.playing_time,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }