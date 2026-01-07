# gunicorn.conf.py - Production configuration for ZION.CITY API
# Usage: gunicorn server:app -c gunicorn.conf.py

import multiprocessing
import os

# Worker configuration
# Formula: (2 * CPU cores) + 1
workers = int(os.environ.get('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000

# Prevent memory leaks by restarting workers periodically
max_requests = 5000
max_requests_jitter = 500

# Timeouts
timeout = 120  # Worker timeout (for slow AI requests)
graceful_timeout = 30
keepalive = 5

# Server socket
bind = os.environ.get('BIND', '0.0.0.0:8001')
backlog = 2048

# Logging
accesslog = os.environ.get('ACCESS_LOG', '-')  # '-' for stdout
errorlog = os.environ.get('ERROR_LOG', '-')
loglevel = os.environ.get('LOG_LEVEL', 'warning')
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sμs'

# Process naming
proc_name = 'zion-city-api'

# Security limits
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Hooks
def on_starting(server):
    print(f"🚀 Starting ZION.CITY API with {workers} workers")

def worker_int(worker):
    print(f"⚠️ Worker {worker.pid} received INT signal")

def worker_abort(worker):
    print(f"❌ Worker {worker.pid} was aborted")
