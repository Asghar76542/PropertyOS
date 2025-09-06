# 🚀 PropertyOS Production Deployment Guide

This guide covers deploying PropertyOS to production using Docker, Docker Compose, and modern deployment practices.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis (if not using Docker)
- SSL certificates (for HTTPS)

## 🛠️ Quick Production Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.production

# Edit production environment variables
nano .env.production
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secure random key (32+ characters)
- `APP_URL`: Your domain (e.g., https://propertyos.com)
- `DB_PASSWORD`: Secure database password
- `REDIS_PASSWORD`: Secure Redis password

### 2. Deploy with Docker Compose

```bash
# Full production deployment
./start.sh deploy

# Or manually with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Database Migration

```bash
# Run database migrations
npm run db:migrate:prod

# Or inside the container
docker-compose exec propertyos-web npm run db:migrate:prod
```

## 🐳 Docker Deployment Options

### Option 1: Full Stack with Docker Compose (Recommended)

```bash
./start.sh deploy
```

This deploys:
- PostgreSQL database
- Redis cache
- PropertyOS web application
- Nginx reverse proxy

### Option 2: Docker Container Only

```bash
./start.sh docker
```

This runs just the PropertyOS app in a container (requires external database).

### Option 3: Manual Docker Build

```bash
# Build image
docker build -t propertyos .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  propertyos
```

## 🔧 Production Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ |
| `APP_URL` | Your application domain | ✅ |
| `REDIS_URL` | Redis connection string | ❌ |
| `SMTP_HOST` | Email server host | ❌ |
| `SMTP_USER` | Email username | ❌ |
| `SMTP_PASS` | Email password | ❌ |

### Database Setup

**PostgreSQL Configuration:**
```sql
CREATE DATABASE propertyos;
CREATE USER propertyos_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE propertyos TO propertyos_user;
```

### SSL/HTTPS Setup

1. **Obtain SSL certificates** (Let's Encrypt recommended):
```bash
certbot certonly --standalone -d your-domain.com
```

2. **Copy certificates to ssl directory:**
```bash
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

3. **Update nginx.conf** to enable HTTPS (uncomment HTTPS section)

## 🔒 Security Considerations

### Required Security Updates

1. **Change all default passwords**
2. **Generate strong NEXTAUTH_SECRET**
3. **Configure firewall rules**
4. **Enable SSL/HTTPS**
5. **Set up regular backups**

### Security Headers

The application includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting

Nginx configuration includes:
- API endpoints: 10 requests/second
- Auth endpoints: 5 requests/minute
- General rate limiting protection

## 📊 Monitoring & Maintenance

### Health Checks

Monitor application health:
```bash
curl http://localhost:3000/api/health
```

### Log Management

View logs:
```bash
# Application logs
docker-compose logs -f propertyos-web

# All services logs
docker-compose logs -f

# Nginx logs
tail -f logs/nginx/access.log
```

### Database Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U propertyos_user propertyos > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U propertyos_user propertyos < backup.sql
```

## 🚀 Performance Optimization

### Production Optimizations Included

- **Next.js standalone output** for smaller Docker images
- **Image optimization** with WebP/AVIF support
- **Gzip compression** via Nginx
- **Static file caching** with proper headers
- **Database connection pooling**
- **Redis caching** for sessions

### Resource Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB
- Network: 100 Mbps

**Recommended for Production:**
- CPU: 4 cores
- RAM: 4GB
- Storage: 50GB SSD
- Network: 1 Gbps

## 🔄 Updates & Maintenance

### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./start.sh deploy
```

### Database Migrations

```bash
# Apply new migrations
npm run db:migrate:prod
```

### Zero-Downtime Deployments

1. Build new image with different tag
2. Update docker-compose.yml
3. Rolling update with Docker Compose

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Application Won't Start**
   - Check logs: `docker-compose logs propertyos-web`
   - Verify environment variables
   - Ensure all migrations are applied

3. **SSL/HTTPS Issues**
   - Verify certificate files exist
   - Check Nginx configuration
   - Ensure ports 80/443 are open

### Debug Commands

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --details propertyos-web

# Access container shell
docker-compose exec propertyos-web sh

# Test database connection
docker-compose exec postgres psql -U propertyos_user propertyos
```

## 📞 Support

For deployment support:
1. Check application logs
2. Review this deployment guide
3. Create an issue with logs and configuration details

---

**Security Note:** Always use strong passwords, enable HTTPS, and regularly update your deployment for security patches.
