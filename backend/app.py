from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from database import db

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Use different database for testing
if os.getenv('TESTING') == 'true':
    # This will be overridden by test configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
else:
    # Use absolute path for main database
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "games.db")}'
    
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_PHOTO_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directories
os.makedirs(os.path.join(UPLOAD_FOLDER, 'photos'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'rulebooks'), exist_ok=True)

db.init_app(app)

from models import Game, GameSession, Player, GamePlayer, Tag, WishlistItem
from scraper import scrape_bgg_game
from ai_suggestions import get_game_suggestion

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_uploaded_file(file, folder_name):
    """Save uploaded file and return the relative path"""
    if file and allowed_file(file.filename, ALLOWED_PHOTO_EXTENSIONS if folder_name == 'photos' else ALLOWED_PDF_EXTENSIONS):
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, folder_name, unique_filename)
        file.save(filepath)
        
        # Return relative path for database storage
        return f"{folder_name}/{unique_filename}"
    return None

@app.route('/api/games', methods=['GET', 'POST'])
def handle_games():
    if request.method == 'GET':
        games = Game.query.all()
        return jsonify([game.to_dict() for game in games])
    
    elif request.method == 'POST':
        data = request.json
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        if not data.get('owner'):
            return jsonify({'error': 'Owner is required'}), 400
            
        if 'bgg_id' in data:
            scraped_data = scrape_bgg_game(data['bgg_id'])
            if scraped_data:
                data.update(scraped_data)
        
        game = Game(
            name=data['name'],
            bgg_id=data.get('bgg_id'),
            owner=data['owner'],
            location=data.get('location'),
            min_players=data.get('min_players'),
            max_players=data.get('max_players'),
            playing_time=data.get('playing_time'),
            complexity=data.get('complexity'),
            image_url=data.get('image_url'),
            description=data.get('description'),
            rank_overall=data.get('rankings', {}).get('overall'),
            rank_strategy=data.get('rankings', {}).get('strategy'),
            rank_family=data.get('rankings', {}).get('family'),
            personal_rating=data.get('personal_rating'),
            acquisition_price=data.get('acquisition_price'),
            purchase_date=datetime.fromisoformat(data['purchase_date']) if data.get('purchase_date') else None,
            rulebook_pdf=data.get('rulebook_pdf')
        )
        
        db.session.add(game)
        db.session.commit()
        
        return jsonify(game.to_dict()), 201

