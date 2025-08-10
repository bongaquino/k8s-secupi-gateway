package files

import (
	"bongaquino/server/app/helper"
	"bongaquino/server/app/model"
	"bongaquino/server/app/service"
	"bongaquino/server/config"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ShareController struct {
	fsService    *service.FSService
	userService  *service.UserService
	emailService *service.EmailService
}

// NewShareController initializes a new ShareController
func NewShareController(
	fsService *service.FSService,
	userService *service.UserService,
	emailService *service.EmailService,
) *ShareController {
	return &ShareController{
		fsService:    fsService,
		userService:  userService,
		emailService: emailService,
	}
}

func (sc *ShareController) Handle(ctx *gin.Context) {
	// Load file configuration
	fileConfig := config.LoadFileConfig()

	// Extract user ID from the context
	userID, exists := ctx.Get("userID")
	if !exists {
		helper.FormatResponse(ctx, "error", http.StatusUnauthorized, "user ID not found in context", nil, nil)
		return
	}

	// Get the file ID from the URL parameters
	fileID := ctx.Param("fileID")

	// Check if user ID owns the file ID
	isOwned, _ := sc.fsService.CheckFileOwnership(ctx, fileID, userID.(string))
	if !isOwned {
		helper.FormatResponse(ctx, "error", http.StatusNotFound, "file not found", nil, nil)
		return
	}

	// Get the access type from the query parameters (default: "private")
	accessType := ctx.DefaultQuery("access", fileConfig.DefaultAccess)

	// Check if access type is valid by checking against the allowed options
	if !helper.Contains(fileConfig.AccessOptions, accessType) {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid access type", nil, nil)
		return
	}

	// Validate the access type and prepare the request body if needed
	var requestBody map[string]any
	var responseBody map[string]any
	switch accessType {
	case fileConfig.PublicAccess, fileConfig.PrivateAccess:
		// Delete all existing file access records for the file ID (if any)
		if err := sc.fsService.DeleteFileAccessByFileID(ctx, fileID); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "error deleting existing file access records", nil, nil)
			return
		}
	case fileConfig.PasswordAccess:
		// Delete all existing file access records for the file ID (if any)
		if err := sc.fsService.DeleteFileAccessByFileID(ctx, fileID); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "error deleting existing file access records", nil, nil)
			return
		}

		// Verify if password is provided in the request body
		requestBody = make(map[string]any)
		if err := ctx.ShouldBindJSON(&requestBody); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "password is required for password-protected access", nil, nil)
			return
		}
		if _, ok := requestBody["password"]; !ok || requestBody["password"] == "" {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "password is required for password-protected access", nil, nil)
			return
		}
		// Extract the password from the request body
		password, ok := requestBody["password"].(string)
		if !ok || password == "" {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "password must be a non-empty string", nil, nil)
			return
		}
		// Validate the password
		_, err := helper.ValidatePassword(password)
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid password format", nil, nil)
			return
		}
		// Hash the password
		hashedPassword, err := helper.Hash(password)
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to hash password", nil, nil)
			return
		}
		// Create the file access record
		fileObjID, err := primitive.ObjectIDFromHex(fileID)
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid file ID format", nil, nil)
			return
		}
		ownerObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid user ID format", nil, nil)
			return
		}
		fileAccess := &model.FileAccess{
			FileID:      fileObjID,
			OwnerID:     ownerObjID,
			RecipientID: nil,
			Password:    &hashedPassword,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := sc.fsService.CreateFileAccess(ctx, fileAccess); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to create file access", nil, nil)
			return
		}
	case fileConfig.EmailAccess:
		requestBody = make(map[string]any)
		if err := ctx.ShouldBindJSON(&requestBody); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "at least one email is required for email access", nil, nil)
			return
		}
		emails, ok := requestBody["emails"].([]any)
		if !ok || len(emails) == 0 {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "at least one email is required for email access", nil, nil)
			return
		}
		// Check if all emails exist in the user service using UserExists method
		for _, email := range emails {
			exists, err := sc.userService.UserExists(ctx, email.(string))
			if err != nil {
				helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to verify emails", nil, nil)
				return
			}
			if !exists {
				helper.FormatResponse(ctx, "error", http.StatusBadRequest, "one or more provided emails are invalid", nil, nil)
				return
			}
		}
		// Delete all existing file access records for the file ID (if any)
		if err := sc.fsService.DeleteFileAccessByFileID(ctx, fileID); err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "error deleting existing file access records", nil, nil)
			return
		}
		// Create file access records for each email
		fileObjID, err := primitive.ObjectIDFromHex(fileID)
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid file ID format", nil, nil)
			return
		}
		ownerObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid user ID format", nil, nil)
			return
		}
		for _, email := range emails {
			// Get the user ID for the email
			user, _, err := sc.userService.GetUserProfileByEmail(ctx, email.(string))
			if err != nil {
				helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to get user by email", nil, nil)
				return
			}
			// Skip if the user ID is the same as the owner ID
			if user.ID.Hex() == ownerObjID.Hex() {
				continue
			}
			// Create the file access record
			fileAccess := &model.FileAccess{
				FileID:      fileObjID,
				OwnerID:     ownerObjID,
				RecipientID: &user.ID,
				Password:    nil, // No password for email access
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			if err := sc.fsService.CreateFileAccess(ctx, fileAccess); err != nil {
				helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to create file access", nil, nil)
				return
			}
			// Send email notification to the recipient, skipping if the email is the same as the owner email
			if user.ID.Hex() == ownerObjID.Hex() {
				continue
			}
			go func() {
				_ = sc.emailService.SendFileShareNotification(email.(string), fileID)
			}()

		}
	}

	// Check if the file ID is in valid format
	if fileID == "" {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "file ID is required", nil, nil)
		return
	}
	if _, err := primitive.ObjectIDFromHex(fileID); err != nil {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid file ID format", nil, nil)
		return
	}

	// Update file access
	err := sc.fsService.UpdateFileAccess(ctx, fileID, userID.(string), accessType)
	if err != nil {
		if err.Error() == "file not found" {
			helper.FormatResponse(ctx, "error", http.StatusNotFound, "file not found", nil, nil)
			return
		}
		helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "error updating file access", nil, nil)
		return
	}

	// Return success response
	helper.FormatResponse(ctx, "success", http.StatusOK, "file shared successfully", responseBody, nil)
}
