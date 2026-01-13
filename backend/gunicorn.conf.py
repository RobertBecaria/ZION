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
worker_connections = 1024  # Optimized - sufficient for most use cases

# Total capacity: 13 workers × 4 threads = 52 concurrent requests

# =============================================================================
# MEMORY MANAGEMENT
# =============================================================================
# Restart workers periodically to prevent memory leaks
# Optimized values to balance stability with performance
max_requests = 6000  # Restart workers more frequently to prevent memory bloat
max_requests_jitter = 600  # Random jitter to prevent thundering herd

# Worker memory limit (kill if exceeds)
# With 64GB RAM, we can be generous
limit_request_line = 8190
limit_request_fields = 200
limit_request_field_size = 16380

# =============================================================================
# TIMEOUTS
# =============================================================================
timeout = 120  # Worker timeout (for slow AI requests)
graceful_timeout = 30  # Graceful shutdown timeout
keepalive = 5  # Keep-alive connections (optimized)

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
