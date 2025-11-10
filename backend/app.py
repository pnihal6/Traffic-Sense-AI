from flask import Flask
from flask_cors import CORS
import os

from db import init_db
from routes.stream_routes import streams_bp
from routes.session_routes import sessions_bp
from routes.model_routes import models_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Ensure uploads dir exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "uploads"), exist_ok=True)

    # Init SQLite
    init_db()

    # Blueprints
    app.register_blueprint(streams_bp, url_prefix="/streams")
    app.register_blueprint(sessions_bp, url_prefix="/")
    app.register_blueprint(models_bp, url_prefix="/")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
