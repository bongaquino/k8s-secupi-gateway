package service

import (
	"context"
	"errors"
	"fmt"
	"bongaquino/server/app/dto"
	"bongaquino/server/app/helper"
	"bongaquino/server/app/model"
	"bongaquino/server/app/provider"
	"bongaquino/server/app/repository"
	"bongaquino/server/config"
	"bongaquino/server/core/logger"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserService struct {
	userRepo      *repository.UserRepository
	profileRepo   *repository.ProfileRepository
	settingRepo   *repository.SettingRepository
	roleRepo      *repository.RoleRepository
	userRoleRepo  *repository.UserRoleRepository
	limitRepo     *repository.LimitRepository
	directoryRepo *repository.DirectoryRepository
	fileRepo      *repository.FileRepository
	svcAccRepo    *repository.ServiceAccountRepository
	redisProvider *provider.RedisProvider
}

func NewUserService(
	userRepo *repository.UserRepository,
	profileRepo *repository.ProfileRepository,
	settingRepo *repository.SettingRepository,
	roleRepo *repository.RoleRepository,
	userRoleRepo *repository.UserRoleRepository,
	limitRepo *repository.LimitRepository,
	directoryRepo *repository.DirectoryRepository,
	fileRepo *repository.FileRepository,
	svcAccRepo *repository.ServiceAccountRepository,
	redisProvider *provider.RedisProvider,
) *UserService {
	return &UserService{
		userRepo:      userRepo,
		profileRepo:   profileRepo,
		settingRepo:   settingRepo,
		roleRepo:      roleRepo,
		userRoleRepo:  userRoleRepo,
		limitRepo:     limitRepo,
		directoryRepo: directoryRepo,
		fileRepo:      fileRepo,
		svcAccRepo:    svcAccRepo,
		redisProvider: redisProvider,
	}
}

func (us *UserService) ListUsers(ctx context.Context, page, limit int) ([]*model.User, error) {
	// Fetch users from the repository
	users, err := us.userRepo.List(ctx, page, limit)
	if err != nil {
		logger.Log.Error("error fetching users", logger.Error(err))
		return nil, errors.New("internal server error")
	}
	// Convert []model.User to []*model.User
	userPointers := make([]*model.User, len(users))
	for i := range users {
		userPointers[i] = &users[i]
	}
	return userPointers, nil
}

func (us *UserService) ListRoles(ctx context.Context) ([]*model.Role, error) {
	// Fetch roles from the repository
	roles, err := us.roleRepo.List(ctx)
	if err != nil {
		logger.Log.Error("error fetching roles", logger.Error(err))
		return nil, errors.New("internal server error")
	}
	// Convert []model.Role to []*model.Role
	rolePointers := make([]*model.Role, len(roles))
	copy(rolePointers, roles)
	return rolePointers, nil
}

// SearchUsers searches for users by email
func (us *UserService) SearchUsers(ctx context.Context, email string) ([]*model.User, error) {
	// Fetch users from the repository
	users, err := us.userRepo.SearchByEmail(ctx, email)
	if err != nil {
		logger.Log.Error("error searching users", logger.Error(err))
		return nil, errors.New("internal server error")
	}

	// Convert []model.User to []*model.User
	userPointers := make([]*model.User, len(users))
	for i := range users {
		userPointers[i] = &users[i]
	}
	return userPointers, nil
}

// UserExists checks if a user with the given email already exists
func (us *UserService) UserExists(ctx context.Context, email string) (bool, error) {
	// Query the repository to check if the user exists
	user, err := us.userRepo.ReadByEmail(ctx, email)
	if err != nil {
		logger.Log.Error("error checking if user exists", logger.Error(err))
		return false, errors.New("internal server error")
	}

	// Return true if the user exists, false otherwise
	return user != nil, nil
}

// Create registers a new user
func (us *UserService) CreateUser(ctx context.Context, request *dto.CreateUserDTO) (*model.User, *model.Profile, *model.UserRole, string, error) {
	// Load user configuration
	userConfig := config.LoadUserConfig()

	// Check user role
	userRole, err := us.roleRepo.ReadByName(ctx, request.Role)
	if err != nil {
		logger.Log.Error("failed to assign role", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to assign role")
	}
	if userRole == nil {
		return nil, nil, nil, "", errors.New("role not found")
	}

	// Create user
	user := &model.User{
		Email:      request.Email,
		Password:   request.Password,
		IsVerified: request.IsVerified,
	}
	if err := us.userRepo.Create(ctx, user); err != nil {
		logger.Log.Error("failed to create user", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to create user")
	}

	// Create profile
	profile := &model.Profile{
		UserID:     user.ID,
		FirstName:  request.FirstName,
		MiddleName: request.MiddleName,
		LastName:   request.LastName,
		Suffix:     request.Suffix,
	}
	if err := us.profileRepo.Create(ctx, profile); err != nil {
		logger.Log.Error("failed to create profile", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to create profile")
	}

	// Create settings
	setting := &model.Setting{
		UserID:                     user.ID,
		BackupCycle:                userConfig.DefaultBackupCycle,
		BackupCustomDay:            userConfig.DefaultBackupCustomDay,
		NotificationsFrequency:     userConfig.DefaultNotificationsFrequency,
		RecoveryPriorityOrder:      userConfig.DefaultRecoveryPriorityOrder,
		RecoveryCustomOrder:        userConfig.DefaultRecoveryCustomOrder,
		IsMFAEnabled:               userConfig.DefaultIsMFAEnabled,
		IsRealtimeBackupEnabled:    userConfig.DefaultIsRealtimeBackupEnabled,
		IsEmailNotificationEnabled: userConfig.DefaultIsEmailNotificationEnabled,
		IsSMSNotificationEnabled:   userConfig.DefaultIsSMSNotificationEnabled,
		IsVersionHistoryEnabled:    userConfig.DefaultIsVersionHistoryEnabled,
	}
	if err := us.settingRepo.Create(ctx, setting); err != nil {
		logger.Log.Error("failed to create settings", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to create settings")
	}

	// Create user role assignment
	userRoleAssignment := &model.UserRole{
		UserID: user.ID,
		RoleID: userRole.ID,
	}
	if err := us.userRoleRepo.Create(ctx, userRoleAssignment); err != nil {
		logger.Log.Error("failed to assign role", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to assign role")
	}

	// Create user limit
	limit := &model.Limit{
		UserID:         user.ID,
		OrganizationID: nil,
		BytesLimit:     userConfig.DefaultBytesLimit,
		BytesUsage:     0,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	if err := us.limitRepo.Create(ctx, limit); err != nil {
		logger.Log.Error("failed to create limit", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to create limit")
	}

	// Create user root directory
	directory := &model.Directory{
		UserID:      user.ID,
		DirectoryID: nil,
		Name:        "root",
		Size:        0,
		IsDeleted:   false,
	}
	if err := us.directoryRepo.Create(ctx, directory); err != nil {
		logger.Log.Error("failed to create root directory", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to create root directory")
	}

	return user, profile, userRoleAssignment, userRole.Name, nil
}

// ChangePassword changes the user's password
func (us *UserService) ChangePassword(ctx context.Context, userID string, request *dto.ChangePasswordDTO) error {
	// Fetch the user from the repository
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return errors.New("failed to retrieve user")
	}
	if user == nil {
		logger.Log.Error("user not found", logger.Error(err))
		return errors.New("user not found")
	}

	// Verify if the old password is the same as the new password
	if request.OldPassword == request.NewPassword {
		return errors.New("new password must be different from the old password")
	}

	// Verify the old password
	if !helper.CheckHash(request.OldPassword, user.Password) {
		return errors.New("old password is incorrect")
	}

	// Hash the new password
	hashedPassword, err := helper.Hash(request.NewPassword)
	if err != nil {
		logger.Log.Error("failed to hash new password", logger.Error(err))
		return errors.New("failed to hash new password")
	}

	// Update the user's password in the repository
	update := map[string]any{
		"password":  hashedPassword,
		"updatedAt": time.Now(),
	}
	if err := us.userRepo.Update(ctx, user.ID.Hex(), update); err != nil {
		logger.Log.Error("failed to update password", logger.Error(err))
		return errors.New("failed to update password")
	}

	return nil
}

func (us *UserService) GeneratePasswordResetCode(ctx context.Context, email string) (string, error) {
	// Load the Redis configuration
	redisConfig := config.LoadRedisConfig()

	// Check if the user exists
	user, err := us.userRepo.ReadByEmail(ctx, email)
	if err != nil || user == nil {
		return "", fmt.Errorf("user not found")
	}

	// Construct the Redis key
	key := fmt.Sprintf("password_reset:%s", email)

	// Check if a reset code already exists in Redis
	existingCode, err := us.redisProvider.Get(ctx, key)
	if err == nil && existingCode != "" {
		return "", fmt.Errorf("password reset already pending")
	}

	// Generate a random reset code using the helper
	resetCode, err := helper.GenerateCode(6) // 6 bytes (~12 hex characters)
	if err != nil {
		return "", fmt.Errorf("failed to generate reset code")
	}

	// Store the reset code in Redis with a 15-minute expiration
	err = us.redisProvider.Set(ctx, key, resetCode, redisConfig.PasswordResetCodeExpiry)
	if err != nil {
		return "", fmt.Errorf("failed to store reset code")
	}

	return resetCode, nil
}

func (us *UserService) ResetPassword(ctx context.Context, email, resetCode, newPassword string) error {
	// Retrieve the user by email from the database
	user, err := us.userRepo.ReadByEmail(ctx, email)
	if err != nil {
		return fmt.Errorf("failed to retrieve user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// Construct the Redis key
	key := fmt.Sprintf("password_reset:%s", email)

	// Retrieve the stored reset code from Redis
	storedCode, err := us.redisProvider.Get(ctx, key)
	if err != nil {
		return fmt.Errorf("failed to retrieve reset code")
	}

	// Compare the stored code with the provided code
	if storedCode != resetCode {
		return fmt.Errorf("invalid reset code")
	}

	// Check if new password is not the same as the old one
	if helper.CheckHash(newPassword, user.Password) {
		return fmt.Errorf("new password must be different from the old one")
	}

	// Delete the reset code from Redis to prevent reuse
	err = us.redisProvider.Del(ctx, key)
	if err != nil {
		return fmt.Errorf("failed to delete reset code")
	}

	// Reset the user's is_locked status if applicable
	update := map[string]any{
		"is_locked": false,
	}
	if err := us.userRepo.UpdateByEmail(ctx, email, update); err != nil {
		return fmt.Errorf("failed to update user lock status")
	}

	// Hash the new password
	hashedPassword, err := helper.Hash(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password")
	}

	// Update the user's password in the database
	err = us.userRepo.UpdateByEmail(ctx, email, map[string]any{
		"password": hashedPassword,
	})
	if err != nil {
		return fmt.Errorf("failed to update password")
	}

	return nil
}
func (us *UserService) GetUserInfo(ctx context.Context, userID string) (
	*model.User, *model.Profile, *model.Setting, *model.Role, *model.Limit, error) {
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return nil, nil, nil, nil, nil, errors.New("failed to retrieve user")
	}
	if user == nil {
		return nil, nil, nil, nil, nil, errors.New("user not found")
	}

	profile, err := us.profileRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve profile", logger.Error(err))
		return nil, nil, nil, nil, nil, errors.New("failed to retrieve profile")
	}
	if profile == nil {
		return nil, nil, nil, nil, nil, errors.New("profile not found")
	}

	setting, err := us.settingRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve settings", logger.Error(err))
		return nil, nil, nil, nil, nil, errors.New("failed to retrieve settings")
	}
	if setting == nil {
		return nil, nil, nil, nil, nil, errors.New("settings not found")
	}

	userRole, err := us.userRoleRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user role", logger.Error(err))
		return nil, nil, nil, nil, nil, errors.New("failed to retrieve user role")
	}
	if userRole == nil {
		return nil, nil, nil, nil, nil, errors.New("user role not found")
	}

	var role *model.Role
	if len(userRole) > 0 {
		role, err = us.roleRepo.Read(ctx, userRole[0].RoleID.Hex())
		if err != nil {
			logger.Log.Error("failed to retrieve role", logger.Error(err))
			return nil, nil, nil, nil, nil, errors.New("failed to retrieve role")
		}
	}

	limit, err := us.limitRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve limit", logger.Error(err))
		return nil, nil, nil, nil, nil, errors.New("failed to retrieve limit")
	}
	if limit == nil {
		return nil, nil, nil, nil, nil, errors.New("limit not found")
	}

	return user, profile, setting, role, limit, nil
}

func (us *UserService) GetUserProfileByEmail(ctx context.Context, email string) (*model.User, *model.Profile, error) {
	user, err := us.userRepo.ReadByEmail(ctx, email)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return nil, nil, errors.New("failed to retrieve user")
	}
	if user == nil {
		return nil, nil, errors.New("user not found")
	}

	profile, err := us.profileRepo.ReadByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to retrieve profile", logger.Error(err))
		return nil, nil, errors.New("failed to retrieve profile")
	}
	if profile == nil {
		return nil, nil, errors.New("profile not found")
	}

	return user, profile, nil
}

func (us *UserService) GetUserSettingsByEmail(ctx context.Context, email string) (*model.User, *model.Setting, error) {
	user, err := us.userRepo.ReadByEmail(ctx, email)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return nil, nil, errors.New("failed to retrieve user")
	}
	if user == nil {
		return nil, nil, errors.New("user not found")
	}

	settings, err := us.settingRepo.ReadByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to retrieve settings", logger.Error(err))
		return nil, nil, errors.New("failed to retrieve settings")
	}
	if settings == nil {
		return nil, nil, errors.New("settings not found")
	}

	return user, settings, nil
}

func (us *UserService) UpdateUserSettings(ctx context.Context, userID string, request *dto.UpdateSettingsDTO) error {
	// Prepare the update fields
	update := bson.M{
		"backup_cycle":                  request.BackupCycle,
		"backup_custom_day":             request.BackupCustomDay,
		"notifications_frequency":       request.NotificationsFrequency,
		"recovery_priority_order":       request.RecoveryPriorityOrder,
		"recovery_custom_order":         request.RecoveryCustomOrder,
		"is_realtime_backup_enabled":    request.IsRealtimeBackupEnabled,
		"is_email_notification_enabled": request.IsEmailNotificationEnabled,
		"is_sms_notification_enabled":   request.IsSMSNotificationEnabled,
		"is_version_history_enabled":    request.IsVersionHistoryEnabled,
	}

	if err := us.settingRepo.UpdateByUserID(ctx, userID, update); err != nil {
		logger.Log.Error("failed to update user settings", logger.Error(err))
		return errors.New("failed to update user settings")
	}

	return nil
}

func (us *UserService) ValidatePassword(ctx context.Context, userID string, password string) (bool, error) {
	// Retrieve the user from the database
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("failed to retrieve user: %w", err)
	}
	if user == nil {
		return false, fmt.Errorf("user not found")
	}

	// Compare the provided password with the stored hash
	isValid := helper.CheckHash(password, user.Password)
	return isValid, nil
}