@app.route('/api/games/<int:game_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_game(game_id):
    game = Game.query.get_or_404(game_id)
    
    if request.method == 'GET':
        return jsonify(game.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        
        # If BGG ID is provided, scrape updated data
        if 'bgg_id' in data and data['bgg_id']:
            scraped_data = scrape_bgg_game(data['bgg_id'])
            if scraped_data:
                # Update with scraped data but preserve user-provided values
                for key, value in scraped_data.items():
                    if key == 'rankings':
                        # Handle rankings separately
                        game.rank_overall = value.get('overall')
                        game.rank_strategy = value.get('strategy')
                        game.rank_family = value.get('family')
                    elif key not in data:  # Don't override user-provided data
                        if hasattr(game, key):
                            setattr(game, key, value)
        
        # Update with user-provided data
        for key, value in data.items():
            if hasattr(game, key):
                if key == 'purchase_date' and value:
                    setattr(game, key, datetime.fromisoformat(value))
                else:
                    setattr(game, key, value)
        
        db.session.commit()
        return jsonify(game.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(game)
        db.session.commit()
        return '', 204

@app.route('/api/sessions', methods=['GET', 'POST'])
def handle_sessions():
    if request.method == 'GET':
        sessions = GameSession.query.order_by(GameSession.date.desc()).all()
        return jsonify([session.to_dict() for session in sessions])
    
    elif request.method == 'POST':
        data = request.json
        
        session = GameSession(
            game_id=data['game_id'],
            date=datetime.fromisoformat(data['date']),
            notes=data.get('notes'),
            photo_url=data.get('photo_url')
        )
        
        db.session.add(session)
        db.session.flush()
        
        for player_data in data['players']:
            player = Player.query.filter_by(name=player_data['name']).first()
            if not player:
                player = Player(name=player_data['name'])
                db.session.add(player)
                db.session.flush()
            
            game_player = GamePlayer(
                session_id=session.id,
                player_id=player.id,
                score=player_data.get('score'),
                is_winner=player_data.get('is_winner', False)
            )
            db.session.add(game_player)
        
        db.session.commit()
        return jsonify(session.to_dict()), 201

@app.route('/api/sessions/<int:session_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_session(session_id):
    session = GameSession.query.get_or_404(session_id)
    
    if request.method == 'GET':
        return jsonify(session.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        
        # Update session details
        session.game_id = data['game_id']
        session.date = datetime.fromisoformat(data['date'])
        session.notes = data.get('notes')
        session.photo_url = data.get('photo_url')
        
        # Remove existing players
        GamePlayer.query.filter_by(session_id=session_id).delete()
        
        # Add updated players
        for player_data in data['players']:
            player = Player.query.filter_by(name=player_data['name']).first()
            if not player:
                player = Player(name=player_data['name'])
                db.session.add(player)
                db.session.flush()
            
            game_player = GamePlayer(
                session_id=session.id,
                player_id=player.id,
                score=player_data.get('score'),
                is_winner=player_data.get('is_winner', False)
            )
            db.session.add(game_player)
        
        db.session.commit()
        return jsonify(session.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(session)
        db.session.commit()
        return '', 204

@app.route('/api/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    return jsonify([player.to_dict() for player in players])

@app.route('/api/suggest', methods=['POST'])
def suggest_game():
    try:
        data = request.json
        player_count = data.get('player_count')
        # Convert empty string or 0 to None
        if player_count == '' or player_count == 0:
            player_count = None
        
        # Get games that can accommodate the player count, including those without player count data
        if player_count is not None:
            games = Game.query.filter(
                db.or_(
                    db.and_(
                        Game.min_players.is_not(None),
                        Game.max_players.is_not(None),
                        Game.min_players <= player_count,
                        Game.max_players >= player_count
                    ),
                    db.and_(Game.min_players.is_(None), Game.max_players.is_(None))
                )
            ).all()
        else:
            # If no player count specified, return all games
            games = Game.query.all()
        
        if not games:
            return jsonify({'error': 'No games found for this player count'}), 400
        
        suggestion = get_game_suggestion(games, player_count, data.get('preferences', {}))
        return jsonify(suggestion)
    except Exception as e:
        print(f"Error in suggest_game: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/suggest-purchase', methods=['POST'])
def suggest_purchase():
    try:
        data = request.json
        player_count = data.get('player_count')
        # Convert empty string or 0 to None
        if player_count == '' or player_count == 0:
            player_count = None
        
        # Get wishlist items to exclude from suggestions
        wishlist_items = WishlistItem.query.all()
        wishlist_games = [item.name for item in wishlist_items]
        
        # Prepare preferences with wishlist info
        preferences = data.get('preferences', {})
        if wishlist_games:
            # Add wishlist games to the context
            wishlist_note = f"IMPORTANT: Do NOT suggest games already in wishlist. Games in wishlist (DO NOT SUGGEST THESE): {', '.join(wishlist_games)}"
            if isinstance(preferences, dict):
                if 'notes' in preferences:
                    preferences['notes'] = wishlist_note + '. ' + preferences['notes']
                else:
                    preferences['notes'] = wishlist_note
            else:
                preferences = {'notes': wishlist_note}
        
        # For purchase suggestions, we don't filter by owned games
        # We pass an empty games list and let Claude suggest any game
        suggestion = get_game_suggestion([], player_count, preferences)
        return jsonify(suggestion)
    except Exception as e:
        print(f"Error in suggest_purchase: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    from datetime import datetime, timedelta
    from sqlalchemy import func, extract
    
    # Convert SQLAlchemy Row objects to lists
    games_by_owner_query = db.session.query(
        Game.owner, db.func.count(Game.id)
    ).group_by(Game.owner).all()
    
    most_played_query = db.session.query(
        Game.name, db.func.count(GameSession.id).label('play_count')
    ).join(GameSession).group_by(Game.id).order_by(
        db.text('play_count DESC')
    ).limit(10).all()
    
    # Collection value calculations
    collection_value = {
        'total_msrp': db.session.query(func.sum(Game.msrp)).scalar() or 0,
        'total_current_new': db.session.query(func.sum(Game.price_new)).scalar() or 0,
        'total_current_used': db.session.query(func.sum(Game.price_used)).scalar() or 0,
        'total_paid': db.session.query(func.sum(Game.acquisition_price)).scalar() or 0,
        'games_with_price_data': Game.query.filter(Game.price_new.isnot(None)).count(),
        'avg_game_value': 0,
        'most_valuable': None,
        'best_deal': None
    }
    
    if collection_value['games_with_price_data'] > 0:
        collection_value['avg_game_value'] = collection_value['total_current_new'] / collection_value['games_with_price_data']
        
        # Most valuable game
        most_valuable_game = Game.query.filter(Game.price_new.isnot(None)).order_by(Game.price_new.desc()).first()
        if most_valuable_game:
            collection_value['most_valuable'] = {
                'name': most_valuable_game.name,
                'value': most_valuable_game.price_new
            }
        
        # Best deal (highest ratio of current value to acquisition price)
        best_deal_game = db.session.query(Game).filter(
            Game.price_new.isnot(None),
            Game.acquisition_price.isnot(None),
            Game.acquisition_price > 0
        ).order_by((Game.price_new / Game.acquisition_price).desc()).first()
        
        if best_deal_game:
            collection_value['best_deal'] = {
                'name': best_deal_game.name,
                'paid': best_deal_game.acquisition_price,
                'current_value': best_deal_game.price_new,
                'profit_ratio': best_deal_game.price_new / best_deal_game.acquisition_price
            }
    
    # Play frequency trends (last 12 months)
    today = datetime.now()
    twelve_months_ago = today - timedelta(days=365)
    
    monthly_sessions = db.session.query(
        extract('year', GameSession.date).label('year'),
        extract('month', GameSession.date).label('month'),
        func.count(GameSession.id).label('session_count')
    ).filter(
        GameSession.date >= twelve_months_ago
    ).group_by(
        extract('year', GameSession.date),
        extract('month', GameSession.date)
    ).order_by('year', 'month').all()
    
    # Personal ratings analysis
    personal_ratings = {
        'avg_rating': db.session.query(func.avg(Game.personal_rating)).scalar() or 0,
        'highest_rated': None,
        'lowest_rated': None,
        'rating_distribution': []
    }
    
    if Game.query.filter(Game.personal_rating.isnot(None)).count() > 0:
        highest_rated = Game.query.filter(Game.personal_rating.isnot(None)).order_by(Game.personal_rating.desc()).first()
        lowest_rated = Game.query.filter(Game.personal_rating.isnot(None)).order_by(Game.personal_rating.asc()).first()
        
        if highest_rated:
            personal_ratings['highest_rated'] = {
                'name': highest_rated.name,
                'rating': highest_rated.personal_rating
            }
        
        if lowest_rated:
            personal_ratings['lowest_rated'] = {
                'name': lowest_rated.name,
                'rating': lowest_rated.personal_rating
            }
        
        # Rating distribution (1-10 scale)
        for rating in range(1, 11):
            count = Game.query.filter(
                Game.personal_rating >= rating,
                Game.personal_rating < rating + 1
            ).count()
            if count > 0:
                personal_ratings['rating_distribution'].append([rating, count])
    
    stats = {
        'total_games': Game.query.count(),
        'total_sessions': GameSession.query.count(),
        'games_by_owner': [[row[0], row[1]] for row in games_by_owner_query],
        'most_played': [[row[0], row[1]] for row in most_played_query],
        'collection_value': collection_value,
        'play_frequency': [[f"{int(row[0])}-{int(row[1]):02d}", row[2]] for row in monthly_sessions],
        'personal_ratings': personal_ratings,
        'player_stats': []
    }
    
    players = Player.query.all()
    for player in players:
        player_stat = {
            'name': player.name,
            'games_played': len(player.sessions),
            'wins': sum(1 for gp in player.sessions if gp.is_winner)
        }
        if player_stat['games_played'] > 0:
            player_stat['win_rate'] = player_stat['wins'] / player_stat['games_played']
        else:
            player_stat['win_rate'] = 0
        stats['player_stats'].append(player_stat)
    
    return jsonify(stats)

# Tags endpoints
@app.route('/api/tags', methods=['GET', 'POST'])
def handle_tags():
    if request.method == 'GET':
        tags = Tag.query.all()
        return jsonify([tag.to_dict() for tag in tags])
    
    elif request.method == 'POST':
        data = request.get_json()
        tag = Tag(
            name=data.get('name'),
            color=data.get('color', '#3B82F6')
        )
        db.session.add(tag)
        db.session.commit()
        return jsonify(tag.to_dict()), 201

@app.route('/api/tags/<int:tag_id>', methods=['PUT', 'DELETE'])
def handle_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    
    if request.method == 'PUT':
        data = request.get_json()
        tag.name = data.get('name', tag.name)
        tag.color = data.get('color', tag.color)
        db.session.commit()
        return jsonify(tag.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(tag)
        db.session.commit()
        return '', 204

# Wishlist endpoints
@app.route('/api/wishlist', methods=['GET', 'POST'])
def handle_wishlist():
    if request.method == 'GET':
        items = WishlistItem.query.order_by(WishlistItem.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items])
    
    elif request.method == 'POST':
        data = request.get_json()
        
        # If BGG ID is provided, scrape the game data
        if data.get('bgg_id'):
            try:
                scraped_data = scrape_bgg_game(data['bgg_id'])
                if scraped_data:
                    data.update(scraped_data)
            except Exception as e:
                print(f"Error scraping BGG data for wishlist: {e}")
        
        item = WishlistItem(
            name=data.get('name'),
            bgg_id=data.get('bgg_id'),
            priority=data.get('priority', 'medium'),
            notes=data.get('notes'),
            price_target=data.get('price_target'),
            image_url=data.get('image_url'),
            complexity=data.get('complexity'),
            min_players=data.get('min_players'),
            max_players=data.get('max_players'),
            playing_time=data.get('playing_time')
        )
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201

@app.route('/api/wishlist/<int:item_id>', methods=['PUT', 'DELETE'])
def handle_wishlist_item(item_id):
    item = WishlistItem.query.get_or_404(item_id)
    
    if request.method == 'PUT':
        data = request.get_json()
        item.name = data.get('name', item.name)
        item.priority = data.get('priority', item.priority)
        item.notes = data.get('notes', item.notes)
        item.price_target = data.get('price_target', item.price_target)
        db.session.commit()
        return jsonify(item.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return '', 204

@app.route('/api/wishlist/<int:item_id>/move-to-collection', methods=['POST'])
def move_to_collection(item_id):
    wishlist_item = WishlistItem.query.get_or_404(item_id)
    data = request.get_json()
    
    # Create a new game from wishlist item
    game = Game(
        name=wishlist_item.name,
        bgg_id=wishlist_item.bgg_id,
        owner=data.get('owner'),
        location=data.get('location'),
        min_players=wishlist_item.min_players,
        max_players=wishlist_item.max_players,
        playing_time=wishlist_item.playing_time,
        complexity=wishlist_item.complexity,
        image_url=wishlist_item.image_url,
        acquisition_price=data.get('acquisition_price'),
        purchase_date=datetime.now() if data.get('purchased_today') else None
    )
    
    db.session.add(game)
    db.session.delete(wishlist_item)  # Remove from wishlist
    db.session.commit()
    return jsonify(game.to_dict()), 201

# File upload endpoints
@app.route('/api/upload/photo', methods=['POST'])
def upload_photo():
    """Upload a session photo"""
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo file provided'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        file_path = save_uploaded_file(file, 'photos')
        if file_path:
            return jsonify({
                'success': True,
                'file_path': file_path,
                'url': f'/api/uploads/{file_path}'
            })
        else:
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/upload/rulebook', methods=['POST'])
def upload_rulebook():
    """Upload a game rulebook PDF"""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    
    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        file_path = save_uploaded_file(file, 'rulebooks')
        if file_path:
            return jsonify({
                'success': True,
                'file_path': file_path,
                'url': f'/api/uploads/{file_path}'
            })
        else:
            return jsonify({'error': 'Invalid file type. Only PDF files allowed'}), 400
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(UPLOAD_FOLDER, filename)

# BGG Hot Games endpoint
@app.route('/api/bgg/hot', methods=['GET'])
def get_bgg_hot():
    try:
        from scraper import scrape_bgg_hot_games
        hot_games = scrape_bgg_hot_games()
        return jsonify(hot_games)
    except Exception as e:
        print(f"Error fetching BGG hot games: {e}")
        return jsonify({'error': 'Failed to fetch hot games'}), 500

@app.route('/api/bgg/search', methods=['GET'])
def search_bgg():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    try:
        from bs4 import BeautifulSoup
        import requests
        import re
        
        # Use BGG's HTML search page for better ranking
        url = f'https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q={query}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        results = []
        
        # Find search results - they're in a specific div structure
        search_results = soup.find_all('div', id=re.compile(r'results_objectname\d+'))
        
        for i, result_div in enumerate(search_results[:5]):  # Get top 5 results
            try:
                # Find the link which contains both ID and name
                link = result_div.find('a', href=re.compile(r'/boardgame/\d+/'))
                if link:
                    # Extract BGG ID from URL
                    match = re.search(r'/boardgame/(\d+)/', link.get('href', ''))
                    if match:
                        bgg_id = match.group(1)
                        name = link.text.strip()
                        
                        # Get year if available
                        year_span = result_div.find('span', class_='smallerfont')
                        year = None
                        if year_span:
                            year_match = re.search(r'\((\d{4})\)', year_span.text)
                            if year_match:
                                year = year_match.group(1)
                        
                        results.append({
                            'id': bgg_id,
                            'name': name,
                            'year': year
                        })
            except Exception as e:
                print(f"Error parsing result: {e}")
                continue
        
        return jsonify(results)
    except Exception as e:
        print(f"Error searching BGG: {str(e)}")
        return jsonify([])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Debug: Print all routes
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {rule.rule} -> {rule.methods}")
    
    app.run(debug=True, port=5002)