# SSL Certificate Setup for Bootstrap Node 02

## Overview
This document describes the SSL certificate configuration for the IPFS Bootstrap Node 02 (27.255.70.17).

## Certificate Details
- **Type**: Wildcard SSL Certificate
<<<<<<< HEAD
- **Domain**: `*.example.com`
- **Coverage**: All subdomains under example.com
=======
- **Domain**: `*.example.com`
- **Coverage**: All subdomains under example.com
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
- **Issuer**: GlobalSign GCC R6 AlphaSSL CA 2025
- **Valid From**: July 10, 2025
- **Valid Until**: August 11, 2026
- **Format**: PEM (nginx compatible)

## File Locations
```
<<<<<<< HEAD
bongaquino-ipfs/docker-compose/bongaquino-ipfs-bootstrap-02/nginx/ssl/
├── wildcard.example.com.pem (Certificate)
└── wildcard.example.com.key (Private Key)
=======
bongaquino-ipfs/docker-compose/bongaquino-ipfs-bootstrap-02/nginx/ssl/
├── wildcard.example.com.pem (Certificate)
└── wildcard.example.com.key (Private Key)
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

## Nginx Configuration
The wildcard certificate is configured for both IPFS services:
<<<<<<< HEAD
- **ipfs.example.com** - IPFS API endpoint
- **gateway.example.com** - IPFS Gateway endpoint
=======
- **ipfs.example.com** - IPFS API endpoint
- **gateway.example.com** - IPFS Gateway endpoint
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

## SSL Security Settings
Enhanced security configuration includes:
- TLS 1.2 and 1.3 protocols only
- High-grade cipher suites
- Server cipher preference
- SSL session caching for performance

## Docker Configuration
The SSL certificates are mounted into the nginx container via:
```yaml
volumes:
  - ./nginx/ssl:/etc/nginx/ssl
```

## Access URLs
After deployment, the following SSL-secured endpoints will be available:
<<<<<<< HEAD
- **IPFS API**: https://ipfs.example.com/api/v0/
- **IPFS Gateway**: https://gateway.example.com/ipfs/
=======
- **IPFS API**: https://ipfs.example.com/api/v0/
- **IPFS Gateway**: https://gateway.example.com/ipfs/
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff

## Security Notes
- Private key has no passphrase (password file contains "없음")
- Certificates are properly formatted in PEM format
- Wildcard coverage allows for additional subdomains if needed
- Access is restricted via IP whitelist in nginx configuration

## Certificate Renewal
When the certificate expires (August 11, 2026):
1. Obtain new wildcard certificate from certificate provider
2. Replace files in `nginx/ssl/` directory
3. Restart nginx container: `docker-compose restart nginx`

## Verification Commands
```bash
# Check certificate validity
<<<<<<< HEAD
openssl x509 -in nginx/ssl/wildcard.example.com.pem -noout -dates

# Check certificate details
openssl x509 -in nginx/ssl/wildcard.example.com.pem -text -noout

# Test SSL configuration (after deployment)
openssl s_client -connect ipfs.example.com:443 -servername ipfs.example.com
=======
openssl x509 -in nginx/ssl/wildcard.example.com.pem -noout -dates

# Check certificate details
openssl x509 -in nginx/ssl/wildcard.example.com.pem -text -noout

# Test SSL configuration (after deployment)
openssl s_client -connect ipfs.example.com:443 -servername ipfs.example.com
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

## Deployment Status
✅ SSL certificates copied to correct location  
✅ Nginx configuration updated  
✅ Docker volume mounts configured  
✅ Security settings applied  
✅ Ready for deployment 