"""
Integration tests for Games API endpoints.
"""
import pytest
import json
from datetime import datetime

from conftest import VALID_GAME_DATA


class TestGamesAPI:
    """Test the /api/games endpoints."""
    
    def test_get_games_empty(self, client, clean_db):
        """Test getting games when collection is empty."""
        response = client.get('/api/games')
        
        assert response.status_code == 200
        assert response.json == []
        
    def test_get_games_with_data(self, client, sample_games_collection):
        """Test getting games with existing collection."""
        response = client.get('/api/games')
        
        assert response.status_code == 200
        data = response.json
        assert len(data) == 3
        
        # Verify game data structure
        game = data[0]
        assert 'id' in game
        assert 'name' in game
        assert 'owner' in game
        assert 'min_players' in game
        assert 'max_players' in game
        assert 'tags' in game
        
    def test_create_game_basic(self, client, clean_db):
        """Test creating a new game with basic data."""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'location': 'Shelf A'
        }
        
        response = client.post('/api/games', 
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = response.json
        assert data['name'] == 'Test Game'
        assert data['owner'] == 'Test Owner'
        assert data['location'] == 'Shelf A'
        assert data['id'] is not None
        
    def test_create_game_full_data(self, client, clean_db):
        """Test creating a game with complete data."""
        response = client.post('/api/games',
                             data=json.dumps(VALID_GAME_DATA),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = response.json
        assert data['name'] == VALID_GAME_DATA['name']
        assert data['owner'] == VALID_GAME_DATA['owner']
        assert data['bgg_id'] == VALID_GAME_DATA['bgg_id']
        assert data['min_players'] == VALID_GAME_DATA['min_players']
        assert data['complexity'] == VALID_GAME_DATA['complexity']
        assert data['personal_rating'] == VALID_GAME_DATA['personal_rating']
        
    @pytest.mark.skip(reason="Requires actual BGG connection")
    def test_create_game_with_bgg_scraping(self, client, clean_db):
        """Test creating a game with BGG ID scraping."""
        game_data = {
            'name': 'Wingspan',  # This might get overridden by BGG data
            'owner': 'Test Owner',
            'bgg_id': 266192  # Wingspan BGG ID
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = response.json
        assert data['bgg_id'] == 266192
        # BGG data should enhance the game info
        assert data['min_players'] is not None
        assert data['max_players'] is not None
        
    def test_create_game_missing_required_fields(self, client, clean_db):
        """Test creating a game with missing required fields."""
        # Missing owner
        game_data = {'name': 'Test Game'}
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        assert response.status_code == 400 or response.status_code == 500
        
        # Missing name
        game_data = {'owner': 'Test Owner'}
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        assert response.status_code == 400 or response.status_code == 500
        
    def test_create_game_invalid_json(self, client, clean_db):
        """Test creating a game with invalid JSON."""
        response = client.post('/api/games',
                             data='invalid json',
                             content_type='application/json')
        assert response.status_code == 400
        
    def test_get_single_game(self, client, sample_game):
        """Test getting a single game by ID."""
        response = client.get(f'/api/games/{sample_game.id}')
        
        assert response.status_code == 200
        data = response.json
        assert data['id'] == sample_game.id
        assert data['name'] == sample_game.name
        assert data['owner'] == sample_game.owner
        
    def test_get_nonexistent_game(self, client, clean_db):
        """Test getting a game that doesn't exist."""
        response = client.get('/api/games/99999')
        assert response.status_code == 404
        
    def test_update_game(self, client, sample_game):
        """Test updating an existing game."""
        update_data = {
            'name': 'Updated Game Name',
            'owner': 'Updated Owner',
            'personal_rating': 9.5
        }
        
        response = client.put(f'/api/games/{sample_game.id}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = response.json
        assert data['name'] == 'Updated Game Name'
        assert data['owner'] == 'Updated Owner' 
        assert data['personal_rating'] == 9.5
        
    def test_update_nonexistent_game(self, client, clean_db):
        """Test updating a game that doesn't exist."""
        update_data = {'name': 'Updated Name'}
        
        response = client.put('/api/games/99999',
                            data=json.dumps(update_data),
                            content_type='application/json')
        assert response.status_code == 404
        
    def test_delete_game(self, client, sample_game):
        """Test deleting a game."""
        game_id = sample_game.id
        
        response = client.delete(f'/api/games/{game_id}')
        assert response.status_code == 204
        
        # Verify game is deleted
        response = client.get(f'/api/games/{game_id}')
        assert response.status_code == 404
        
    def test_delete_nonexistent_game(self, client, clean_db):
        """Test deleting a game that doesn't exist."""
        response = client.delete('/api/games/99999')
        assert response.status_code == 404
        
    def test_update_game_with_purchase_date(self, client, sample_game):
        """Test updating game with purchase date."""
        update_data = {
            'purchase_date': '2023-06-15T00:00:00',
            'acquisition_price': 59.99
        }
        
        response = client.put(f'/api/games/{sample_game.id}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = response.json
        assert '2023-06-15' in data['purchase_date']
        assert data['acquisition_price'] == 59.99


class TestGamesAPIValidation:
    """Test input validation for games API."""
    
    def test_create_game_data_types(self, client, clean_db):
        """Test creating game with various data types."""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'min_players': '2',  # String should be converted
            'max_players': 4,    # Integer should work
            'complexity': '2.5', # String float should be converted
            'personal_rating': 8.0,
            'bgg_id': '123456'   # String should be converted
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = response.json
        assert isinstance(data['min_players'], int)
        assert isinstance(data['max_players'], int)
        assert isinstance(data['bgg_id'], int)
        
    def test_create_game_negative_values(self, client, clean_db):
        """Test creating game with negative values."""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'min_players': -1,
            'playing_time': -30,
            'personal_rating': -5.0
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        # Should either reject or sanitize negative values
        # Implementation dependent - document expected behavior
        assert response.status_code in [201, 400]
        
    def test_create_game_extremely_long_strings(self, client, clean_db):
        """Test creating game with very long strings."""
        game_data = {
            'name': 'A' * 1000,  # Very long name
            'owner': 'Test Owner',
            'description': 'B' * 10000  # Very long description
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        # Should handle long strings appropriately
        assert response.status_code in [201, 400]


class TestGamesAPIEdgeCases:
    """Test edge cases for games API."""
    
    def test_concurrent_game_creation(self, client, clean_db):
        """Test creating multiple games concurrently."""
        game_data1 = {'name': 'Game 1', 'owner': 'Owner 1'}
        game_data2 = {'name': 'Game 2', 'owner': 'Owner 2'}
        
        # Simulate concurrent requests
        response1 = client.post('/api/games',
                              data=json.dumps(game_data1),
                              content_type='application/json')
        response2 = client.post('/api/games',
                              data=json.dumps(game_data2),
                              content_type='application/json')
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        assert response1.json['id'] != response2.json['id']
        
    def test_create_game_duplicate_bgg_id(self, client, sample_game):
        """Test creating games with duplicate BGG IDs."""
        game_data = {
            'name': 'Another Game',
            'owner': 'Another Owner',
            'bgg_id': sample_game.bgg_id  # Duplicate BGG ID
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        # Should allow duplicate BGG IDs (same game, different copy)
        assert response.status_code == 201
        
    def test_update_game_partial_data(self, client, sample_game):
        """Test updating game with only some fields."""
        original_owner = sample_game.owner
        
        update_data = {'name': 'New Name Only'}
        
        response = client.put(f'/api/games/{sample_game.id}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = response.json
        assert data['name'] == 'New Name Only'
        assert data['owner'] == original_owner  # Should remain unchanged
        
    def test_games_api_content_type_handling(self, client, clean_db):
        """Test API with different content types."""
        game_data = {'name': 'Test Game', 'owner': 'Test Owner'}
        
        # Test with correct content type
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        assert response.status_code == 201
        
        # Test with missing content type
        response = client.post('/api/games',
                             data=json.dumps(game_data))
        # Should still work or give clear error
        assert response.status_code in [201, 400, 415]