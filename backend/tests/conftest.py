"""
Pytest configuration and shared fixtures for Board Game Tracker backend tests.
"""
import pytest
import tempfile
import os
import sys
from datetime import datetime

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import db
from models import Game, Player, GameSession, GamePlayer, Tag, WishlistItem


@pytest.fixture(scope='session')
def test_app():
    """Create application for testing."""
    # Create a temporary file for the test database
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(app.config['DATABASE'])


@pytest.fixture(scope='function')
def client(test_app):
    """Create a test client."""
    return test_app.test_client()


@pytest.fixture(scope='function')
def app_context(test_app):
    """Create an application context."""
    with test_app.app_context():
        yield test_app


@pytest.fixture(scope='function')
def clean_db(app_context):
    """Provide a clean database for each test."""
    db.create_all()
    yield db
    db.session.remove()
    db.drop_all()


@pytest.fixture
def sample_game(clean_db):
    """Create a sample game for testing."""
    game = Game(
        name="Test Game",
        bgg_id=123456,
        owner="Test Owner",
        location="Test Shelf",
        min_players=2,
        max_players=4,
        playing_time=60,
        complexity=2.5,
        description="A test game for testing purposes",
        personal_rating=8.0,
        acquisition_price=49.99,
        purchase_date=datetime(2023, 1, 15)
    )
    db.session.add(game)
    db.session.commit()
    return game


@pytest.fixture
def sample_player(clean_db):
    """Create a sample player for testing."""
    player = Player(name="Test Player")
    db.session.add(player)
    db.session.commit()
    return player


@pytest.fixture
def sample_session(clean_db, sample_game):
    """Create a sample game session for testing."""
    session = GameSession(
        game_id=sample_game.id,
        date=datetime(2023, 6, 15, 19, 30),
        notes="Test session notes"
    )
    db.session.add(session)
    db.session.commit()
    return session


@pytest.fixture
def sample_game_player(clean_db, sample_session, sample_player):
    """Create a sample game player record for testing."""
    game_player = GamePlayer(
        session_id=sample_session.id,
        player_id=sample_player.id,
        score=85,
        is_winner=True
    )
    db.session.add(game_player)
    db.session.commit()
    return game_player


@pytest.fixture
def sample_tag(clean_db):
    """Create a sample tag for testing."""
    tag = Tag(
        name="Strategy",
        color="#FF5733"
    )
    db.session.add(tag)
    db.session.commit()
    return tag


@pytest.fixture
def sample_wishlist_item(clean_db):
    """Create a sample wishlist item for testing."""
    item = WishlistItem(
        name="Wishlist Game",
        bgg_id=789012,
        priority="high",
        notes="Want this game badly",
        price_target=39.99,
        min_players=1,
        max_players=2,
        playing_time=45,
        complexity=2.0
    )
    db.session.add(item)
    db.session.commit()
    return item


@pytest.fixture
def sample_games_collection(clean_db):
    """Create a collection of sample games for testing filtering/sorting."""
    games = [
        Game(
            name="Light Strategy Game",
            owner="Alice",
            min_players=2,
            max_players=4,
            playing_time=30,
            complexity=1.5,
            personal_rating=7.5
        ),
        Game(
            name="Heavy Strategy Game", 
            owner="Bob",
            min_players=1,
            max_players=2,
            playing_time=120,
            complexity=4.2,
            personal_rating=9.0
        ),
        Game(
            name="Party Game",
            owner="Alice", 
            min_players=4,
            max_players=8,
            playing_time=45,
            complexity=1.0,
            personal_rating=6.5
        )
    ]
    
    for game in games:
        db.session.add(game)
    db.session.commit()
    return games


@pytest.fixture
def mock_bgg_response():
    """Mock BGG scraper response data."""
    return {
        'name': 'Mocked Game',
        'min_players': 2,
        'max_players': 4,
        'playing_time': 60,
        'complexity': 2.8,
        'image_url': 'https://example.com/image.jpg',
        'description': 'A mocked game for testing',
        'rankings': {
            'overall': 150,
            'strategy': 75
        }
    }


@pytest.fixture
def mock_ai_suggestion():
    """Mock AI suggestion response."""
    return {
        'suggested_game': 'Test Game',
        'reason': 'This game is perfect for your group because it supports the right number of players and has moderate complexity.'
    }


# Test data constants
VALID_GAME_DATA = {
    'name': 'New Test Game',
    'owner': 'Test Owner',
    'location': 'Test Location',
    'bgg_id': 654321,
    'min_players': 2,
    'max_players': 6,
    'playing_time': 90,
    'complexity': 3.2,
    'personal_rating': 8.5,
    'acquisition_price': 59.99,
    'purchase_date': '2023-06-01T00:00:00'
}

VALID_SESSION_DATA = {
    'date': '2023-06-15T19:30:00',
    'notes': 'Great game night!',
    'players': [
        {'name': 'Player 1', 'score': 95, 'is_winner': True},
        {'name': 'Player 2', 'score': 87, 'is_winner': False},
        {'name': 'Player 3', 'score': 92, 'is_winner': False}
    ]
}

VALID_WISHLIST_DATA = {
    'name': 'Desired Game',
    'bgg_id': 111222,
    'priority': 'medium',
    'notes': 'Looks interesting',
    'price_target': 45.00
}