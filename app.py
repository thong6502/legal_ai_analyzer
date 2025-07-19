from flask import Flask
from flask_cors import CORS
from app.routes import register_routes

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Configure CORS
    CORS(app)

    # Configure Flask settings
    app.config['SECRET_KEY'] = 'legal-ai-analyzer-secret-key-change-in-production'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Register all routes
    register_routes(app)

    return app

# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)