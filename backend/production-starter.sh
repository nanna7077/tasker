#!/bin/bash

# Expects a virtual environment by name "virtenv" to exist in the current directory

source virtenv/bin/activate
python pywsgi.py