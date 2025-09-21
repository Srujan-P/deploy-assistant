# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, jsonify, session
from werkzeug.datastructures import ImmutableMultiDict
from pprint import pprint
import json
import random
import requests
from functools import wraps
import os
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from datetime import datetime, timedelta

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8080/callback')

# Allowed users list - Add authorized email addresses here
# You can add users in two ways:
# 1. Hardcoded list below (for small teams)
# 2. Environment variable ALLOWED_USERS (comma-separated emails)
ALLOWED_USERS = [
    'srujan.r.patil@gmail.com',
    'thesocialappdev@gmail.com',
    'admin@halfblynd.com',
    'jacobguty5@gmail.com',
]


# Load additional users from environment variable
env_allowed_users = os.environ.get('ALLOWED_USERS', '')
if env_allowed_users:
    env_users = [email.strip().lower() for email in env_allowed_users.split(',') if email.strip()]
    ALLOWED_USERS.extend(env_users)
    ALLOWED_USERS = list(set(ALLOWED_USERS))  # Remove duplicates

# OAuth 2.0 scopes
SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

# Authentication helper functions
def is_authenticated():
    """Check if user is authenticated"""
    return session.get('authenticated', False)

def is_user_authorized(email):
    """Check if user email is in the allowed users list"""
    if not email:
        return False
    return email.lower() in [user.lower() for user in ALLOWED_USERS]


def is_clock_authorized(email):
    """Check if user email is authorized to use clock in/out functionality"""
    if not email:
        return False
    # All users except thesocialappdev@gmail.com can use clock in/out
    return email.lower() != 'thesocialappdev@gmail.com'

def is_record_time_authorized(email):
    """Check if user email is authorized to access record time functionality"""
    if not email:
        return False
    # All users except thesocialappdev@gmail.com can access record time
    return email.lower() != 'thesocialappdev@gmail.com'

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_authenticated():
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

def redirect_if_authenticated(f):
    """Decorator to redirect authenticated users to home"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if is_authenticated():
            return redirect('/home')
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def root():
    if is_authenticated():
        return redirect('/home')
    return redirect('/login')

@app.route('/login')
@redirect_if_authenticated
def login():
    return render_template('login.html')

@app.route('/home')
@require_auth
def home():
	return render_template('home.html')

@app.route('/time')
@require_auth
def time():
	view = request.args.get('view', 'management')  # Default to management view
	return render_template('time.html', view=view)

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle logout"""
    session.clear()
    return jsonify({'success': True, 'redirect': '/login'})

