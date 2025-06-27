"""
Unit tests for SQLAlchemy models.
"""
import pytest
from datetime import datetime

from models import Game, Player, GameSession, GamePlayer, Tag, WishlistItem


class TestGameModel:
    """Test the Game model."""
    
    def test_game_creation(self, clean_db):
        """Test creating a new game."""
        game = Game(
            name="Test Game",
            owner="Test Owner",
            location="Shelf A",
            bgg_id=123456,
            min_players=2,
            max_players=4,
            playing_time=60,
            complexity=2.5,
            description="A great game",
            personal_rating=8.0,
            acquisition_price=49.99
        )
        
        clean_db.session.add(game)
        clean_db.session.commit()
        
        assert game.id is not None
        assert game.name == "Test Game"
        assert game.owner == "Test Owner"
        assert game.min_players == 2
        assert game.max_players == 4
        assert game.complexity == 2.5
        
    def test_game_to_dict(self, sample_game):
        """Test game serialization to dictionary."""
        game_dict = sample_game.to_dict()
        
        assert game_dict['id'] == sample_game.id
        assert game_dict['name'] == "Test Game"
        assert game_dict['owner'] == "Test Owner"
        assert game_dict['bgg_id'] == 123456
        assert game_dict['min_players'] == 2
        assert game_dict['max_players'] == 4
        assert game_dict['complexity'] == 2.5
        assert game_dict['personal_rating'] == 8.0
        assert 'tags' in game_dict
        assert isinstance(game_dict['tags'], list)
        
    def test_game_required_fields(self, clean_db):
        """Test that name and owner are required."""
        # Test missing name
        with pytest.raises(Exception):
            game = Game(owner="Test Owner")
            clean_db.session.add(game)
            clean_db.session.commit()
            
        # Test missing owner  
        with pytest.raises(Exception):
            game = Game(name="Test Game")
            clean_db.session.add(game)
            clean_db.session.commit()
            
    def test_game_relationships(self, sample_game, clean_db):
        """Test game relationships with sessions and tags."""
        # Test sessions relationship
        session = GameSession(
            game_id=sample_game.id,
            date=datetime.now()
        )
        clean_db.session.add(session)
        clean_db.session.commit()
        
        assert len(sample_game.sessions) == 1
        assert sample_game.sessions[0].id == session.id
        
        # Test tags relationship
        tag = Tag(name="Strategy")
        clean_db.session.add(tag)
        sample_game.tags.append(tag)
        clean_db.session.commit()
        
        assert len(sample_game.tags) == 1
        assert sample_game.tags[0].name == "Strategy"


class TestPlayerModel:
    """Test the Player model."""
    
    def test_player_creation(self, clean_db):
        """Test creating a new player."""
        player = Player(name="Test Player")
        clean_db.session.add(player)
        clean_db.session.commit()
        
        assert player.id is not None
        assert player.name == "Test Player"
        assert player.created_at is not None
        
    def test_player_to_dict(self, sample_player):
        """Test player serialization."""
        player_dict = sample_player.to_dict()
        
        assert player_dict['id'] == sample_player.id
        assert player_dict['name'] == "Test Player"
        assert 'created_at' in player_dict
        
    def test_player_unique_name(self, clean_db):
        """Test that player names must be unique."""
        player1 = Player(name="Duplicate")
        player2 = Player(name="Duplicate")
        
        clean_db.session.add(player1)
        clean_db.session.commit()
        
        clean_db.session.add(player2)
        with pytest.raises(Exception):
            clean_db.session.commit()


class TestGameSessionModel:
    """Test the GameSession model."""
    
    def test_session_creation(self, clean_db, sample_game):
        """Test creating a new game session."""
        session_date = datetime(2023, 6, 15, 19, 30)
        session = GameSession(
            game_id=sample_game.id,
            date=session_date,
            notes="Great game!"
        )
        
        clean_db.session.add(session)
        clean_db.session.commit()
        
        assert session.id is not None
        assert session.game_id == sample_game.id
        assert session.date == session_date
        assert session.notes == "Great game!"
        
    def test_session_to_dict(self, sample_session):
        """Test session serialization."""
        session_dict = sample_session.to_dict()
        
        assert session_dict['id'] == sample_session.id
        assert session_dict['game_id'] == sample_session.game_id
        assert 'game' in session_dict
        assert 'date' in session_dict
        assert 'players' in session_dict
        assert isinstance(session_dict['players'], list)
        
    def test_session_game_relationship(self, sample_session, sample_game):
        """Test session-game relationship."""
        assert sample_session.game.id == sample_game.id
        assert sample_session.game.name == "Test Game"


