import pytest
import tempfile
import os
from unittest.mock import Mock, patch
from werkzeug.datastructures import FileStorage
from io import BytesIO
from app import allowed_file, save_uploaded_file, ALLOWED_PHOTO_EXTENSIONS, ALLOWED_PDF_EXTENSIONS

class TestFileUtils:
    """Unit tests for file utility functions"""

    def test_allowed_file_valid_photo_extensions(self):
        """Test allowed_file function with valid photo extensions"""
        valid_files = [
            'image.jpg',
            'photo.jpeg', 
            'picture.png',
            'animation.gif',
            'modern.webp',
            'IMAGE.JPG',  # Test case insensitivity
            'PHOTO.PNG'
        ]
        
        for filename in valid_files:
            assert allowed_file(filename, ALLOWED_PHOTO_EXTENSIONS) is True

    def test_allowed_file_valid_pdf_extensions(self):
        """Test allowed_file function with valid PDF extensions"""
        valid_files = [
            'document.pdf',
            'rulebook.PDF',  # Test case insensitivity
            'manual.pdf'
        ]
        
        for filename in valid_files:
            assert allowed_file(filename, ALLOWED_PDF_EXTENSIONS) is True

    def test_allowed_file_invalid_extensions(self):
        """Test allowed_file function with invalid extensions"""
        invalid_photo_files = [
            'document.pdf',
            'text.txt',
            'video.mp4',
            'archive.zip',
            'noextension',
            'double.ext.exe'
        ]
        
        for filename in invalid_photo_files:
            assert allowed_file(filename, ALLOWED_PHOTO_EXTENSIONS) is False

        invalid_pdf_files = [
            'image.jpg',
            'text.txt',
            'document.doc',
            'noextension',
            'fake.pdf.exe'
        ]
        
        for filename in invalid_pdf_files:
            assert allowed_file(filename, ALLOWED_PDF_EXTENSIONS) is False

    def test_allowed_file_no_extension(self):
        """Test allowed_file function with files without extensions"""
        files_without_ext = [
            'filename',
            'no_extension_here',
            'justtext'
        ]
        
        for filename in files_without_ext:
            assert allowed_file(filename, ALLOWED_PHOTO_EXTENSIONS) is False
            assert allowed_file(filename, ALLOWED_PDF_EXTENSIONS) is False

    @patch('app.uuid.uuid4')
    @patch('os.path.join')
    def test_save_uploaded_file_photo_success(self, mock_join, mock_uuid):
        """Test successful photo file save"""
        # Mock UUID and file paths
        mock_uuid_obj = Mock()
        mock_uuid_obj.hex = 'abcd12345678'
        mock_uuid.return_value = mock_uuid_obj
        mock_join.return_value = '/test/path/image_abcd1234.jpg'
        
        # Create mock file
        mock_file = Mock()
        mock_file.filename = 'test_image.jpg'
        mock_file.save = Mock()
        
        with patch('app.allowed_file', return_value=True):
            with patch('app.secure_filename', return_value='test_image.jpg'):
                result = save_uploaded_file(mock_file, 'photos')
        
        assert result == 'photos/test_image_abcd1234.jpg'
        mock_file.save.assert_called_once()

    @patch('app.uuid.uuid4')
    @patch('os.path.join')
    def test_save_uploaded_file_pdf_success(self, mock_join, mock_uuid):
        """Test successful PDF file save"""
        # Mock UUID and file paths
        mock_uuid_obj = Mock()
        mock_uuid_obj.hex = 'efgh56785678'
        mock_uuid.return_value = mock_uuid_obj
        mock_join.return_value = '/test/path/rulebook_efgh5678.pdf'
        
        # Create mock file
        mock_file = Mock()
        mock_file.filename = 'game_rules.pdf'
        mock_file.save = Mock()
        
        with patch('app.allowed_file', return_value=True):
            with patch('app.secure_filename', return_value='game_rules.pdf'):
                result = save_uploaded_file(mock_file, 'rulebooks')
        
        assert result == 'rulebooks/game_rules_efgh5678.pdf'
        mock_file.save.assert_called_once()

    def test_save_uploaded_file_invalid_extension(self):
        """Test save_uploaded_file with invalid file extension"""
        # Create mock file with invalid extension
        mock_file = Mock()
        mock_file.filename = 'invalid.txt'
        
        with patch('app.allowed_file', return_value=False):
            result = save_uploaded_file(mock_file, 'photos')
        
        assert result is None

    def test_save_uploaded_file_no_file(self):
        """Test save_uploaded_file with None file"""
        result = save_uploaded_file(None, 'photos')
        assert result is None

    def test_save_uploaded_file_empty_filename(self):
        """Test save_uploaded_file with empty filename"""
        mock_file = Mock()
        mock_file.filename = ''
        
        with patch('app.allowed_file', return_value=False):
            result = save_uploaded_file(mock_file, 'photos')
        
        assert result is None

    @patch('app.uuid.uuid4')
    def test_save_uploaded_file_filename_security(self, mock_uuid):
        """Test that filenames are properly secured"""
        mock_uuid_obj = Mock()
        mock_uuid_obj.hex = 'secure12345678'  # Make it longer to match slicing
        mock_uuid.return_value = mock_uuid_obj
        
        # Test with potentially dangerous filename
        mock_file = Mock()
        mock_file.filename = '../../../etc/passwd.jpg'
        mock_file.save = Mock()
        
        with patch('app.allowed_file', return_value=True):
            with patch('app.secure_filename', return_value='passwd.jpg') as mock_secure:
                with patch('os.path.join', return_value='/safe/path/passwd_secure123.jpg'):
                    result = save_uploaded_file(mock_file, 'photos')
        
        # Verify secure_filename was called
        mock_secure.assert_called_once_with('../../../etc/passwd.jpg')
        assert result == 'photos/passwd_secure12.jpg'

    @patch('app.uuid.uuid4')
    def test_save_uploaded_file_extension_preservation(self, mock_uuid):
        """Test that file extensions are properly preserved"""
        mock_uuid_obj = Mock()
        mock_uuid_obj.hex = 'test12345678'  # Make it longer to match slicing
        mock_uuid.return_value = mock_uuid_obj
        
        test_cases = [
            ('image.JPG', '.JPG'),
            ('photo.jpeg', '.jpeg'),
            ('document.PDF', '.PDF'),
            ('file.png', '.png')
        ]
        
        for filename, expected_ext in test_cases:
            mock_file = Mock()
            mock_file.filename = filename
            mock_file.save = Mock()
            
            with patch('app.allowed_file', return_value=True):
                with patch('app.secure_filename', return_value=filename):
                    with patch('os.path.join'):
                        result = save_uploaded_file(mock_file, 'photos')
            
            # Check that the extension is preserved in the result
            assert result.endswith(f'_test1234{expected_ext}')

class TestFileUploadConfiguration:
    """Test file upload configuration constants"""

    def test_allowed_photo_extensions(self):
        """Test that photo extensions are properly configured"""
        expected_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        assert ALLOWED_PHOTO_EXTENSIONS == expected_extensions

    def test_allowed_pdf_extensions(self):
        """Test that PDF extensions are properly configured"""
        expected_extensions = {'pdf'}
        assert ALLOWED_PDF_EXTENSIONS == expected_extensions