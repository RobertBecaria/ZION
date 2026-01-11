# gunicorn.conf.py - Production configuration for ZION.CITY API
# Optimized for: i7-8700 (6 cores / 12 threads) | 64GB RAM
# Usage: gunicorn server:app -c gunicorn.conf.py

import multiprocessing
import os

# =============================================================================
# WORKER CONFIGURATION
# =============================================================================
# Formula for CPU-bound: (2 * CPU cores) + 1 = 13 workers
# With 64GB RAM, we can afford more workers and threads

workers = int(os.environ.get('GUNICORN_WORKERS', 13))
threads = int(os.environ.get('GUNICORN_THREADS', 4))  # 4 threads per worker
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 2000  # Increased for more concurrent connections

# Total capacity: 13 workers × 4 threads = 52 concurrent requests

# =============================================================================
# MEMORY MANAGEMENT
# =============================================================================
# Restart workers periodically to prevent memory leaks
max_requests = 10000  # Increased - more RAM available
max_requests_jitter = 1000

# Worker memory limit (kill if exceeds)
# With 64GB RAM, we can be generous
limit_request_line = 8190
limit_request_fields = 200
limit_request_field_size = 16380

# =============================================================================
# TIMEOUTS
# =============================================================================
timeout = 120  # Worker timeout (for slow AI requests)
graceful_timeout = 60  # More time for graceful shutdown
keepalive = 10  # Keep-alive connections

# =============================================================================
# SERVER SOCKET
# =============================================================================
bind = os.environ.get('BIND', '0.0.0.0:8001')
backlog = 4096  # Increased for high traffic

# =============================================================================
# LOGGING
# =============================================================================
accesslog = os.environ.get('ACCESS_LOG', '/app/logs/access.log')
errorlog = os.environ.get('ERROR_LOG', '/app/logs/error.log')
loglevel = os.environ.get('LOG_LEVEL', 'info')
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sμs'

# Capture output
capture_output = True
enable_stdio_inheritance = True

# =============================================================================
# PROCESS NAMING
# =============================================================================
proc_name = 'zion-city-api'

# =============================================================================
# PERFORMANCE TUNING
# =============================================================================
# Pre-fork workers for faster startup
preload_app = True

# Reuse port for zero-downtime restarts
reuse_port = True

# =============================================================================
# HOOKS
# =============================================================================
def on_starting(server):
    print(f"🚀 Starting ZION.CITY API")
    print(f"   Workers: {workers}")
    print(f"   Threads per worker: {threads}")
    print(f"   Total capacity: {workers * threads} concurrent requests")

def worker_int(worker):
    print(f"⚠️ Worker {worker.pid} received INT signal")

def worker_abort(worker):
    print(f"❌ Worker {worker.pid} was aborted")

def post_fork(server, worker):
    print(f"✅ Worker {worker.pid} spawned")

def worker_exit(server, worker):
    print(f"👋 Worker {worker.pid} exited")
