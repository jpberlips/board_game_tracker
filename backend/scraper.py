import requests
from bs4 import BeautifulSoup
import re
import time
import json

def scrape_bgg_game(bgg_id):
    """
    Scrape game information from BoardGameGeek
    """
    try:
        url = f"https://boardgamegeek.com/boardgame/{bgg_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        game_data = {}
        
        # Get game image (still in meta tags)
        image_elem = soup.find('meta', property='og:image')
        if image_elem:
            game_data['image_url'] = image_elem.get('content')
        
        # Get description (still in meta tags)
        desc_elem = soup.find('meta', property='og:description')
        if desc_elem:
            game_data['description'] = desc_elem.get('content')
        
        # Extract data from JavaScript - BGG stores most data in GEEK.geekitemPreload
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'GEEK.geekitemPreload' in script.string:
                # Extract the game data from JavaScript
                try:
                    # Extract name - the primary game name appears in a specific pattern
                    # Look for the pattern around "primaryname" which contains the actual game data
                    primary_name_match = re.search(r'"primaryname":\{"nameid":"\d+","name":"([^"]+)"', script.string)
                    if primary_name_match:
                        game_data['name'] = primary_name_match.group(1)
                    else:
                        # Fallback: look for name after various item properties
                        # The game name typically appears after the itemdata definitions
                        item_name_match = re.search(r'"name":"([^"]+)"[^}]*"alternatename"', script.string)
                        if item_name_match:
                            game_data['name'] = item_name_match.group(1)
                    
                    # Extract player count
                    min_players_match = re.search(r'"minplayers":"(\d+)"', script.string)
                    max_players_match = re.search(r'"maxplayers":"(\d+)"', script.string)
                    if min_players_match:
                        game_data['min_players'] = int(min_players_match.group(1))
                    if max_players_match:
                        game_data['max_players'] = int(max_players_match.group(1))
                    
                    # Extract playing time (use average of min and max)
                    min_time_match = re.search(r'"minplaytime":"(\d+)"', script.string)
                    max_time_match = re.search(r'"maxplaytime":"(\d+)"', script.string)
                    if min_time_match and max_time_match:
                        min_time = int(min_time_match.group(1))
                        max_time = int(max_time_match.group(1))
                        game_data['playing_time'] = (min_time + max_time) // 2
                    elif min_time_match:
                        game_data['playing_time'] = int(min_time_match.group(1))
                    
                    # Extract complexity/weight
                    weight_match = re.search(r'"averageweight":([\d.]+)', script.string)
                    if weight_match:
                        game_data['complexity'] = float(weight_match.group(1))
                    
                except (ValueError, AttributeError) as e:
                    print(f"Error parsing game data: {e}")
                
                break  # Found the main data script
        
        # Get rankings from JavaScript data
        rankings = {}
        
        # BGG stores ranking data in a JavaScript variable - look for it in script tags
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'rankinfo' in script.string:
                # Extract the rankinfo JSON from the JavaScript
                rankinfo_match = re.search(r'"rankinfo":\s*\[(.*?)\]', script.string, re.DOTALL)
                if rankinfo_match:
                    try:
                        # Add brackets back to make it a valid JSON array
                        rankinfo_json = '[' + rankinfo_match.group(1) + ']'
                        rankinfo = json.loads(rankinfo_json)
                        
                        # Parse the different rankings
                        for rank_item in rankinfo:
                            if 'rank' in rank_item and rank_item['rank'] and rank_item['rank'] != 'Not Ranked':
                                rank_value = int(rank_item['rank'])
                                
                                # Map the ranking types
                                if rank_item.get('shortprettyname') == 'Overall Rank':
                                    rankings['overall'] = rank_value
                                elif rank_item.get('shortprettyname') == 'Strategy Rank':
                                    rankings['strategy'] = rank_value
                                elif rank_item.get('shortprettyname') == 'Thematic Rank':
                                    rankings['thematic'] = rank_value
                                elif rank_item.get('shortprettyname') == 'Family Rank':
                                    rankings['family'] = rank_value
                                    
                    except (json.JSONDecodeError, KeyError, ValueError) as e:
                        print(f"Error parsing ranking data: {e}")
                
                break  # Found the script with rankings, no need to continue
        
        # Add rankings to game data
        if rankings:
            game_data['rankings'] = rankings
        
        # Add a small delay to be respectful to BGG servers
        time.sleep(1)
        
        return game_data
        
    except Exception as e:
        print(f"Error scraping BGG game {bgg_id}: {str(e)}")
        return None

