# HTTPS Deployment Guide

This guide explains how to deploy MADACE with HTTPS for secure external access.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Options](#deployment-options)
3. [Option 1: Docker with Caddy (Recommended)](#option-1-docker-with-caddy-recommended)
4. [Option 2: Cloud Platform Deployment](#option-2-cloud-platform-deployment)
5. [Option 3: Nginx with Let's Encrypt](#option-3-nginx-with-lets-encrypt)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Domain name pointing to your server (e.g., madace.yourdomain.com)
- Docker and Docker Compose installed
- Ports 80 and 443 open on your firewall

### Deploy with HTTPS (Caddy)

```bash
# 1. Create data directory
mkdir -p madace-data logs/caddy

# 2. Set your domain name
export DOMAIN=madace.yourdomain.com

# 3. Start with HTTPS
docker-compose -f docker-compose.https.yml up -d

# 4. Check logs
docker-compose -f docker-compose.https.yml logs -f
```

**That's it!** Caddy will automatically:

- Obtain TLS certificates from Let's Encrypt
- Configure HTTPS
- Redirect HTTP to HTTPS
- Renew certificates automatically

Access your application at: **https://madace.yourdomain.com**

---

## Deployment Options

### Option 1: Docker with Caddy (Recommended)

**Pros:**

- ✅ Automatic TLS certificate management
- ✅ Zero-configuration HTTPS
- ✅ Automatic certificate renewal
- ✅ Built-in HTTP/2 and HTTP/3 support
- ✅ Simple configuration

**Cons:**

- ⚠️ Requires Docker
- ⚠️ Requires domain name

**Best for:** Self-hosted deployments, VPS, dedicated servers

### Option 2: Cloud Platform Deployment

**Pros:**

- ✅ Automatic HTTPS (platform-managed)
- ✅ Zero infrastructure management
- ✅ CDN and global distribution
- ✅ Automatic scaling

**Cons:**

- ⚠️ Monthly costs (varies by platform)
- ⚠️ Vendor lock-in

**Best for:** Production deployments, teams, enterprises

### Option 3: Nginx with Let's Encrypt

**Pros:**

- ✅ Battle-tested reverse proxy
- ✅ Fine-grained control
- ✅ High performance

**Cons:**

- ⚠️ Manual certificate management
- ⚠️ More complex configuration
- ⚠️ Requires certbot for automation

**Best for:** Existing nginx infrastructure, custom requirements

---

## Option 1: Docker with Caddy (Recommended)

### Step 1: Configure DNS

Point your domain to your server's IP address:

```
# DNS A Record
madace.yourdomain.com  →  YOUR_SERVER_IP
```

Wait for DNS propagation (can take up to 48 hours, usually 5-15 minutes).

### Step 2: Prepare Environment

```bash
# Create necessary directories
mkdir -p madace-data logs/caddy

# Set your domain (replace with your actual domain)
export DOMAIN=madace.yourdomain.com

# Or create .env file
echo "DOMAIN=madace.yourdomain.com" > .env.https
```

### Step 3: Configure Firewall

```bash
# Allow HTTP (port 80) for Let's Encrypt challenge
sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

### Step 4: Deploy

```bash
# Start services
docker-compose -f docker-compose.https.yml up -d

# Watch logs
docker-compose -f docker-compose.https.yml logs -f caddy
```

### Step 5: Verify

```bash
# Check certificate
curl -I https://madace.yourdomain.com

# Should see:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains; preload
```

### Step 6: Setup Complete!

Your MADACE application is now accessible at:

- **https://madace.yourdomain.com** (HTTPS - secure)
- http://madace.yourdomain.com (HTTP - auto-redirects to HTTPS)

### Maintenance

```bash
# View logs
docker-compose -f docker-compose.https.yml logs -f

# Restart services
docker-compose -f docker-compose.https.yml restart

# Stop services
docker-compose -f docker-compose.https.yml down

# Update application
git pull
docker-compose -f docker-compose.https.yml build --no-cache
docker-compose -f docker-compose.https.yml up -d
```

### Certificate Management

Caddy handles everything automatically:

- Obtains certificates on first start
- Renews certificates 30 days before expiry
- Stores certificates in Docker volume `caddy-data`

**Manual certificate check:**

```bash
# Check certificate expiry
docker exec madace-caddy caddy list-certificates
```

---

## Option 2: Cloud Platform Deployment

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Your app will be available at:
# https://madace-method-v2.vercel.app (or your custom domain)
```

**Automatic HTTPS:** Yes, managed by Vercel

**Custom Domain:**

```bash
# Add custom domain
vercel domains add madace.yourdomain.com

# Follow DNS instructions
# Vercel will automatically provision SSL certificate
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Your app will be available at:
# https://madace-method-v2.netlify.app (or your custom domain)
```

**Automatic HTTPS:** Yes, managed by Netlify

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up

# Add custom domain in Railway dashboard
# HTTPS is automatic
```

---

## Option 3: Nginx with Let's Encrypt

### Step 1: Install Nginx and Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install nginx certbot python3-certbot-nginx
```

### Step 2: Configure Nginx

Create `/etc/nginx/sites-available/madace`:

```nginx
# HTTP (for Let's Encrypt challenge)
server {
    listen 80;
    listen [::]:80;
    server_name madace.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name madace.yourdomain.com;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/madace.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/madace.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/madace /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Obtain SSL Certificate

```bash
# Obtain certificate
sudo certbot --nginx -d madace.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)
```

### Step 5: Test Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# If successful, certbot will auto-renew certificates
```

---

## Security Considerations

### 1. Environment Variables

**Never commit secrets to git:**

```bash
# Add to .gitignore
echo ".env.https" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. Strong TLS Configuration

The provided Caddy and Nginx configurations use:

- TLS 1.2 and 1.3 only (no TLS 1.0/1.1)
- Strong cipher suites
- HSTS enabled
- Security headers

### 3. Firewall Rules

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. API Key Protection

- API keys are stored in `.env` files (git-ignored)
- Never log API keys
- Use environment variables in production

### 5. Rate Limiting

Caddy configuration includes optional rate limiting:

```caddyfile
rate_limit {
    zone madace {
        key {remote_host}
        events 100
        window 1m
    }
}
```

### 6. Regular Updates

```bash
# Update Docker images
docker-compose -f docker-compose.https.yml pull
docker-compose -f docker-compose.https.yml up -d

# Update Node.js dependencies
npm audit fix
```

---

## Troubleshooting

### Certificate Not Obtained

**Problem:** Caddy cannot obtain certificate

**Solutions:**

1. **Check DNS:**

   ```bash
   dig madace.yourdomain.com
   nslookup madace.yourdomain.com
   ```

2. **Check port 80 is accessible:**

   ```bash
   curl http://madace.yourdomain.com
   ```

3. **Check Caddy logs:**

   ```bash
   docker-compose -f docker-compose.https.yml logs caddy
   ```

4. **Verify domain ownership:**
   - Let's Encrypt requires port 80 for HTTP-01 challenge
   - Ensure no other service is using port 80

### Connection Refused

**Problem:** Cannot connect to https://madace.yourdomain.com

**Solutions:**

1. **Check services are running:**

   ```bash
   docker-compose -f docker-compose.https.yml ps
   ```

2. **Check firewall:**

   ```bash
   sudo ufw status
   ```

3. **Check application logs:**
   ```bash
   docker-compose -f docker-compose.https.yml logs madace-app
   ```

### Certificate Expired

**Problem:** Certificate has expired

**Solution:**

Caddy auto-renews, but if manual intervention needed:

```bash
# Restart Caddy to force renewal
docker-compose -f docker-compose.https.yml restart caddy

# Or rebuild
docker-compose -f docker-compose.https.yml down
docker volume rm madace_caddy-data
docker-compose -f docker-compose.https.yml up -d
```

### Mixed Content Errors

**Problem:** Browser shows "mixed content" warnings

**Solution:**

Ensure all resources use HTTPS or relative URLs. Check:

- API calls use HTTPS
- External resources (fonts, images) use HTTPS
- No hardcoded HTTP URLs in code

---

## Testing HTTPS

### SSL Labs Test

```bash
# Test SSL configuration
https://www.ssllabs.com/ssltest/analyze.html?d=madace.yourdomain.com
```

**Target Grade:** A or A+

### Security Headers

```bash
# Check security headers
curl -I https://madace.yourdomain.com

# Should include:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
```

### Certificate Validity

```bash
# Check certificate
openssl s_client -connect madace.yourdomain.com:443 -servername madace.yourdomain.com

# Or use online tool
https://www.sslshopper.com/ssl-checker.html
```

---

## Production Checklist

- [ ] Domain DNS configured
- [ ] Firewall rules configured (ports 80, 443)
- [ ] HTTPS deployed (Caddy/Nginx/Cloud)
- [ ] SSL certificate obtained
- [ ] HTTP → HTTPS redirect working
- [ ] Security headers enabled
- [ ] API keys in environment variables (not in code)
- [ ] Logs directory created
- [ ] Backup strategy defined
- [ ] Monitoring set up
- [ ] Auto-renewal tested (if using Caddy/certbot)
- [ ] SSL Labs test passed (A or A+)

---

## Support

For issues or questions:

- Check logs: `docker-compose -f docker-compose.https.yml logs`
- Review [Caddy documentation](https://caddyserver.com/docs/)
- Review [Let's Encrypt documentation](https://letsencrypt.org/docs/)

---

**Security Note:** This configuration follows industry best practices for HTTPS deployment. Regular updates and monitoring are essential for maintaining security.
