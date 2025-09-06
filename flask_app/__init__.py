# Author: Prof. MM Ghassemi <ghassem3@msu.edu>

#--------------------------------------------------
# Import Requirements
#--------------------------------------------------
import os
from flask import Flask
from flask_failsafe import failsafe


#--------------------------------------------------
# Create a Failsafe Web Application
#--------------------------------------------------
@failsafe
def create_app():
	app = Flask(__name__)
	
	# Set secret key for sessions
	app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
	
	# Database initialization removed - no longer needed

	with app.app_context():
		from . import routes
		return app
