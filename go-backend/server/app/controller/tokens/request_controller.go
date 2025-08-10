package tokens

import (
	"net/http"

	"bongaquino/server/app/helper"
	"bongaquino/server/app/service"

	"github.com/gin-gonic/gin"
)

// RequestController handles user authentication and token generation
type RequestController struct {
	tokenService *service.TokenService
	userService  *service.UserService
	mfaService   *service.MFAService
}

// NewRequestController initializes a new RequestController
func NewRequestController(tokenService *service.TokenService, userService *service.UserService, mfaService *service.MFAService) *RequestController {
	return &RequestController{
		tokenService: tokenService,
		userService:  userService,
		mfaService:   mfaService,
	}
}

// Handle processes the login request and returns an access & refresh token
func (rc *RequestController) Handle(ctx *gin.Context) {
	var request struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	// Validate the payload
	if err := rc.validatePayload(ctx, &request); err != nil {
		return
	}

	// Authenticate user and generate tokens
	accessToken, refreshToken, err := rc.tokenService.AuthenticateUser(ctx.Request.Context(), request.Email, request.Password)
	if err != nil {
		helper.FormatResponse(ctx, "error", http.StatusUnauthorized, err.Error(), nil, nil)
		return
	}

	// Get user details
	user, settings, err := rc.userService.GetUserSettingsByEmail(ctx, request.Email)
	if err != nil {
		helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to retrieve user settings", nil, nil)
		return
	}

	// Check if MFA is enabled
	if settings.IsMFAEnabled {
		// Generate login code
		loginCode, err := rc.mfaService.GenerateLoginCode(ctx.Request.Context(), user.ID.Hex())
		if err != nil {
			helper.FormatResponse(ctx, "error", http.StatusInternalServerError, "failed to generate login code", nil, nil)
		}

		// Respond with boolean flag indicating MFA is enabled
		helper.FormatResponse(ctx, "success", http.StatusOK, "login code requested successfully", gin.H{
			"is_mfa_enabled": true,
			"login_code":     loginCode,
		}, nil)
	} else {
		// Respond with tokens
		helper.FormatResponse(ctx, "success", http.StatusOK, "token requested successfully", gin.H{
			"is_mfa_enabled": false,
			"access_token":   accessToken,
			"refresh_token":  refreshToken,
		}, nil)
	}

}

// validatePayload validates the incoming request payload
func (rc *RequestController) validatePayload(ctx *gin.Context, request any) error {
	if err := ctx.ShouldBindJSON(request); err != nil {
		helper.FormatResponse(ctx, "error", http.StatusBadRequest, "invalid request body", nil, nil)
		return err
	}
	return nil
}