def search_bgg_game(game_name):
    """
    Search for a game on BGG and return the first result's ID
    """
    try:
        search_url = "https://boardgamegeek.com/geeksearch.php"
        params = {
            'action': 'search',
            'objecttype': 'boardgame',
            'q': game_name
        }
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(search_url, params=params, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the first game result
        first_result = soup.find('a', href=re.compile(r'/boardgame/\d+/'))
        if first_result:
            href = first_result.get('href')
            bgg_id_match = re.search(r'/boardgame/(\d+)/', href)
            if bgg_id_match:
                return int(bgg_id_match.group(1))
        
        return None
        
    except Exception as e:
        print(f"Error searching BGG for game '{game_name}': {str(e)}")
        return None

def scrape_bgg_hot_games():
    """Scrape the BGG hot games list using the XML API"""
    try:
        # Use BGG's XML API for hot games
        url = "https://boardgamegeek.com/xmlapi2/hot?type=boardgame"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse XML response
        from xml.etree import ElementTree as ET
        root = ET.fromstring(response.content)
        
        hot_games = []
        
        for item in root.findall('item')[:20]:  # Get top 20 hot games
            try:
                bgg_id = int(item.get('id'))
                rank = int(item.get('rank'))
                
                name_element = item.find('name')
                name = name_element.get('value') if name_element is not None else 'Unknown'
                
                year_element = item.find('yearpublished')
                year = int(year_element.get('value')) if year_element is not None and year_element.get('value') else None
                
                thumbnail_element = item.find('thumbnail')
                image_url = thumbnail_element.get('value') if thumbnail_element is not None else None
                
                # For now, we don't get ratings from the hot list API
                # We could make individual API calls for each game, but that would be slow
                
                hot_games.append({
                    'name': name,
                    'bgg_id': bgg_id,
                    'year': year,
                    'rating': None,  # Not available in hot list API
                    'image_url': image_url,
                    'rank': rank
                })
                
            except Exception as e:
                print(f"Error parsing hot game item: {e}")
                continue
        
        return hot_games
        
    except Exception as e:
        print(f"Error scraping BGG hot games: {e}")
        # Fallback to mock data for development
        return [
            {
                'name': 'Wingspan',
                'bgg_id': 266192,
                'year': 2019,
                'rating': 8.1,
                'image_url': 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__itemrep/img/Ys8HMlcFNXVfWgNlrsjxCMX-4i8=/fit-in/246x300/filters:strip_icc()/pic4458123.jpg',
                'rank': 1
            },
            {
                'name': 'Gloomhaven',
                'bgg_id': 174430,
                'year': 2017,
                'rating': 8.7,
                'image_url': 'https://cf.geekdo-images.com/sZYp_3BTDGjh2unaZfZmuA__itemrep/img/eW5gPVduT-eHg3ggOGASG1MxyoU=/fit-in/246x300/filters:strip_icc()/pic2437871.jpg',
                'rank': 2
            },
            {
                'name': 'Terraforming Mars',
                'bgg_id': 167791,
                'year': 2016,
                'rating': 8.4,
                'image_url': 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__itemrep/img/HTb5kP3OBIB8HfLPORxBM7oJTHw=/fit-in/246x300/filters:strip_icc()/pic3536616.jpg',
                'rank': 3
            }
        ]