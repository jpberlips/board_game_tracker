import pytest
import unittest
from unittest.mock import patch
import requests
from app import app, db
from models import Game


class TestGameURLValidation(unittest.TestCase):
    def setUp(self):
        """Set up test client and database"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        """Clean up after each test"""
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_create_game_with_rulebook_url(self):
        """Test creating a game with a rulebook URL"""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'rulebook_url': 'https://example.com/rulebook.pdf'
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['name'], 'Test Game')
        self.assertEqual(data['rulebook_url'], 'https://example.com/rulebook.pdf')
        self.assertIsNone(data['rulebook_pdf'])
    
    def test_create_game_with_both_pdf_file_and_url(self):
        """Test creating a game with both PDF file and URL"""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'rulebook_pdf': '/uploads/pdfs/test.pdf',
            'rulebook_url': 'https://example.com/rulebook.pdf'
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['rulebook_pdf'], '/uploads/pdfs/test.pdf')
        self.assertEqual(data['rulebook_url'], 'https://example.com/rulebook.pdf')
    
    def test_update_game_with_rulebook_url(self):
        """Test updating a game to add a rulebook URL"""
        # First create a game
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner'
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        game_id = response.get_json()['id']
        
        # Update with rulebook URL
        update_data = {
            'rulebook_url': 'https://example.com/updated-rulebook.pdf'
        }
        
        response = self.client.put(f'/api/games/{game_id}', 
                                 json=update_data, 
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['rulebook_url'], 'https://example.com/updated-rulebook.pdf')
    
    def test_create_game_with_empty_rulebook_url(self):
        """Test creating a game with empty rulebook URL"""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'rulebook_url': ''
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['rulebook_url'], '')
    
    def test_create_game_without_rulebook_url(self):
        """Test creating a game without specifying rulebook URL"""
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner'
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIsNone(data['rulebook_url'])
    
    def test_game_model_to_dict_includes_rulebook_url(self):
        """Test that Game model's to_dict method includes rulebook_url"""
        with app.app_context():
            game = Game(
                name='Test Game',
                owner='Test Owner',
                rulebook_url='https://example.com/rulebook.pdf'
            )
            db.session.add(game)
            db.session.commit()
            
            game_dict = game.to_dict()
            self.assertIn('rulebook_url', game_dict)
            self.assertEqual(game_dict['rulebook_url'], 'https://example.com/rulebook.pdf')
    
    def test_game_with_long_rulebook_url(self):
        """Test creating a game with very long rulebook URL"""
        long_url = 'https://example.com/' + 'a' * 450 + '.pdf'
        
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'rulebook_url': long_url
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['rulebook_url'], long_url)
    
    def test_remove_rulebook_url_from_game(self):
        """Test removing rulebook URL from a game"""
        # Create game with URL
        game_data = {
            'name': 'Test Game',
            'owner': 'Test Owner',
            'rulebook_url': 'https://example.com/rulebook.pdf'
        }
        
        response = self.client.post('/api/games', 
                                  json=game_data, 
                                  content_type='application/json')
        game_id = response.get_json()['id']
        
        # Remove URL by setting it to empty string
        update_data = {
            'rulebook_url': ''
        }
        
        response = self.client.put(f'/api/games/{game_id}', 
                                 json=update_data, 
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['rulebook_url'], '')


if __name__ == '__main__':
    unittest.main()