@app.route('/api/gcloud-init', methods=['GET', 'OPTIONS'])
def gcloud_init():
    """Proxy endpoint for GCloud init with CORS headers"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        webhook_url = 'https://n8n.fphn8n.online/webhook/073a03d9-00e5-45a5-9323-50afc82eee83'
        headers = {'Content-Type': 'application/json'}
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        # Handle empty response
        if response.text.strip():
            try:
                response_data = response.json()
            except ValueError:
                # If response is not JSON, return it as text
                response_data = {'output': response.text, 'status': 'success'}
        else:
            response_data = {'output': 'GCloud init executed successfully but returned no output', 'status': 'success'}
        
        return jsonify(response_data), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/docker-build', methods=['GET', 'OPTIONS'])
def docker_build():
    """Proxy endpoint for Docker build with CORS headers"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        webhook_url = 'https://n8n.fphn8n.online/webhook/1c9ceed1-750f-48de-b3c9-15e3a31beb6d'
        headers = {'Content-Type': 'application/json'}
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/docker-push', methods=['GET', 'OPTIONS'])
def docker_push():
    """Proxy endpoint for Docker push with CORS headers"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        webhook_url = 'https://n8n.fphn8n.online/webhook/799c704a-b2c3-4448-a70d-28a554a03d16'
        headers = {'Content-Type': 'application/json'}
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/gcloud-deploy', methods=['GET', 'OPTIONS'])
def gcloud_deploy():
    """Proxy endpoint for GCloud deploy with CORS headers"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        webhook_url = 'https://n8n.fphn8n.online/webhook/77435c44-958c-43e0-8421-601a7e113188'
        headers = {'Content-Type': 'application/json'}
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/submit-time', methods=['GET', 'OPTIONS'])
@require_auth
def submit_time():
    """Proxy endpoint for time entry submission with CORS headers"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, name, date, hours'
        }
    
    try:
        webhook_url = 'https://n8n.fphn8n.online/webhook/7d88c61d-fb99-4ba5-b1bd-1dabbdfc9608'
        
        # Get data from query parameters
        date = request.args.get('date', '')
        hours = request.args.get('hours', '')
        
        # Auto-detect name from logged-in user's email
        user_name = session.get('user_name', '')
        user_email = session.get('user_email', '')
        
        # Email to display name mapping
        email_to_name_mapping = {
            'srujan.r.patil@gmail.com': 'Big Sru',
            'admin@halfblynd.com': 'Trevor',
            'jacobguty5@gmail.com': 'Jacob',
        }
        
        # Get display name from mapping, fallback to session name, then email
        name = email_to_name_mapping.get(user_email, user_name or user_email)
        
        
        headers = {
            'Content-Type': 'application/json',
            'name': name,
            'date': date,
            'hours': hours
        }
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        # Handle empty response
        if response.text.strip():
            try:
                response_data = response.json()
            except ValueError:
                response_data = {'output': response.text, 'status': 'success'}
        else:
            response_data = {'output': 'Time entry submitted successfully', 'status': 'success'}
        
        return jsonify(response_data), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, name, date, hours'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Google OAuth Routes
@app.route('/auth/google')
def google_auth():
    """Initiate Google OAuth flow"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return jsonify({'error': 'Google OAuth not configured'}), 500
    
    # Use the scopes that match what Google Console expects
    minimal_scopes = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ]
    
    # Create OAuth flow
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=minimal_scopes
    )
    flow.redirect_uri = GOOGLE_REDIRECT_URI
    
    # Generate authorization URL
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    # Store state in session for security
    session['oauth_state'] = state
    
    return redirect(authorization_url)

