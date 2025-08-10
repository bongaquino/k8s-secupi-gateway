# SSL Certificate Setup for Bootstrap Node 02

## Overview
This document describes the SSL certificate configuration for the IPFS Bootstrap Node 02 (27.255.70.17).

## Certificate Details
- **Type**: Wildcard SSL Certificate
<<<<<<< HEAD
- **Domain**: `*.bongaquino.co.kr`
- **Coverage**: All subdomains under bongaquino.co.kr
=======
- **Domain**: `*.koneksi.co.kr`
- **Coverage**: All subdomains under koneksi.co.kr
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
- **Issuer**: GlobalSign GCC R6 AlphaSSL CA 2025
- **Valid From**: July 10, 2025
- **Valid Until**: August 11, 2026
- **Format**: PEM (nginx compatible)

## File Locations
```
<<<<<<< HEAD
bongaquino-ipfs/docker-compose/bongaquino-ipfs-kr-bootstrap-02/nginx/ssl/
├── wildcard.bongaquino.co.kr.pem (Certificate)
└── wildcard.bongaquino.co.kr.key (Private Key)
=======
koneksi-ipfs/docker-compose/koneksi-ipfs-kr-bootstrap-02/nginx/ssl/
├── wildcard.koneksi.co.kr.pem (Certificate)
└── wildcard.koneksi.co.kr.key (Private Key)
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

## Nginx Configuration
The wildcard certificate is configured for both IPFS services:
<<<<<<< HEAD
- **ipfs.bongaquino.co.kr** - IPFS API endpoint
- **gateway.bongaquino.co.kr** - IPFS Gateway endpoint
=======
- **ipfs.koneksi.co.kr** - IPFS API endpoint
- **gateway.koneksi.co.kr** - IPFS Gateway endpoint
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
- **IPFS API**: https://ipfs.bongaquino.co.kr/api/v0/
- **IPFS Gateway**: https://gateway.bongaquino.co.kr/ipfs/
=======
- **IPFS API**: https://ipfs.koneksi.co.kr/api/v0/
- **IPFS Gateway**: https://gateway.koneksi.co.kr/ipfs/
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
openssl x509 -in nginx/ssl/wildcard.bongaquino.co.kr.pem -noout -dates

# Check certificate details
openssl x509 -in nginx/ssl/wildcard.bongaquino.co.kr.pem -text -noout

# Test SSL configuration (after deployment)
openssl s_client -connect ipfs.bongaquino.co.kr:443 -servername ipfs.bongaquino.co.kr
=======
openssl x509 -in nginx/ssl/wildcard.koneksi.co.kr.pem -noout -dates

# Check certificate details
openssl x509 -in nginx/ssl/wildcard.koneksi.co.kr.pem -text -noout

# Test SSL configuration (after deployment)
openssl s_client -connect ipfs.koneksi.co.kr:443 -servername ipfs.koneksi.co.kr
>>>>>>> ff1a2945f8bd7c03b52b06fcba179354b2b893ff
```

## Deployment Status
✅ SSL certificates copied to correct location  
✅ Nginx configuration updated  
✅ Docker volume mounts configured  
✅ Security settings applied  
✅ Ready for deployment 