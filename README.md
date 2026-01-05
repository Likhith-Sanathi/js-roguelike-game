# js-roguelike-game

A small browser-based roguelike built with a Flask backend and client-side JavaScript.

## Project

`js-roguelike-game` is a lightweight web game combining a Python/Flask server with a JavaScript game frontend. The Flask app serves the game pages, handles user sessions, and stores leaderboard data. The game client lives in `static/js/game.js` and the HTML templates are in `templates/`.

## Features
- Single-player roguelike gameplay in the browser
- Simple leaderboard and user login/signup (Flask-backed)
- Static assets organized under `static/` (sprites, tilesets, audio)

## Prerequisites
- Python 3.9+ (3.10 recommended)
- pip
- (Optional) sqlite3 for local DB initialization

## Installation (Windows / PowerShell)

1. Clone the repository:

```powershell
git clone <repo-url>
cd js-roguelike-game
```

2. Create and activate a virtual environment:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

3. Install dependencies:

If a `requirements.txt` exists, run:

```powershell
pip install -r requirements.txt
```

Otherwise install the minimal required packages:

```powershell
pip install Flask Flask-Session
```

4. Initialize the database (SQLite example):

If you prefer SQLite and the project uses SQL files, you can initialize with:

```powershell
sqlite3 game.db < schema.sql
# or run project-specific DB setup if provided in `database.py`
```

If the app uses a programmatic setup, run the corresponding script or follow `database.py` instructions.

## Running the app (development)

Run directly with Python:

```powershell
python app.py
```

Or use Flask CLI (PowerShell):

```powershell
$env:FLASK_APP = 'app.py'
$env:FLASK_ENV = 'development'
flask run
```

Open `http://127.0.0.1:5000/` in your browser and go to the game page.

## Project structure (key files)
- [app.py](app.py) — Flask application entrypoint
- [database.py](database.py) — DB helpers / models
- [forms.py](forms.py) — Flask-WTF forms (login/signup)
- [templates/](templates/) — HTML templates (game, index, auth, leaderboard)
- [static/js/game.js](static/js/game.js) — Game client logic
- [static/assets/](static/assets/) — sprites, tilesets, music, sfx

## Contributing
Feel free to open issues or PRs. For code changes, create a branch, add tests where applicable, and open a pull request describing your change.

## Credits
See [templates/attributions.html](templates/attributions.html) for asset attributions and licensing information.

## License
Add your preferred license here (e.g., MIT). If none, state "All rights reserved.".

https://github.com/Likhith-Sanathi/js-roguelike-game/blob/master/Screenshot%202025-11-04%20224617.png?raw=true
https://github.com/Likhith-Sanathi/js-roguelike-game/blob/master/Screenshot%202025-11-04%20224739.png?raw=true
https://github.com/Likhith-Sanathi/js-roguelike-game/blob/master/Screenshot%202025-11-04%20224800.png?raw=true
https://github.com/Likhith-Sanathi/js-roguelike-game/blob/master/Screenshot%202025-11-04%20224822.png?raw=true
