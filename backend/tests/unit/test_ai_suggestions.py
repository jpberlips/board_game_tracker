"""
Unit tests for AI suggestions functionality.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import json
import os

from ai_suggestions import get_game_suggestion
from models import Game


class TestAISuggestions:
    """Test AI-powered game suggestion functionality."""
    
    def test_get_suggestion_no_api_key(self, sample_games_collection):
        """Test behavior when no API key is provided."""
        with patch.dict(os.environ, {}, clear=True):
            result = get_game_suggestion(sample_games_collection, 3, {})
            
            assert result['suggested_game'] == sample_games_collection[0].name
            assert 'API key' in result['reason']
            
    @patch('ai_suggestions.Anthropic')
    @patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'})
    def test_get_suggestion_with_api_success(self, mock_anthropic, sample_games_collection):
        """Test successful AI suggestion with valid API key."""
        # Mock the Anthropic client and response
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = json.dumps({
            'suggested_game': 'Light Strategy Game',
            'reason': 'Perfect for 3 players with moderate complexity.'
        })
        mock_client.messages.create.return_value = mock_response
        
        result = get_game_suggestion(sample_games_collection, 3, {'complexity': 'medium'})
        
        assert result['suggested_game'] == 'Light Strategy Game'
        assert 'Perfect for 3 players' in result['reason']
        
        # Verify API call was made with correct parameters
        mock_client.messages.create.assert_called_once()
        call_args = mock_client.messages.create.call_args
        assert call_args[1]['model'] == 'claude-3-5-sonnet-20241022'
        assert call_args[1]['max_tokens'] == 300
        assert call_args[1]['temperature'] == 0.7
        
    @patch('ai_suggestions.Anthropic')
    @patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'})
    def test_get_suggestion_invalid_json_response(self, mock_anthropic, sample_games_collection):
        """Test handling of invalid JSON response from API."""
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = "Invalid JSON response"
        mock_client.messages.create.return_value = mock_response
        
        result = get_game_suggestion(sample_games_collection, 3, {})
        
        assert result['suggested_game'] == sample_games_collection[0].name
        assert result['reason'] == "Invalid JSON response"
        
    @patch('ai_suggestions.Anthropic')
    @patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'})
    def test_get_suggestion_api_error(self, mock_anthropic, sample_games_collection):
        """Test handling of API errors."""
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        mock_client.messages.create.side_effect = Exception("API Error")
        
        result = get_game_suggestion(sample_games_collection, 3, {})
        
        # Should fall back to simple logic
        assert result['suggested_game'] is not None
        assert 'moderate complexity' in result['reason'].lower()
        
    def test_get_suggestion_empty_games_list(self):
        """Test purchase suggestion with empty games list."""
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'}):
            with patch('ai_suggestions.Anthropic') as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.return_value = mock_client
                
                mock_response = MagicMock()
                mock_response.content = [MagicMock()]
                mock_response.content[0].text = json.dumps({
                    'suggested_game': 'Wingspan',
                    'reason': 'Great engine-building game for your collection.'
                })
                mock_client.messages.create.return_value = mock_response
                
                result = get_game_suggestion([], 2, {'genres': ['engine-building']})
                
                assert result['suggested_game'] == 'Wingspan'
                assert 'engine-building' in result['reason']
                
                # Verify purchase prompt was used
                call_args = mock_client.messages.create.call_args
                prompt = call_args[1]['messages'][0]['content']
                assert 'purchase' in prompt.lower()
                assert 'buy' in prompt.lower()
    
    def test_get_suggestion_player_count_filtering(self, sample_games_collection):
        """Test fallback logic filters games by player count."""
        # Mock API failure to test fallback logic
        with patch('ai_suggestions.Anthropic') as mock_anthropic:
            mock_anthropic.side_effect = Exception("API Error")
            
            # Test with player count that matches some games
            result = get_game_suggestion(sample_games_collection, 2, {})
            
            # Should pick a game that supports 2 players
            suggested_game_name = result['suggested_game']
            suggested_game = next(g for g in sample_games_collection if g.name == suggested_game_name)
            assert suggested_game.min_players <= 2 <= suggested_game.max_players
            
    def test_get_suggestion_complexity_sorting(self, clean_db):
        """Test that fallback logic sorts by complexity."""
        # Create games with different complexities
        games = [
            Game(name="Simple Game", owner="Test", min_players=2, max_players=4, complexity=1.0),
            Game(name="Moderate Game", owner="Test", min_players=2, max_players=4, complexity=2.5), 
            Game(name="Complex Game", owner="Test", min_players=2, max_players=4, complexity=4.5)
        ]
        
        for game in games:
            clean_db.session.add(game)
        clean_db.session.commit()
        
        with patch('ai_suggestions.Anthropic') as mock_anthropic:
            mock_anthropic.side_effect = Exception("API Error")
            
            result = get_game_suggestion(games, 3, {})
            
            # Should pick the game closest to moderate complexity (2.5)
            assert result['suggested_game'] == "Moderate Game"
            
    def test_get_suggestion_prompt_construction(self, sample_games_collection):
        """Test that prompts are constructed correctly."""
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'}):
            with patch('ai_suggestions.Anthropic') as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.return_value = mock_client
                mock_client.messages.create.return_value = MagicMock()
                
                # Test owned games prompt
                get_game_suggestion(sample_games_collection, 4, {'style': 'strategic'})
                
                call_args = mock_client.messages.create.call_args
                prompt = call_args[1]['messages'][0]['content']
                
                assert 'Player count: 4' in prompt
                assert 'Available games:' in prompt
                assert 'Light Strategy Game' in prompt
                assert 'strategic' in prompt
                assert 'JSON object' in prompt
                
    def test_get_suggestion_purchase_prompt(self):
        """Test purchase suggestion prompt construction."""
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'}):
            with patch('ai_suggestions.Anthropic') as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.return_value = mock_client
                mock_client.messages.create.return_value = MagicMock()
                
                # Test purchase suggestion prompt (empty games list)
                get_game_suggestion([], 3, {'budget': '$50', 'themes': ['space']})
                
                call_args = mock_client.messages.create.call_args
                prompt = call_args[1]['messages'][0]['content']
                
                assert 'choose a new game to buy' in prompt
                assert 'Player count: 3' in prompt
                assert '$50' in prompt
                assert 'space' in prompt
                assert 'purchase' in prompt.lower()
                
    def test_get_suggestion_no_player_count(self, sample_games_collection):
        """Test suggestion when player count is None or 0."""
        with patch('ai_suggestions.Anthropic') as mock_anthropic:
            mock_anthropic.side_effect = Exception("API Error")
            
            # Test with None player count - should return all games for selection
            result = get_game_suggestion(sample_games_collection, None, {})
            assert result['suggested_game'] is not None
            # Should pick a game with moderate complexity (around 2.5)
            assert 'moderate complexity' in result['reason'].lower() or 'availability' in result['reason'].lower()
            
            # Test with 0 player count - should be treated same as None
            result = get_game_suggestion(sample_games_collection, 0, {})
            assert result['suggested_game'] is not None
            # Should pick a game with moderate complexity or mention availability
            assert 'moderate complexity' in result['reason'].lower() or 'availability' in result['reason'].lower()
            
    def test_get_suggestion_no_suitable_games(self, sample_games_collection):
        """Test when no games match the player count."""
        with patch('ai_suggestions.Anthropic') as mock_anthropic:
            mock_anthropic.side_effect = Exception("API Error")
            
            # Request player count that no game supports
            result = get_game_suggestion(sample_games_collection, 20, {})
            
            # Should fall back to first available game
            assert result['suggested_game'] == sample_games_collection[0].name
            assert 'availability' in result['reason'].lower()
            
    @patch('builtins.print')  # Mock print to test console logging
    @patch('ai_suggestions.Anthropic')
    @patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'})
    def test_console_logging(self, mock_anthropic, mock_print, sample_games_collection):
        """Test that API requests and responses are logged to console."""
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        
        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = '{"suggested_game": "Test", "reason": "Test reason"}'
        mock_client.messages.create.return_value = mock_response
        
        get_game_suggestion(sample_games_collection, 3, {})
        
        # Verify console logging occurred
        print_calls = [call[0][0] for call in mock_print.call_args_list]
        
        # Should log request details
        assert any('CLAUDE API REQUEST' in call for call in print_calls)
        assert any('Model: claude-3-5-sonnet-20241022' in call for call in print_calls)
        
        # Should log response
        assert any('CLAUDE API RESPONSE' in call for call in print_calls)


class TestAISuggestionHelpers:
    """Test helper functionality for AI suggestions."""
    
    def test_game_data_preparation(self, sample_game):
        """Test that game data is properly prepared for AI prompts."""
        # This would test the internal game data serialization
        # For now, we test indirectly through the main function
        
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'}):
            with patch('ai_suggestions.Anthropic') as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.return_value = mock_client
                mock_client.messages.create.return_value = MagicMock()
                
                get_game_suggestion([sample_game], 3, {})
                
                call_args = mock_client.messages.create.call_args
                prompt = call_args[1]['messages'][0]['content']
                
                # Verify game data is included in prompt
                assert 'Test Game' in prompt
                assert '"min_players": 2' in prompt
                assert '"max_players": 4' in prompt
                assert '"complexity": 2.5' in prompt
                
    def test_preferences_handling(self):
        """Test that preferences are properly handled in prompts."""
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'test-key'}):
            with patch('ai_suggestions.Anthropic') as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.return_value = mock_client
                mock_client.messages.create.return_value = MagicMock()
                
                preferences = {
                    'complexity': 'medium',
                    'time': 'short',
                    'themes': ['strategy', 'worker-placement']
                }
                
                get_game_suggestion([], 4, preferences)
                
                call_args = mock_client.messages.create.call_args
                prompt = call_args[1]['messages'][0]['content']
                
                # Verify preferences are included
                assert 'medium' in prompt
                assert 'short' in prompt
                assert 'strategy' in prompt
                assert 'worker-placement' in prompt