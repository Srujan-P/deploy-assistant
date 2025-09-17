# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, jsonify, session
from werkzeug.datastructures import ImmutableMultiDict
from pprint import pprint
import json
import random
import requests
from functools import wraps

# Authentication helper functions
def is_authenticated():
    """Check if user is authenticated"""
    return session.get('authenticated', False)

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
        name = request.args.get('name', '')
        date = request.args.get('date', '')
        hours = request.args.get('hours', '')
        
        
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
	
@app.route('/api/request-otp', methods=['GET', 'OPTIONS'])
def request_otp():
    """Proxy endpoint to handle OTP request with CORS headers"""
    if request.method == 'OPTIONS':
        # Handle preflight CORS request
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    try:
        # Make the request to the n8n webhook for OTP request
        webhook_url = 'https://n8n.fphn8n.online/webhook/deploy-assistant-otp'
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        
        # Return the response with CORS headers
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/verify-otp', methods=['GET', 'OPTIONS'])
def verify_otp():
    """Proxy endpoint to handle OTP verification with CORS headers"""
    if request.method == 'OPTIONS':
        # Handle preflight CORS request
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, user-attempt'
        }
    
    try:
        # Get the OTP from the request headers
        user_attempt = request.headers.get('user-attempt')
        if not user_attempt:
            return jsonify({'error': 'user-attempt header is required'}), 400
        
        # Get the webhook URL from query parameters
        webhook_url = request.args.get('url')
        if not webhook_url:
            return jsonify({'error': 'Webhook URL is required'}), 400
        
        # Make the request to the n8n webhook with the correct header
        headers = {
            'user-attempt': user_attempt,
            'Content-Type': 'application/json'
        }
        
        response = requests.get(webhook_url, headers=headers, timeout=30)
        response_data = response.json()
        
        # Check if OTP verification was successful
        if response.ok:
            response_data_array = response_data if isinstance(response_data, list) else [response_data]
            if response_data_array and response_data_array[0].get('OTPCheck') in [True, 'true']:
                # Set session as authenticated
                session['authenticated'] = True
                session['user_type'] = 'otp'
        
        # Return the response with CORS headers
        return jsonify(response_data), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, user-attempt'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

