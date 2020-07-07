import multiprocessing


bind = ':5050'
workers = multiprocessing.cpu_count()*2 + 1
