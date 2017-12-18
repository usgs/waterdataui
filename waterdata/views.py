
from flask import render_template

from . import app, __version__

@app.route('/')
def home():
    return render_template('index.html', version=__version__)