func (us *UserService) VerifyUserAccount(ctx context.Context, userID string, code string) error {
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to retrieve user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	if user.IsVerified {
		return fmt.Errorf("account already verified")
	}

	// Construct the Redis key
	key := fmt.Sprintf("verification:%s", userID)

	// Retrieve the stored verification code from Redis
	storedCode, err := us.redisProvider.Get(ctx, key)
	if err != nil {
		return fmt.Errorf("failed to retrieve verification code")
	}

	// Compare the stored code with the provided code
	if storedCode != code {
		return fmt.Errorf("invalid verification code")
	}

	// Delete the reset code from Redis to prevent reuse
	err = us.redisProvider.Del(ctx, key)
	if err != nil {
		return fmt.Errorf("failed to delete verification code")
	}

	update := map[string]any{
		"is_verified": true,
		"updated_at":  time.Now(),
	}

	if err := us.userRepo.Update(ctx, userID, update); err != nil {
		logger.Log.Error("failed to verify account", logger.Error(err))
		return errors.New("failed to verify account")
	}

	return nil
}

func (us *UserService) GenerateVerificationCode(ctx context.Context, userID string) (string, error) {
	// Load the Redis configuration
	redisConfig := config.LoadRedisConfig()

	// Check if the user exists and is not already verified
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve user: %w", err)
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}

	if user.IsVerified {
		return "", fmt.Errorf("account already verified")
	}

	// Construct the Redis key
	key := fmt.Sprintf("verification:%s", userID)

	// Retrieve the stored verification code from Redis
	storedCode, err := us.redisProvider.Get(ctx, key)

	// If there is no stored token or an error occurred, generate a new one and store it in Redis
	if storedCode == "" || err != nil {
		newCode, err := helper.GenerateNumericCode(6)
		if err != nil {
			return "", fmt.Errorf("failed to generate verification code: %w", err)
		}

		err = us.redisProvider.Set(ctx, fmt.Sprintf("verification:%s", userID), newCode, redisConfig.VerificationCodeExpiry)
		if err != nil {
			return "", fmt.Errorf("failed to store verification code in Redis: %w", err)
		}

		return newCode, nil
	}

	return storedCode, nil
}

