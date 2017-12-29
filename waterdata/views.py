"""
Main application views.
"""

from flask import render_template

from . import app, __version__


@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html', version=__version__)