@app.route('/callback')
def google_callback():
    """Handle Google OAuth callback"""
    try:
        # Get authorization code from callback
        code = request.args.get('code')
        state = request.args.get('state')
        
        # Verify state parameter
        if state != session.get('oauth_state'):
            return jsonify({'error': 'Invalid state parameter'}), 400
        
        if not code:
            return jsonify({'error': 'Authorization code not provided'}), 400
        
        # Use the scopes that match what Google Console expects
        minimal_scopes = [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=minimal_scopes
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Exchange authorization code for tokens
        flow.fetch_token(code=code)
        
        # Get user info from Google
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Check if user is authorized
        user_email = id_info.get('email')
        if not is_user_authorized(user_email):
            # Clear OAuth state
            session.pop('oauth_state', None)
            return render_template('login.html', 
                                 error_message=f"Access denied. Your email ({user_email}) is not authorized to access this application. Please contact the administrator.")
        
        # Store user information in session
        session['authenticated'] = True
        session['user_type'] = 'google_oauth'
        session['user_email'] = user_email
        session['user_name'] = id_info.get('name')
        session['user_picture'] = id_info.get('picture')
        
        # Clear OAuth state
        session.pop('oauth_state', None)
        
        return redirect('/home')
        
    except Exception as e:
        print(f"OAuth callback error: {str(e)}")
        return jsonify({'error': f'OAuth authentication failed: {str(e)}'}), 500


@app.route('/auth/google/direct')
def google_auth_direct():
    """Direct Google OAuth authentication (for testing)"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return jsonify({'error': 'Google OAuth not configured'}), 500
    
    # For testing purposes, create a simple auth URL
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope={'+'.join(SCOPES)}&"
        f"response_type=code&"
        f"access_type=offline"
    )
    
    return jsonify({'auth_url': auth_url})

@app.route('/api/user-info', methods=['GET'])
@require_auth
def get_user_info():
    """Get current user information"""
    try:
        user_email = session.get('user_email', 'user@example.com')
        user_info = {
            'name': session.get('user_name', 'User'),
            'email': user_email,
            'user_type': session.get('user_type', 'unknown'),
            'can_use_clock': is_clock_authorized(user_email),
            'can_record_time': is_record_time_authorized(user_email)
        }
        return jsonify(user_info)
    except Exception as e:
        return jsonify({'error': f'Failed to get user info: {str(e)}'}), 500

@app.route('/api/allowed-users', methods=['GET'])
@require_auth
def get_allowed_users():
    """Get list of allowed users (for debugging)"""
    try:
        return jsonify({
            'allowed_users': ALLOWED_USERS,
            'total_count': len(ALLOWED_USERS)
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get allowed users: {str(e)}'}), 500

@app.route('/api/clock-in', methods=['POST'])
@require_auth
def clock_in():
    """Handle clock in"""
    try:
        user_email = session.get('user_email', '')
        if not is_clock_authorized(user_email):
            return jsonify({'error': 'Access denied. You are not authorized to use clock in/out functionality.'}), 403
        
        current_time = datetime.now()
        
        # Check if already clocked in
        if session.get('clock_status') == 'in':
            return jsonify({'error': 'Already clocked in'}), 400
        
        # Store clock in data in session
        session['clock_status'] = 'in'
        session['clock_in_time'] = current_time.isoformat()
        session['clock_in_date'] = current_time.strftime('%Y-%m-%d')
        
        return jsonify({
            'success': True,
            'clock_in_time': current_time.isoformat(),
            'clock_in_date': current_time.strftime('%Y-%m-%d'),
            'message': 'Successfully clocked in'
        })
    except Exception as e:
        return jsonify({'error': f'Clock in failed: {str(e)}'}), 500

@app.route('/api/clock-out', methods=['POST'])
@require_auth
def clock_out():
    """Handle clock out"""
    try:
        user_email = session.get('user_email', '')
        if not is_clock_authorized(user_email):
            return jsonify({'error': 'Access denied. You are not authorized to use clock in/out functionality.'}), 403
        
        current_time = datetime.now()
        
        # Check if clocked in
        if session.get('clock_status') != 'in':
            return jsonify({'error': 'Not clocked in'}), 400
        
        # Get clock in time
        clock_in_time_str = session.get('clock_in_time')
        if not clock_in_time_str:
            return jsonify({'error': 'Clock in time not found'}), 400
        
        clock_in_time = datetime.fromisoformat(clock_in_time_str)
        clock_in_date = session.get('clock_in_date', clock_in_time.strftime('%Y-%m-%d'))
        
        # Calculate time difference
        time_diff = current_time - clock_in_time
        hours_worked = time_diff.total_seconds() / 3600  # Convert to hours
        
        # Clear clock status from session
        session.pop('clock_status', None)
        session.pop('clock_in_time', None)
        session.pop('clock_in_date', None)
        
        return jsonify({
            'success': True,
            'clock_out_time': current_time.isoformat(),
            'clock_in_date': clock_in_date,
            'hours_worked': round(hours_worked, 2),
            'time_worked': str(time_diff).split('.')[0],  # Remove microseconds
            'message': f'Successfully clocked out. Worked {round(hours_worked, 2)} hours on {clock_in_date}'
        })
    except Exception as e:
        return jsonify({'error': f'Clock out failed: {str(e)}'}), 500

@app.route('/api/clock-status', methods=['GET'])
@require_auth
def get_clock_status():
    """Get current clock status"""
    try:
        user_email = session.get('user_email', '')
        if not is_clock_authorized(user_email):
            return jsonify({'error': 'Access denied. You are not authorized to use clock in/out functionality.'}), 403
        
        clock_status = session.get('clock_status', 'out')
        clock_in_time = session.get('clock_in_time')
        clock_in_date = session.get('clock_in_date')
        
        return jsonify({
            'status': clock_status,
            'clock_in_time': clock_in_time,
            'clock_in_date': clock_in_date
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get clock status: {str(e)}'}), 500

	