class TestGamePlayerModel:
    """Test the GamePlayer model."""
    
    def test_game_player_creation(self, clean_db, sample_session, sample_player):
        """Test creating a game player record."""
        game_player = GamePlayer(
            session_id=sample_session.id,
            player_id=sample_player.id,
            score=95,
            is_winner=True
        )
        
        clean_db.session.add(game_player)
        clean_db.session.commit()
        
        assert game_player.id is not None
        assert game_player.session_id == sample_session.id
        assert game_player.player_id == sample_player.id
        assert game_player.score == 95
        assert game_player.is_winner is True
        
    def test_game_player_to_dict(self, sample_game_player):
        """Test game player serialization."""
        gp_dict = sample_game_player.to_dict()
        
        assert gp_dict['id'] == sample_game_player.id
        assert gp_dict['score'] == 85
        assert gp_dict['is_winner'] is True
        assert 'player' in gp_dict
        assert gp_dict['player']['name'] == "Test Player"
        
    def test_game_player_relationships(self, sample_game_player, sample_session, sample_player):
        """Test game player relationships."""
        assert sample_game_player.session.id == sample_session.id
        assert sample_game_player.player.id == sample_player.id


class TestTagModel:
    """Test the Tag model."""
    
    def test_tag_creation(self, clean_db):
        """Test creating a new tag."""
        tag = Tag(name="Strategy", color="#FF5733")
        clean_db.session.add(tag)
        clean_db.session.commit()
        
        assert tag.id is not None
        assert tag.name == "Strategy"
        assert tag.color == "#FF5733"
        
    def test_tag_default_color(self, clean_db):
        """Test tag default color."""
        tag = Tag(name="Default Color")
        clean_db.session.add(tag)
        clean_db.session.commit()
        
        assert tag.color == '#3B82F6'
        
    def test_tag_to_dict(self, sample_tag):
        """Test tag serialization."""
        tag_dict = sample_tag.to_dict()
        
        assert tag_dict['id'] == sample_tag.id
        assert tag_dict['name'] == "Strategy"
        assert tag_dict['color'] == "#FF5733"
        assert 'created_at' in tag_dict
        
    def test_tag_unique_name(self, clean_db):
        """Test that tag names must be unique."""
        tag1 = Tag(name="Duplicate")
        tag2 = Tag(name="Duplicate")
        
        clean_db.session.add(tag1)
        clean_db.session.commit()
        
        clean_db.session.add(tag2)
        with pytest.raises(Exception):
            clean_db.session.commit()


class TestWishlistItemModel:
    """Test the WishlistItem model."""
    
    def test_wishlist_item_creation(self, clean_db):
        """Test creating a new wishlist item."""
        item = WishlistItem(
            name="Desired Game",
            bgg_id=789012,
            priority="high",
            notes="Want this badly",
            price_target=39.99,
            min_players=2,
            max_players=4,
            complexity=2.5
        )
        
        clean_db.session.add(item)
        clean_db.session.commit()
        
        assert item.id is not None
        assert item.name == "Desired Game"
        assert item.bgg_id == 789012
        assert item.priority == "high"
        assert item.price_target == 39.99
        
    def test_wishlist_item_defaults(self, clean_db):
        """Test wishlist item default values."""
        item = WishlistItem(name="Simple Item")
        clean_db.session.add(item)
        clean_db.session.commit()
        
        assert item.priority == "medium"
        assert item.created_at is not None
        
    def test_wishlist_item_to_dict(self, sample_wishlist_item):
        """Test wishlist item serialization."""
        item_dict = sample_wishlist_item.to_dict()
        
        assert item_dict['id'] == sample_wishlist_item.id
        assert item_dict['name'] == "Wishlist Game"
        assert item_dict['bgg_id'] == 789012
        assert item_dict['priority'] == "high"
        assert item_dict['price_target'] == 39.99
        assert 'created_at' in item_dict


class TestModelRelationships:
    """Test complex model relationships and cascade behaviors."""
    
    def test_game_deletion_cascades_sessions(self, clean_db, sample_game):
        """Test that deleting a game deletes its sessions."""
        # Create a session
        session = GameSession(game_id=sample_game.id, date=datetime.now())
        clean_db.session.add(session)
        clean_db.session.commit()
        
        session_id = session.id
        
        # Delete the game
        clean_db.session.delete(sample_game)
        clean_db.session.commit()
        
        # Session should be deleted
        deleted_session = GameSession.query.get(session_id)
        assert deleted_session is None
        
    def test_session_deletion_cascades_game_players(self, clean_db, sample_session, sample_player):
        """Test that deleting a session deletes its game players."""
        # Create a game player
        game_player = GamePlayer(
            session_id=sample_session.id,
            player_id=sample_player.id,
            score=85
        )
        clean_db.session.add(game_player)
        clean_db.session.commit()
        
        game_player_id = game_player.id
        
        # Delete the session
        clean_db.session.delete(sample_session)
        clean_db.session.commit()
        
        # Game player should be deleted
        deleted_game_player = GamePlayer.query.get(game_player_id)
        assert deleted_game_player is None
        
    def test_player_deletion_with_sessions(self, clean_db, sample_player, sample_session):
        """Test player deletion when they have game records."""
        # Create a game player record
        game_player = GamePlayer(
            session_id=sample_session.id,
            player_id=sample_player.id,
            score=85
        )
        clean_db.session.add(game_player)
        clean_db.session.commit()
        
        # Deleting player should work (but may leave orphaned game_player records)
        # This depends on your CASCADE configuration
        clean_db.session.delete(sample_player)
        clean_db.session.commit()
        
        # Player should be deleted
        deleted_player = Player.query.get(sample_player.id)
        assert deleted_player is None