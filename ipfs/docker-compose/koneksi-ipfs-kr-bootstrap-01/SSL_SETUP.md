# SSL Certificate Setup for Bootstrap Node 02

## Overview
This document describes the SSL certificate configuration for the IPFS Bootstrap Node 02 (27.255.70.17).

## Certificate Details
- **Type**: Wildcard SSL Certificate
- **Domain**: `*.koneksi.co.kr`
- **Coverage**: All subdomains under koneksi.co.kr
- **Issuer**: GlobalSign GCC R6 AlphaSSL CA 2025
- **Valid From**: July 10, 2025
- **Valid Until**: August 11, 2026
- **Format**: PEM (nginx compatible)

## File Locations
```
koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02/nginx/ssl/
├── wildcard.koneksi.co.kr.pem (Certificate)
└── wildcard.koneksi.co.kr.key (Private Key)
```

## Nginx Configuration
The wildcard certificate is configured for both IPFS services:
- **ipfs.koneksi.co.kr** - IPFS API endpoint
- **gateway.koneksi.co.kr** - IPFS Gateway endpoint

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
- **IPFS API**: https://ipfs.koneksi.co.kr/api/v0/
- **IPFS Gateway**: https://gateway.koneksi.co.kr/ipfs/

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
openssl x509 -in nginx/ssl/wildcard.koneksi.co.kr.pem -noout -dates

# Check certificate details
openssl x509 -in nginx/ssl/wildcard.koneksi.co.kr.pem -text -noout

# Test SSL configuration (after deployment)
openssl s_client -connect ipfs.koneksi.co.kr:443 -servername ipfs.koneksi.co.kr
```

## Deployment Status
✅ SSL certificates copied to correct location  
✅ Nginx configuration updated  
✅ Docker volume mounts configured  
✅ Security settings applied  
✅ Ready for deployment 