// Update updates an existing user
func (us *UserService) Update(ctx context.Context, userID string, request *dto.UpdateUserDTO) error {
	// Prepare the update fields
	update := bson.M{
		"first_name":  request.FirstName,
		"middle_name": request.MiddleName,
		"last_name":   request.LastName,
		"suffix":      request.Suffix,
		"email":       request.Email,
		"role":        request.Role,
		"is_verified": request.IsVerified,
		"is_locked":   request.IsLocked,
		"is_deleted":  request.IsDeleted,
		"updated_at":  time.Now(),
	}

	// Hash the password if it is being updated
	if request.Password != "" {
		hashedPassword, err := helper.Hash(request.Password)
		if err != nil {
			logger.Log.Error("failed to hash password", logger.Error(err))
			return errors.New("failed to hash password")
		}
		update["password"] = hashedPassword
	}

	// Call the repository to update the user
	if err := us.userRepo.Update(ctx, userID, update); err != nil {
		logger.Log.Error("failed to update user", logger.Error(err))
		return errors.New("failed to update user")
	}

	return nil
}

// UpdateUser updates an existing user, their profile, and their role based on the provided UpdateUser
func (us *UserService) UpdateUser(ctx context.Context, userID string, dto *dto.UpdateUserDTO) (*model.User, *model.Profile, *model.UserRole, string, error) {
	// Check if the user exists
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to retrieve user")
	}
	if user == nil {
		logger.Log.Error("user not found", logger.Error(err))
		return nil, nil, nil, "", errors.New("user not found")
	}

	// Update user role
	var userRole *model.Role
	if dto.Role != "" {
		userRole, err = us.roleRepo.ReadByName(ctx, dto.Role)
		if err != nil {
			logger.Log.Error("failed to retrieve role", logger.Error(err))
			return nil, nil, nil, "", errors.New("failed to retrieve role")
		}
		if userRole == nil {
			logger.Log.Error("role not found", logger.Error(err))
			return nil, nil, nil, "", errors.New("role not found")
		}

		// Set the user role ID in the update map
		userRoleUpdateMap := bson.M{
			"role_id": userRole.ID,
		}

		// Update the user role in the repository
		if err := us.userRoleRepo.Update(ctx, userID, userRoleUpdateMap); err != nil {
			logger.Log.Error("error updating user role", logger.Error(err))
			return nil, nil, nil, "", errors.New("failed to update user role")
		}
	}

	// Update user fields
	userUpdate := bson.M{
		"email":       dto.Email,
		"is_verified": dto.IsVerified,
		"is_locked":   dto.IsLocked,
		"is_deleted":  dto.IsDeleted,
	}

	// Hash the password if it is being updated
	if dto.Password != "" {
		hashedPassword, err := helper.Hash(dto.Password)
		if err != nil {
			logger.Log.Error("failed to hash password", logger.Error(err))
			return nil, nil, nil, "", errors.New("failed to hash password")
		}
		userUpdate["password"] = hashedPassword
	}

	if err := us.userRepo.Update(ctx, userID, userUpdate); err != nil {
		logger.Log.Error("failed to update user", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to update user")
	}

	// Update profile fields
	profileUpdate := bson.M{
		"first_name":  dto.FirstName,
		"middle_name": dto.MiddleName,
		"last_name":   dto.LastName,
		"suffix":      dto.Suffix,
	}

	if err := us.profileRepo.UpdateByUserID(ctx, userID, profileUpdate); err != nil {
		logger.Log.Error("failed to update profile", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to update profile")
	}

	// Fetch updated profile
	profile, err := us.profileRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to fetch updated profile", logger.Error(err))
		return nil, nil, nil, "", errors.New("failed to fetch updated profile")
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		logger.Log.Error("invalid user ID format", logger.Error(err))
		return nil, nil, nil, "", errors.New("invalid user ID format")
	}
	return user, profile, &model.UserRole{UserID: userObjectID, RoleID: userRole.ID}, userRole.Name, nil
}

