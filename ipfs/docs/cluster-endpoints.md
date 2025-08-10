# IPFS Cluster API Endpoints

## Cluster API Endpoints

### Bootstrap Node (211.239.117.217)
```
Cluster API: http://211.239.117.217:9094
IPFS API: http://211.239.117.217:5001
IPFS Gateway: http://211.239.117.217:8080
```

### Peer-01 (218.38.136.33)
```
Cluster API: http://218.38.136.33:9094
IPFS API: http://218.38.136.33:5001
IPFS Gateway: http://218.38.136.33:8080
```

### Peer-02 (218.38.136.34)
```
Cluster API: http://218.38.136.34:9094
IPFS API: http://218.38.136.34:5001
IPFS Gateway: http://218.38.136.34:8080
```

## API Usage Examples

### 1. Adding and Pinning Content

#### Using Cluster API
```bash
# Add and pin a file
curl -X POST "http://211.239.117.217:9094/add" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/file.txt"

# Pin existing content
curl -X POST "http://211.239.117.217:9094/pins/<CID>" \
  -H "Content-Type: application/json" \
  -d '{"replication_factor": -1}'
```

#### Using IPFS API
```bash
# Add a file
curl -X POST "http://211.239.117.217:5001/api/v0/add" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/file.txt"

# Pin a file
curl -X POST "http://211.239.117.217:5001/api/v0/pin/add" \
  -H "Content-Type: application/json" \
  -d '{"arg": "<CID>"}'
```

### 2. Retrieving Content

#### Using IPFS Gateway
```bash
# Get content via HTTP
curl "http://211.239.117.217:8080/ipfs/<CID>"

# Get content via API
curl -X POST "http://211.239.117.217:5001/api/v0/cat" \
  -H "Content-Type: application/json" \
  -d '{"arg": "<CID>"}'
```

### 3. Cluster Management

#### List Pins
```bash
# List all pins
curl "http://211.239.117.217:9094/pins"

# Get specific pin
curl "http://211.239.117.217:9094/pins/<CID>"
```

#### Remove Pins
```bash
# Remove a pin
curl -X DELETE "http://211.239.117.217:9094/pins/<CID>"
```

### 4. Status and Health Checks

#### Cluster Status
```bash
# Get cluster status
curl "http://211.239.117.217:9094/status"

# Get peer status
curl "http://211.239.117.217:9094/peers"
```

#### IPFS Status
```bash
# Get IPFS node info
curl "http://211.239.117.217:5001/api/v0/id"

# Get IPFS swarm peers
curl "http://211.239.117.217:5001/api/v0/swarm/peers"
```

## Common CIDs Used in Testing

### Test Files
```
Bootstrap Node: QmUCTUkGaDzsJXkEDC6ZN81C4BUH9Tnn6YSEtjgiyPQfM4
Peer-01: QmX3oVdJRjDXR3UHb7JpZCXUBbzC6Jnofr2yArjHyy4vHr
Peer-02: Qmati74KFqK8NqvHWLKcMjRtysm3bFd7b4kXb3Agtj6C8s
```

## Notes
1. All endpoints are accessible only from within the internal network
2. Authentication may be required for sensitive operations
3. The cluster API (9094) is used for cluster-wide operations
4. The IPFS API (5001) is used for node-specific operations
5. The IPFS Gateway (8080) is used for HTTP access to content
6. All endpoints use HTTP/HTTPS protocols
7. Default timeouts are 30 seconds for most operations 