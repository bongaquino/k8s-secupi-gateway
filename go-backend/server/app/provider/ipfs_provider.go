package provider

import (
	"encoding/json"
	"fmt"
	"io"
	"bongaquino/server/config"
	"mime/multipart"
	"net/http"
	"path/filepath"
)

// IPFSProvider handles interactions with the IPFS API
type IPFSProvider struct {
	nodeURL     string
	downloadURL string
	client      *http.Client
}

// NewIPFSProvider initializes a new IPFSProvider
func NewIPFSProvider() *IPFSProvider {
	ipfsConfig := config.LoadIPFSConfig()

	return &IPFSProvider{
		nodeURL:     ipfsConfig.IPFSNodeURL,
		downloadURL: ipfsConfig.IPFSDownloadURL,
		client: &http.Client{
			Timeout: 0,
		},
	}
}

// GetSwarmAddrsDetailed calls the IPFS API to get swarm addresses and returns the number of peers and their details
func (p *IPFSProvider) GetSwarmAddrsDetailed() (int, map[string][]string, error) {
	url := fmt.Sprintf("%s/api/v0/swarm/addrs", p.nodeURL)

	// Make the HTTP request
	resp, err := p.client.Post(url, "application/json", nil)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to call IPFS API: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		return 0, nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Parse the response body
	var result struct {
		Addrs map[string][]string `json:"Addrs"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Count the number of peers
	numPeers := len(result.Addrs)
	return numPeers, result.Addrs, nil
}

// Pin uploads a file to IPFS and pins it
func (p *IPFSProvider) Pin(filename string, file io.Reader) (string, error) {
	// Build the URL for the IPFS API
	url := fmt.Sprintf("%s/api/v0/add?pin=true", p.nodeURL)

	// Use io.Pipe to stream the multipart form data
	pr, pw := io.Pipe()
	writer := multipart.NewWriter(pw)

	errChan := make(chan error, 1)

	// Write the multipart form in a goroutine
	go func() {
		defer pw.Close()
		defer writer.Close()
		part, err := writer.CreateFormFile("file", filepath.Base(filename))
		if err != nil {
			pw.CloseWithError(err)
			errChan <- fmt.Errorf("failed to create form file: %w", err)
			return
		}
		_, err = io.Copy(part, file)
		if err != nil {
			pw.CloseWithError(err)
			errChan <- fmt.Errorf("failed to copy file content: %w", err)
			return
		}
		errChan <- nil
	}()

	// Create the HTTP request
	req, err := http.NewRequest("POST", url, pr)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send the request
	resp, err := p.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call IPFS API: %w", err)
	}
	defer resp.Body.Close()

	if err := <-errChan; err != nil {
		return "", err
	}

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Parse the response body
	var apiResult struct {
		Hash string `json:"Hash"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiResult); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if apiResult.Hash == "" {
		return "", fmt.Errorf("empty hash in response")
	}

	return apiResult.Hash, nil
}

// GetFileURL returns the public URL to access a pinned file using its IPFS hash
func (p *IPFSProvider) GetFileURL(hash string) string {
	return fmt.Sprintf("%s/ipfs/%s", p.downloadURL, hash)
}

func (p *IPFSProvider) GetInternalNodeURL() string {
	return p.nodeURL
}

func (p *IPFSProvider) Client() *http.Client {
	return p.client
}

// ListFileChunks returns the list of chunk links for a given IPFS CID
func (p *IPFSProvider) ListFileChunks(cid string) ([]map[string]any, error) {
	url := fmt.Sprintf("%s/api/v0/ls?arg=%s", p.nodeURL, cid)

	// Make the HTTP request
	resp, err := p.client.Post(url, "application/json", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call IPFS /ls API: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Decode the response
	var result struct {
		Objects []struct {
			Hash  string `json:"Hash"`
			Links []struct {
				Name string `json:"Name"`
				Hash string `json:"Hash"`
				Size int64  `json:"Size"`
				Type int    `json:"Type"` // 1 = dir, 2 = file
			} `json:"Links"`
		} `json:"Objects"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(result.Objects) == 0 {
		return nil, fmt.Errorf("no object data returned for CID: %s", cid)
	}

	// Convert Links to generic map output (for flexibility)
	var chunks []map[string]any
	for _, link := range result.Objects[0].Links {
		chunks = append(chunks, map[string]any{
			"name": link.Name,
			"hash": link.Hash,
			"size": link.Size,
			"type": link.Type,
		})
	}

	return chunks, nil
}