func (us *UserService) GetUserLimits(ctx context.Context, userID string) (*model.Limit, error) {
	// Fetch the user limit from the repository
	limit, err := us.limitRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user limit", logger.Error(err))
		return nil, errors.New("failed to retrieve user limit")
	}
	if limit == nil {
		return nil, errors.New("user limit not found")
	}

	return limit, nil
}

func (us *UserService) UpdateUserUsage(ctx context.Context, userID string, bytesUsed int64) error {
	// Fetch the user limit from the repository
	limit, err := us.limitRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user limit", logger.Error(err))
		return errors.New("failed to retrieve user limit")
	}
	if limit == nil {
		return errors.New("user limit not found")
	}

	// Update the user's usage
	update := bson.M{
		"bytes_usage": bytesUsed,
	}
	if err := us.limitRepo.UpdateByUserID(ctx, userID, update); err != nil {
		logger.Log.Error("failed to update user limit", logger.Error(err))
		return errors.New("failed to update user limit")
	}

	return nil
}

func (us *UserService) UpdateUserLimit(ctx context.Context, userID string, bytesLimit int64) error {
	// Fetch the user limit from the repository
	limit, err := us.limitRepo.ReadByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user limit", logger.Error(err))
		return errors.New("failed to retrieve user limit")
	}
	if limit == nil {
		return errors.New("user limit not found")
	}

	// Update the user's limit
	update := bson.M{
		"bytes_limit": bytesLimit,
	}
	if err := us.limitRepo.UpdateByUserID(ctx, userID, update); err != nil {
		logger.Log.Error("failed to update user limit", logger.Error(err))
		return errors.New("failed to update user limit")
	}

	return nil
}

