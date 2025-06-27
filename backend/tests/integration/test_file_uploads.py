import pytest
import os
import tempfile
from werkzeug.datastructures import FileStorage
from io import BytesIO
from PIL import Image
import json
from app import app, db
from models import Game, GameSession, Player, GamePlayer

class TestFileUploads:
    """Integration tests for file upload functionality"""

    @pytest.fixture
    def client(self):
        """Create test client with temporary database"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
        
        with app.test_client() as client:
            with app.app_context():
                db.create_all()
                yield client
                db.drop_all()

    def create_test_image(self, filename='test.jpg', format='JPEG'):
        """Create a test image file in memory"""
        image = Image.new('RGB', (100, 100), color='red')
        img_buffer = BytesIO()
        image.save(img_buffer, format=format)
        img_buffer.seek(0)
        return img_buffer

    def create_test_pdf(self, filename='test.pdf'):
        """Create a minimal test PDF file in memory"""
        # Minimal PDF content
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
188
%%EOF"""
        return BytesIO(pdf_content)

    def test_upload_photo_success(self, client):
        """Test successful photo upload"""
        img_data = self.create_test_image()
        
        response = client.post('/api/upload/photo', 
                             data={'photo': (img_data, 'test.jpg')},
                             content_type='multipart/form-data')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'file_path' in data
        assert 'url' in data
        assert data['file_path'].startswith('photos/')
        assert data['url'].startswith('/api/uploads/')

    def test_upload_photo_no_file(self, client):
        """Test photo upload with no file"""
        response = client.post('/api/upload/photo', 
                             data={},
                             content_type='multipart/form-data')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'No photo file provided' in data['error']

    def test_upload_photo_invalid_type(self, client):
        """Test photo upload with invalid file type"""
        # Create a text file instead of image
        text_data = BytesIO(b"This is not an image")
        
        response = client.post('/api/upload/photo', 
                             data={'photo': (text_data, 'test.txt')},
                             content_type='multipart/form-data')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid file type' in data['error']

    def test_upload_rulebook_success(self, client):
        """Test successful PDF rulebook upload"""
        pdf_data = self.create_test_pdf()
        
        response = client.post('/api/upload/rulebook', 
                             data={'pdf': (pdf_data, 'rulebook.pdf')},
                             content_type='multipart/form-data')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'file_path' in data
        assert 'url' in data
        assert data['file_path'].startswith('rulebooks/')
        assert data['url'].startswith('/api/uploads/')

    def test_upload_rulebook_no_file(self, client):
        """Test rulebook upload with no file"""
        response = client.post('/api/upload/rulebook', 
                             data={},
                             content_type='multipart/form-data')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'No PDF file provided' in data['error']

    def test_upload_rulebook_invalid_type(self, client):
        """Test rulebook upload with invalid file type"""
        # Create an image file instead of PDF
        img_data = self.create_test_image()
        
        response = client.post('/api/upload/rulebook', 
                             data={'pdf': (img_data, 'not_a_pdf.jpg')},
                             content_type='multipart/form-data')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid file type' in data['error']

    def test_create_game_with_rulebook(self, client):
        """Test creating a game with rulebook PDF"""
        # First upload a rulebook
        pdf_data = self.create_test_pdf()
        upload_response = client.post('/api/upload/rulebook', 
                                    data={'pdf': (pdf_data, 'wingspan_rules.pdf')},
                                    content_type='multipart/form-data')
        
        assert upload_response.status_code == 200
        upload_data = json.loads(upload_response.data)
        
        # Create game with rulebook reference
        game_data = {
            'name': 'Wingspan',
            'owner': 'Alice',
            'location': 'Living Room',
            'rulebook_pdf': upload_data['file_path']
        }
        
        response = client.post('/api/games',
                             data=json.dumps(game_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Wingspan'
        assert data['rulebook_pdf'] == upload_data['file_path']

    def test_create_session_with_photo(self, client):
        """Test creating a game session with photo"""
        # First create a game
        game_data = {
            'name': 'Wingspan',
            'owner': 'Alice',
            'location': 'Living Room'
        }
        
        game_response = client.post('/api/games',
                                  data=json.dumps(game_data),
                                  content_type='application/json')
        
        assert game_response.status_code == 201
        game = json.loads(game_response.data)
        
        # Upload a photo
        img_data = self.create_test_image()
        upload_response = client.post('/api/upload/photo', 
                                    data={'photo': (img_data, 'victory_shot.jpg')},
                                    content_type='multipart/form-data')
        
        assert upload_response.status_code == 200
        upload_data = json.loads(upload_response.data)
        
        # Create session with photo
        session_data = {
            'game_id': game['id'],
            'date': '2024-01-15T19:30:00',
            'notes': 'Great game with awesome birds!',
            'photo_url': upload_data['file_path'],
            'players': [
                {'name': 'Alice', 'score': 85, 'is_winner': True},
                {'name': 'Bob', 'score': 72, 'is_winner': False}
            ]
        }
        
        response = client.post('/api/sessions',
                             data=json.dumps(session_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['photo_url'] == upload_data['file_path']
        assert data['notes'] == 'Great game with awesome birds!'
        assert len(data['players']) == 2

    def test_update_game_with_rulebook(self, client):
        """Test updating a game to add rulebook PDF"""
        # Create a game first
        game_data = {
            'name': 'Wingspan',
            'owner': 'Alice',
            'location': 'Living Room'
        }
        
        game_response = client.post('/api/games',
                                  data=json.dumps(game_data),
                                  content_type='application/json')
        
        assert game_response.status_code == 201
        game = json.loads(game_response.data)
        
        # Upload rulebook
        pdf_data = self.create_test_pdf()
        upload_response = client.post('/api/upload/rulebook', 
                                    data={'pdf': (pdf_data, 'wingspan_rules.pdf')},
                                    content_type='multipart/form-data')
        
        assert upload_response.status_code == 200
        upload_data = json.loads(upload_response.data)
        
        # Update game with rulebook
        update_data = {
            'name': 'Wingspan',
            'owner': 'Alice',
            'location': 'Living Room',
            'rulebook_pdf': upload_data['file_path']
        }
        
        response = client.put(f'/api/games/{game["id"]}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['rulebook_pdf'] == upload_data['file_path']

    def test_update_session_with_photo(self, client):
        """Test updating a session to add photo"""
        # Create game and session first
        game_data = {
            'name': 'Wingspan',
            'owner': 'Alice',
            'location': 'Living Room'
        }
        
        game_response = client.post('/api/games',
                                  data=json.dumps(game_data),
                                  content_type='application/json')
        
        game = json.loads(game_response.data)
        
        session_data = {
            'game_id': game['id'],
            'date': '2024-01-15T19:30:00',
            'notes': 'Great game!',
            'players': [
                {'name': 'Alice', 'score': 85, 'is_winner': True}
            ]
        }
        
        session_response = client.post('/api/sessions',
                                     data=json.dumps(session_data),
                                     content_type='application/json')
        
        session = json.loads(session_response.data)
        
        # Upload photo
        img_data = self.create_test_image()
        upload_response = client.post('/api/upload/photo', 
                                    data={'photo': (img_data, 'victory_shot.jpg')},
                                    content_type='multipart/form-data')
        
        upload_data = json.loads(upload_response.data)
        
        # Update session with photo
        update_data = {
            'game_id': game['id'],
            'date': '2024-01-15T19:30:00',
            'notes': 'Great game with victory photo!',
            'photo_url': upload_data['file_path'],
            'players': [
                {'name': 'Alice', 'score': 85, 'is_winner': True}
            ]
        }
        
        response = client.put(f'/api/sessions/{session["id"]}',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['photo_url'] == upload_data['file_path']
        assert 'victory photo' in data['notes']

    def test_serve_uploaded_file(self, client):
        """Test serving uploaded files"""
        # Upload a photo first
        img_data = self.create_test_image()
        upload_response = client.post('/api/upload/photo', 
                                    data={'photo': (img_data, 'test.jpg')},
                                    content_type='multipart/form-data')
        
        upload_data = json.loads(upload_response.data)
        
        # Try to access the uploaded file
        response = client.get(upload_data['url'])
        assert response.status_code == 200
        assert response.content_type.startswith('image/')