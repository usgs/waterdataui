#!/usr/bin/env python3.6

"""
Entrypoint for Flask development server.
"""

import argparse

from waterdata import app


def run_server(port=5050):
    """Run a development server on the given port."""
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', '-ht', type=str)
    args = parser.parse_args()
    host_val = args.host
    if host_val is not None:
        host = host_val
    else:
        host = '127.0.0.1'
    app.run(host=host, port=port, threaded=True)
    # run from the command line as follows
    # python run.py -ht <ip address of your choice>


if __name__ == '__main__':
    run_server()
