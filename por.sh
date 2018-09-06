#!/bin/bash
# Compares h1.html and h0.html after removing \n.
# The same may be used for diff.

cmp <(tr -d '\n' < h1.html) <(tr -d '\n' <h0.html)
