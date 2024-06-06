import os
import sys
import logging

import numpy as np
from flask import Flask, render_template, request, Response

from .preprocessing import extract_fbanks
from .predictions import get_embeddings, get_cosine_distance

app = Flask(__name__)

DATA_DIR = 'data_files/'
THRESHOLD = 0.45
POSITVE_MEAN_THRESHOLD = .65  

sys.path.append('..')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/login/<string:username>', methods=['POST'])
def login(username):
    filename = _save_file(request, username)
    print(f"Saved file for user {username}: {filename}", flush=True)
    
    fbanks = extract_fbanks(filename)
    print(f"Extracted fbanks: {fbanks.shape}", flush=True)
    
    embeddings = get_embeddings(fbanks)
    print(f"Generated embeddings: {embeddings.shape}", flush=True)
    
    stored_embeddings = np.load(DATA_DIR + username + '/embeddings.npy')
    stored_embeddings = stored_embeddings.reshape((1, -1))
    print(f"Loaded stored embeddings: {stored_embeddings.shape}", flush=True)
    
    distances = get_cosine_distance(embeddings, stored_embeddings)
    print(f"Cosine distances: {distances}", flush=True)
    
    mean_distance = np.mean(distances)
    print(f"Mean distance: {mean_distance}", flush=True)
    
    positives = distances < THRESHOLD
    positives_mean = np.mean(positives)
    print(f"Positives mean: {positives_mean}", flush=True)
    
    if positives_mean >= POSITVE_MEAN_THRESHOLD:
        return Response('SUCCESS', mimetype='application/json')
    else:
        return Response('FAILURE', mimetype='application/json')


@app.route('/register/<string:username>', methods=['POST'])
def register(username):
    filename = _save_file(request, username)
    print(f"Saved file for user {username}: {filename}", flush=True)
    
    fbanks = extract_fbanks(filename)
    print(f"Extracted fbanks: {fbanks.shape}", flush=True)
    
    embeddings = get_embeddings(fbanks)
    print(f"Generated embeddings: {embeddings.shape}", flush=True)
    
    mean_embeddings = np.mean(embeddings, axis=0)
    print(f"Mean embeddings: {mean_embeddings.shape}", flush=True)
    
    np.save(DATA_DIR + username + '/embeddings.npy', mean_embeddings)
    print(f"Saved embeddings to {DATA_DIR + username + '/embeddings.npy'}", flush=True)
    
    return Response('', mimetype='application/json')


def _save_file(request_, username):
    file = request_.files['file']
    dir_ = DATA_DIR + username
    if not os.path.exists(dir_):
        os.makedirs(dir_)

    filename = DATA_DIR + username + '/sample.wav'
    file.save(filename)
    return filename
