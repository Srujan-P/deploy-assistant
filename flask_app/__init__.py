# Author: Prof. MM Ghassemi <ghassem3@msu.edu>

#--------------------------------------------------
# Import Requirements
#--------------------------------------------------
import os
from flask import Flask
from flask_failsafe import failsafe
from flask_session import Session
from datetime import timedelta


#--------------------------------------------------
# Create a Failsafe Web Application
#--------------------------------------------------
@failsafe
def create_app():
	app = Flask(__name__)
	
	# Set secret key for sessions
	app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
	
	# Configure filesystem-based sessions for production
	app.config['SESSION_TYPE'] = 'filesystem'
	app.config['SESSION_FILE_DIR'] = '/app/sessions'
	app.config['SESSION_PERMANENT'] = True
	app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
	app.config['SESSION_USE_SIGNER'] = True
	app.config['SESSION_KEY_PREFIX'] = 'deploy_assistant:'
	
	# Initialize session
	Session(app)
	
	# Database initialization removed - no longer needed

	with app.app_context():
		from . import routes
		return app
