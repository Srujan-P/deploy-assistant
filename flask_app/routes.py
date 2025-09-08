# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request, jsonify
from werkzeug.datastructures import ImmutableMultiDict
from pprint import pprint
import json
import random
import requests

@app.route('/')
def root():
	return redirect('/home')

@app.route('/home')
def home():
	return render_template('home.html')
	
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
        
        # Return the response with CORS headers
        return jsonify(response.json()), response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, user-attempt'
        }
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
