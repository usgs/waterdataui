#!/usr/bin/env python

import argparse

from waterdata import app

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', '-ht', type=str)
    args = parser.parse_args()
    host_val = args.host
    if host_val is not None:
        host = host_val
    else:
        host = '127.0.0.1'
    app.run(host=host, port=5050, threaded=True)
    # run from the command line as follows
    # python run.py -ht <ip address of your choice>