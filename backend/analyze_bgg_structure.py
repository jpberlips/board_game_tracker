#!/usr/bin/env python3
"""Analyze BGG page structure more thoroughly"""

import requests
from bs4 import BeautifulSoup
import re

url = "https://boardgamegeek.com/boardgame/233078/twilight-imperium-fourth-edition"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get(url, headers=headers)
response.raise_for_status()
soup = BeautifulSoup(response.content, 'html.parser')

print("Analyzing BGG page structure...")
print("=" * 60)

# Look for game header info
print("\n1. Game header structure:")
game_header = soup.find('div', class_='game-header')
if game_header:
    print("Found game-header div")
    # Look for title
    title = game_header.find('h1')
    if title:
        print(f"Title: {title.get_text(strip=True)}")

# Look for gameplay details
print("\n2. Gameplay details:")
gameplay_divs = soup.find_all('div', class_=lambda x: x and 'gameplay' in str(x).lower())
for div in gameplay_divs[:3]:
    print(f"Found div with classes: {div.get('class')}")
    print(f"Content preview: {div.get_text(strip=True)[:100]}...")

# Look for statistics/ratings section
print("\n3. Statistics/Ratings section:")
stats_sections = soup.find_all(['div', 'section'], class_=lambda x: x and ('stat' in str(x).lower() or 'rating' in str(x).lower()))
for section in stats_sections[:5]:
    print(f"\nFound {section.name} with classes: {section.get('class')}")
    print(f"Content preview: {section.get_text(strip=True)[:150]}...")

# Look for ranking data in script tags (often data is in JSON)
print("\n4. Script tags containing ranking data:")
scripts = soup.find_all('script')
for i, script in enumerate(scripts):
    if script.string and ('rank' in script.string.lower() or 'ranking' in script.string.lower()):
        print(f"\nScript {i} contains ranking-related content")
        # Extract JSON-like patterns
        json_patterns = re.findall(r'"rank[^"]*":\s*\d+', script.string, re.IGNORECASE)
        for pattern in json_patterns[:5]:
            print(f"  Found: {pattern}")

# Look for specific BGG ranking patterns
print("\n5. Looking for BGG-specific ranking patterns:")
# BGG often uses specific divs for rankings
ranking_containers = soup.find_all('div', class_=re.compile(r'rank|rating', re.IGNORECASE))
for container in ranking_containers[:10]:
    text = container.get_text(strip=True)
    if any(word in text.lower() for word in ['overall', 'strategy', 'family', 'rank']):
        print(f"\nPotential ranking container:")
        print(f"Classes: {container.get('class')}")
        print(f"Text: {text[:200]}")

# Look for ul/li structures that might contain rankings
print("\n6. Looking for list structures with rankings:")
lists = soup.find_all('ul')
for ul in lists:
    list_text = ul.get_text(strip=True)
    if 'rank' in list_text.lower():
        print(f"\nFound UL with ranking info:")
        print(f"Content: {list_text[:200]}...")
        # Show first few list items
        for li in ul.find_all('li')[:3]:
            print(f"  - {li.get_text(strip=True)[:100]}")