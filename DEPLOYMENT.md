# =============================================================================
# ZION.CITY VPS Deployment Guide
# =============================================================================
# Server: i7-8700 (6 cores / 12 threads) | 64GB RAM | 2x 480GB SSD

## 🎯 Resource Allocation

With your hardware, here's how resources are distributed:

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| **Backend (Gunicorn)** | 6 cores | 16 GB (limit) | - |
| **MongoDB** | 4 cores | 12 GB (8GB cache) | SSD 1 |
| **Redis** | 1 core | 4 GB | SSD 1 |
| **Nginx** | 12 workers | 1 GB | - |
| **System/OS** | 1 core | 8 GB | SSD 2 |
| **Available Buffer** | - | 23 GB | ~400 GB |

**Total Capacity:** ~52 concurrent API requests + thousands of static connections

---

## 🚀 Quick Start (10 minutes)

### 1. Install Docker on your server:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Logout and login for group changes to take effect
```

### 2. Clone/Copy your code:
```bash
# Create app directory
sudo mkdir -p /opt/zion-city
cd /opt/zion-city

# Option A: Git clone
git clone https://github.com/YOUR_REPO/zion-city.git .

# Option B: SCP from your machine
# scp -r /path/to/zion/* user@your-server:/opt/zion-city/
```

### 3. Configure environment:
```bash
# Copy and edit environment file
cp .env.production .env
nano .env

# Generate secure passwords:
echo "MONGO_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)"
echo "ADMIN_PASSWORD=$(openssl rand -base64 24)"
```

### 4. Deploy:
```bash
# Build and start (first time takes ~5-10 minutes)
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

### 5. Verify deployment:
```bash
# Health check
curl http://localhost/api/health

# Should return: {"status": "healthy", ...}
```

---

## 📁 File Structure

```
/opt/zion-city/
├── backend/
│   ├── server.py           # Main API
│   ├── eric_agent.py       # AI agent
│   ├── gunicorn.conf.py    # Worker config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── build/              # Generated
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── mongo-init.js           # DB initialization
├── .env                    # Your secrets (don't commit!)
├── .env.production         # Template
├── logs/
├── uploads/
└── backups/
```

---

## 🔧 Management Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f mongodb
docker compose logs -f redis

# Restart services
docker compose restart

# Stop everything
docker compose down

# Rebuild and restart (after code changes)
docker compose up -d --build

# Enter container shell
docker compose exec app bash
docker compose exec mongodb mongosh

# MongoDB admin UI (optional)
docker compose --profile admin up -d mongo-express
# Access at: http://your-server:8081

# Start automated backups
docker compose --profile backup up -d backup
```

---

## 💾 SSD RAID Setup (Optional but Recommended)

With 2x 480GB SSDs, consider RAID 1 for redundancy:

```bash
# Install mdadm
sudo apt install mdadm -y

# Create RAID 1 (mirroring)
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sda /dev/sdb

# Format
sudo mkfs.ext4 /dev/md0

# Mount
sudo mkdir /data
sudo mount /dev/md0 /data

# Add to fstab for auto-mount
echo '/dev/md0 /data ext4 defaults 0 0' | sudo tee -a /etc/fstab

# Update docker to use /data
# Edit /etc/docker/daemon.json:
# { "data-root": "/data/docker" }
```

---

## 🔒 SSL/HTTPS Setup

```bash
# Install certbot
sudo apt install certbot -y

# Get certificate (stop containers first)
docker compose down
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certs
sudo cp -r /etc/letsencrypt /opt/zion-city/ssl/

# Uncomment HTTPS server block in nginx.conf
# Then restart
docker compose up -d

# Auto-renewal (add to crontab)
echo "0 0 1 * * certbot renew --quiet && docker compose restart app" | sudo crontab -
```

---

## 📊 Monitoring

### Real-time stats:
```bash
# Docker stats
docker stats

# System resources
htop

# Disk usage
df -h

# Network connections
ss -tuln
```

### Log analysis:
```bash
# API errors
docker compose logs app 2>&1 | grep -i error

# Slow requests (>5s)
docker compose logs app 2>&1 | grep -E "[5-9][0-9]{3}μs|[0-9]+ms"

# MongoDB queries
docker compose logs mongodb 2>&1 | grep -i slow
```

---

## 🔥 Performance Benchmarks (Expected)

With your hardware, you should achieve:

| Metric | Expected Value |
|--------|----------------|
| API Response Time | < 50ms (avg) |
| Concurrent Users | 500-1000 |
| Requests/Second | 1000+ (static), 100+ (API) |
| MongoDB Queries | < 10ms (indexed) |
| Memory Usage | ~30-40 GB |

### Load Testing:
```bash
# Install wrk
sudo apt install wrk -y

# Test static files
wrk -t12 -c400 -d30s http://localhost/

# Test API
wrk -t12 -c100 -d30s http://localhost/api/health
```

---

## 🆘 Troubleshooting

### Container won't start:
```bash
docker compose logs app --tail=100
docker compose down -v  # Reset volumes
docker compose up -d
```

### MongoDB connection issues:
```bash
# Check MongoDB is running
docker compose exec mongodb mongosh --eval "db.runCommand({ping:1})"

# Check connection from app
docker compose exec app python -c "
from pymongo import MongoClient
import os
c = MongoClient(os.environ['MONGO_URL'])
print(c.server_info()['version'])
"
```

### High memory usage:
```bash
# Check per-container memory
docker stats --no-stream

# Restart specific service
docker compose restart mongodb
```

### Disk full:
```bash
# Clean Docker
docker system prune -a --volumes

# Remove old logs
truncate -s 0 /opt/zion-city/logs/*.log
```

---

## 💡 Pro Tips for Your Hardware

1. **MongoDB Performance**: With 64GB RAM and 8GB WiredTiger cache, most queries will be served from memory

2. **SSD Benefits**: Put MongoDB data on SSD for fast writes. Your 2x 480GB is plenty

3. **No Swap Needed**: With 64GB RAM, disable swap for better performance:
   ```bash
   sudo swapoff -a
   ```

4. **CPU Affinity**: For maximum performance, pin services to specific cores:
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       reservations:
         cpus: '4'
   ```

5. **Network**: Consider 10Gbps NIC if available for maximum throughput

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Logs | `docker compose logs -f` |
| Rebuild | `docker compose up -d --build` |
| Status | `docker compose ps` |
| Shell | `docker compose exec app bash` |
| DB Shell | `docker compose exec mongodb mongosh` |
| Backup | `docker compose --profile backup up` |
