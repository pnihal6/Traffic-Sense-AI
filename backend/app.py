from flask import Flask
from flask_cors import CORS
from routes.stream_routes import streams_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(streams_bp, url_prefix="/streams")

    @app.route("/")
    def home():
        return {"message": "Backend running (streams at /streams/*)"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
