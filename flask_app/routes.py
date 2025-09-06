# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app
from flask import render_template, redirect, request
from werkzeug.datastructures import ImmutableMultiDict
from pprint import pprint
import json
import random

@app.route('/')
def root():
	return redirect('/home')

@app.route('/home')
def home():
	return render_template('home.html')

