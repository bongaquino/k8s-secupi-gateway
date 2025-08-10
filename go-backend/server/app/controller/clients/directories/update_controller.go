package directories

import (
	"koneksi/server/app/dto"
	"koneksi/server/app/helper"
	"koneksi/server/app/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UpdateController struct {
	fsService   *service.FSService
	ipfsService *service.IPFSService
}

// NewUpdateController initializes a new UpdateController
func NewUpdateController(fsService *service.FSService, ipfsService *service.IPFSService) *UpdateController {
	return &UpdateController{
		fsService:   fsService,
		ipfsService: ipfsService,
	}
}

func (uc *UpdateController) Handle(ctx *gin.Context) {
	// Validate the request payload
	var request dto.UpdateDirectoryDTO
	if err := uc.validatePayload(ctx, &request); err != nil {
		return
	}

	// Limit directory name length to 255 characters
	isTrimmed := false
	if request.Name != "" && len(request.Name) > 255 {
		request.Name = request.Name[:255]
		isTrimmed = true
	}

	// Extract user ID from the context
	userID, exists := ctx.Get("userID")
	if !exists {
		helper.FormatResponse(ctx, "error", http.StatusUnauthorized, "user ID not found in context", nil, nil)
		return
	}

	// Get the directory ID from the URL parameters
	directoryID := ctx.Param("directoryID")

	// Check if the directory ID is in valid format
	if directoryID == "" {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "directory ID is required", nil, nil)
		return
	}
	if _, err := primitive.ObjectIDFromHex(directoryID); err != nil {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid directory ID format", nil, nil)
		return
	}

	// Check if the request contains a valid DirectoryID
	if request.DirectoryID != nil && *request.DirectoryID != "" {
		if directoryID == *request.DirectoryID {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "parent directory cannot be same as current directory", nil, nil)
			return
		}
	}

	// Fetch the directory before update to get its parent
	dir, _, _, err := uc.fsService.ReadDirectory(ctx, directoryID, userID.(string))
	if err != nil || dir == nil {
		helper.FormatResponse(ctx, "error", http.StatusNotFound, "directory not found", nil, nil)
		return
	}
	oldParentID := ""
	if dir.DirectoryID != nil {
		oldParentID = dir.DirectoryID.Hex()
	}

	// Update the directory using the fsService
	err = uc.fsService.UpdateDirectory(ctx, directoryID, userID.(string), &request)
	if err != nil {
		if err.Error() == "directory not found" {
			helper.FormatResponse(ctx, "error", http.StatusNotFound, "directory not found", nil, nil)
			return
		}
		if err.Error() == "cannot update root directory" {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "cannot update root directory", nil, nil)
			return
		}
		if err.Error() == "parent directory not found" {
			helper.FormatResponse(ctx, "error", http.StatusNotFound, "parent directory not found", nil, nil)
			return
		}
		if err.Error() == "no fields to update" {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "no fields to update", nil, nil)
			return
		}
		helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to update directory", nil, nil)
		return
	}

	// Fetch the directory again after update to get its new parent
	updatedDir, _, _, err := uc.fsService.ReadDirectory(ctx, directoryID, userID.(string))
	if err != nil || updatedDir == nil {
		helper.FormatResponse(ctx, "error", http.StatusNotFound, "directory not found after update", nil, nil)
		return
	}
	newParentID := ""
	if updatedDir.DirectoryID != nil {
		newParentID = updatedDir.DirectoryID.Hex()
	}

	// Recalculate old parent if changed
	if oldParentID != "" && oldParentID != newParentID {
		err := uc.fsService.RecalculateDirectorySizeAndParents(ctx, oldParentID, userID.(string))
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to recalculate old parent directory sizes", nil, nil)
			return
		}
	}

	// Always recalculate new parent
	if newParentID != "" {
		err = uc.fsService.RecalculateDirectorySizeAndParents(ctx, newParentID, userID.(string))
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to recalculate new parent directory sizes", nil, nil)
			return
		}
	}

	if isTrimmed {
		meta := map[string]any{
			"is_trimmed": true,
		}
		helper.FormatResponse(ctx, "success", http.StatusOK, "directory updated successfully", nil, meta)
		return
	}

	// Return success response
	helper.FormatResponse(ctx, "success", http.StatusOK, "directory updated successfully", nil, nil)
}

func (uc *UpdateController) validatePayload(ctx *gin.Context, request *dto.UpdateDirectoryDTO) error {
	if err := ctx.ShouldBindJSON(request); err != nil {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid request body", nil, nil)
		return err
	}
	return nil
}
