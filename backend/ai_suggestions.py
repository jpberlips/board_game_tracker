import os
from anthropic import Anthropic
import json

def get_game_suggestion(games, player_count, preferences):
    """
    Use Claude API to suggest the next game to play
    """
    api_key = os.getenv('ANTHROPIC_API_KEY')
    
    if not api_key:
        return {
            'suggested_game': games[0].name if games else None,
            'reason': 'AI suggestions require an API key. Please set ANTHROPIC_API_KEY in your .env file.'
        }
    
    try:
        client = Anthropic(api_key=api_key)
        
        # Prepare game data for the prompt
        game_list = []
        for game in games:
            game_info = {
                'name': game.name,
                'min_players': game.min_players,
                'max_players': game.max_players,
                'playing_time': game.playing_time,
                'complexity': game.complexity,
                'description': game.description[:200] if game.description else None
            }
            game_list.append(game_info)
        
        if games:
            # Standard suggestion from owned games
            prompt = f"""You are a board game expert helping a group choose their next game to play.
        
Player count: {player_count}
Available games: {json.dumps(game_list, indent=2)}
Preferences: {json.dumps(preferences)}

Please suggest ONE game from the list that would be best for this group. Consider:
- Player count compatibility
- Playing time
- Complexity level
- Any stated preferences

Respond with a JSON object containing:
- "suggested_game": the exact name of the game you recommend
- "reason": a brief explanation (2-3 sentences) of why this game is the best choice
"""
        else:
            # Purchase suggestion - suggest any game
            prompt = f"""You are a board game expert helping someone choose a new game to buy.
        
Player count: {player_count if player_count else "Any"}
Preferences and context: {json.dumps(preferences)}

Please suggest ONE specific board game to purchase. Consider:
- Player count compatibility (if specified)
- The preferences and collection context provided
- Popular, well-reviewed games that would complement their collection
- Avoid suggesting games they already own (if mentioned in preferences)

Respond with a JSON object containing:
- "suggested_game": the exact name of the game you recommend to buy
- "reason": a brief explanation (2-3 sentences) of why this game would be a great addition to their collection
"""
        
        # Log the request to console
        print("\n" + "="*80)
        print("CLAUDE API REQUEST:")
        print("="*80)
        print(f"Model: claude-3-5-sonnet-20241022")
        print(f"Max tokens: 300")
        print(f"Temperature: 0.7")
        print("\nPROMPT:")
        print(prompt)
        print("="*80)
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            temperature=0.7,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Log the response
        response_text = response.content[0].text
        print("\nCLAUDE API RESPONSE:")
        print("="*80)
        print(response_text)
        print("="*80 + "\n")
        try:
            suggestion = json.loads(response_text)
            return suggestion
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return {
                'suggested_game': games[0].name if games else None,
                'reason': response_text
            }
            
    except Exception as e:
        print(f"Error getting AI suggestion: {str(e)}")
        # Fallback to simple logic
        suitable_games = [g for g in games if g.min_players <= player_count <= g.max_players]
        if suitable_games:
            # Pick a game with moderate complexity
            suitable_games.sort(key=lambda g: abs((g.complexity or 2.5) - 2.5))
            return {
                'suggested_game': suitable_games[0].name,
                'reason': f'This game works well with {player_count} players and has moderate complexity.'
            }
        else:
            return {
                'suggested_game': games[0].name if games else None,
                'reason': 'Selected based on availability.'
            }