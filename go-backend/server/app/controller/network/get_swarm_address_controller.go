package network

import (
	"net/http"

	"bongaquino/server/app/helper"
	"bongaquino/server/app/service"

	"github.com/gin-gonic/gin"
)

// GetSwarmAddressController handles fetching swarm addresses from the IPFS network
type GetSwarmAddressController struct {
	ipfsService *service.IPFSService
}

// NewGetSwarmAddressController initializes a new GetSwarmAddressController
func NewGetSwarmAddressController(ipfsService *service.IPFSService) *GetSwarmAddressController {
	return &GetSwarmAddressController{
		ipfsService: ipfsService,
	}
}

// Handle processes the request to fetch swarm addresses
func (gsc *GetSwarmAddressController) Handle(ctx *gin.Context) {
	// Fetch the number of peers and their details from the IPFS service
	numPeers, peers, err := gsc.ipfsService.GetSwarmPeers()
	if err != nil {
		helper.FormatResponse(ctx, "error", http.StatusInternalServerError, err.Error(), nil, nil)
		return
	}

	// Respond with the number of peers and their details
	helper.FormatResponse(ctx, "success", http.StatusOK, "swarm addresses fetched successfully", gin.H{
		"num_peers": numPeers,
		"peers":     peers,
	}, nil)
}