func (us *UserService) CollectMetrics(ctx context.Context, userID string) (*model.Limit, int64, int64, int64, error) {
	// Fetch the user from the repository
	user, err := us.userRepo.Read(ctx, userID)
	if err != nil {
		logger.Log.Error("failed to retrieve user", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to retrieve user")
	}
	if user == nil {
		return nil, 0, 0, 0, errors.New("user not found")
	}

	// Fetch the user's profile
	profile, err := us.profileRepo.ReadByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to retrieve profile", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to retrieve profile")
	}
	if profile == nil {
		return nil, 0, 0, 0, errors.New("profile not found")
	}

	// Fetch the user's limit
	limit, err := us.limitRepo.ReadByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to retrieve limit", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to retrieve limit")
	}
	if limit == nil {
		return nil, 0, 0, 0, errors.New("limit not found")
	}

	// Count the number of directories
	directories, err := us.directoryRepo.CountByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to count directories", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to count directories")
	}

	// Count the number of files
	files, err := us.fileRepo.CountByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to count files", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to count files")
	}

	// Count the number service accounts
	serviceAccounts, err := us.svcAccRepo.CountByUserID(ctx, user.ID.Hex())
	if err != nil {
		logger.Log.Error("failed to count service accounts", logger.Error(err))
		return nil, 0, 0, 0, errors.New("failed to count service accounts")
	}

	// Return the limit, directories, and files
	return limit, directories, files, serviceAccounts, nil
}
