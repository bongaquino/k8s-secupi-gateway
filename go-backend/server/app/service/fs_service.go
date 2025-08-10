package service

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"bongaquino/server/app/dto"
	"bongaquino/server/app/helper"
	"bongaquino/server/app/model"
	"bongaquino/server/app/provider"
	"bongaquino/server/app/repository"
	"path/filepath"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type FSService struct {
	redisProvider  *provider.RedisProvider
	directoryRepo  *repository.DirectoryRepository
	fileRepo       *repository.FileRepository
	fileAccessRepo *repository.FileAccessRepository
}

// NewFSService initializes a new FSService
func NewFSService(
	redisProvider *provider.RedisProvider,
	directoryRepo *repository.DirectoryRepository,
	fileRepo *repository.FileRepository,
	fileAccessRepo *repository.FileAccessRepository,
) *FSService {
	return &FSService{
		redisProvider:  redisProvider,
		directoryRepo:  directoryRepo,
		fileRepo:       fileRepo,
		fileAccessRepo: fileAccessRepo,
	}
}

func (fs *FSService) ReadRootDirectory(ctx context.Context, userID string) (*model.Directory,
	[]*model.Directory, []*model.File, error) {
	// Fetch the directory from the repository
	directory, err := fs.directoryRepo.ReadByUserIDName(ctx, userID, "root")
	if err != nil {
		return nil, nil, nil, err
	}

	// Fetch the subdirectories within the root directory
	subDirectories, err := fs.directoryRepo.ListByDirectoryIDUserID(ctx, directory.ID.Hex(), userID)
	if err != nil {
		return nil, nil, nil, err
	}

	// Fetch files within the root directory
	files, err := fs.fileRepo.ListByDirectoryIDUserID(ctx, directory.ID.Hex(), userID)
	if err != nil {
		return nil, nil, nil, err
	}

	// Return the directory details
	return directory, subDirectories, files, nil
}

func (fs *FSService) ReadDirectory(ctx context.Context, ID string, userID string) (*model.Directory,
	[]*model.Directory, []*model.File, error) {
	// Fetch the directory from the repository
	directory, err := fs.directoryRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return nil, nil, nil, err
	}

	// Check if the directory exists
	if directory == nil {
		return nil, nil, nil, errors.New("directory not found")
	}

	// Fetch the subdirectories within the specified directory
	subDirectories, err := fs.directoryRepo.ListByDirectoryIDUserID(ctx, directory.ID.Hex(), userID)
	if err != nil {
		return nil, nil, nil, err
	}

	// Fetch files within the specified directory
	files, err := fs.fileRepo.ListByDirectoryIDUserID(ctx, directory.ID.Hex(), userID)
	if err != nil {
		return nil, nil, nil, err
	}

	// Return the directory details
	return directory, subDirectories, files, nil
}

func (fs *FSService) CreateDirectory(ctx context.Context, directory *model.Directory) error {
	// Create the directory in the repository
	err := fs.directoryRepo.Create(ctx, directory)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) UpdateDirectory(ctx context.Context, ID string, userID string, request *dto.UpdateDirectoryDTO) error {
	// Check if there is anything to update
	if request.Name == "" && request.DirectoryID == nil {
		return errors.New("no fields to update")
	}

	// Fetch the directory from the repository
	directory, err := fs.directoryRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return err
	}

	// Check if the directory exists
	if directory == nil {
		return errors.New("directory not found")
	}

	// Check if the directory is the root directory
	if directory.Name == "root" {
		return errors.New("cannot update root directory")
	}

	// Update the parent directory if provided
	if request.DirectoryID != nil && *request.DirectoryID != "" {
		parentDirectory, err := fs.directoryRepo.ReadByIDUserID(ctx, *request.DirectoryID, userID)
		if err != nil {
			return err
		}
		if parentDirectory == nil {
			return errors.New("parent directory not found")
		}
		directory.DirectoryID = &parentDirectory.ID
	}

	// If the request contains a new name, use it; otherwise, keep the existing name
	directoryName := directory.Name
	if request.Name != "" {
		directoryName = request.Name
	}

	// Save the updated directory in the repository
	updateData := bson.M{
		"name":         directoryName,
		"directory_id": directory.DirectoryID,
	}

	err = fs.directoryRepo.Update(ctx, ID, updateData)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) RecalculateDirectorySizeAndParents(ctx context.Context, directoryID, userID string) error {
	currentID := directoryID
	for currentID != "" {
		// Use the service-layer sum function
		totalSize, err := fs.SumSizeByDirectorySubtree(ctx, currentID, userID)
		if err != nil {
			return err
		}
		// Update the directory's size
		err = fs.directoryRepo.Update(ctx, currentID, bson.M{"size": totalSize})
		if err != nil {
			return err
		}
		// Move to parent
		dir, err := fs.directoryRepo.ReadByIDUserID(ctx, currentID, userID)
		if err != nil || dir == nil || dir.DirectoryID == nil {
			break
		}
		currentID = dir.DirectoryID.Hex()
	}
	return nil
}

func (fs *FSService) SumSizeByDirectorySubtree(ctx context.Context, directoryID, userID string) (int64, error) {
	// Get all descendant directory IDs (including nested children)
	descendantIDs, err := fs.directoryRepo.FindAllDescendantIDs(ctx, directoryID, userID)
	if err != nil {
		return 0, err
	}
	allIDs := append(descendantIDs, directoryID) // include self

	var total int64 = 0
	for _, dirID := range allIDs {
		files, err := fs.fileRepo.ListByDirectoryIDUserID(ctx, dirID, userID)
		if err != nil {
			return 0, err
		}
		for _, file := range files {
			if !file.IsDeleted {
				total += file.Size
			}
		}
	}
	return total, nil
}

func (fs *FSService) DeleteDirectory(ctx context.Context, ID string, userID string) error {
	// Fetch the directory from the repository
	directory, err := fs.directoryRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return err
	}

	// Check if the directory exists
	if directory == nil {
		return errors.New("directory not found")
	}

	// Check if the directory is not the root directory
	if directory.Name == "root" {
		return errors.New("cannot delete root directory")
	}

	// Initialize a queue for BFS traversal
	queue := []string{ID}

	for len(queue) > 0 {
		currentID := queue[0]
		queue = queue[1:]

		// Mark the current directory as deleted
		err = fs.directoryRepo.Update(ctx, currentID, bson.M{"is_deleted": true})
		if err != nil {
			return err
		}

		// Mark all files in the current directory as deleted
		files, err := fs.fileRepo.ListByDirectoryIDUserID(ctx, currentID, userID)
		if err != nil {
			return err
		}
		for _, file := range files {
			err = fs.fileRepo.Update(ctx, file.ID.Hex(), bson.M{"is_deleted": true})
			if err != nil {
				return err
			}
		}

		// Fetch all subdirectories of the current directory
		subdirs, err := fs.directoryRepo.ListByDirectoryIDUserID(ctx, currentID, userID)
		if err != nil {
			return err
		}

		// Enqueue all subdirectory IDs
		for _, subdir := range subdirs {
			queue = append(queue, subdir.ID.Hex())
		}
	}

	// Set the deleted directory's size to 0
	err = fs.directoryRepo.Update(ctx, ID, bson.M{"size": 0})
	if err != nil {
		return err
	}

	// Recalculate all parent directories' sizes
	if directory.DirectoryID != nil {
		err = fs.RecalculateDirectorySizeAndParents(ctx, directory.DirectoryID.Hex(), userID)
		if err != nil {
			return fmt.Errorf("failed to recalculate parent directories' sizes: %w", err)
		}
	}

	return nil
}

func (fs *FSService) CheckDirectoryOwnership(ctx context.Context, ID string, userID string) (bool, error) {
	// Fetch the directory from the repository
	directory, err := fs.directoryRepo.ReadByIDUserID(ctx, ID, userID)

	if err != nil {
		return false, err
	}

	// Check if the directory exists
	if directory == nil {
		return false, errors.New("directory not found")
	}

	// Return true if the user owns the directory
	return true, nil
}

// CheckFileOwnership checks if the user owns the file with the given ID
func (fs *FSService) CheckFileOwnership(ctx context.Context, ID string, userID string) (bool, error) {
	// Fetch the file from the repository
	file, err := fs.fileRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return false, err
	}

	// Check if the file exists
	if file == nil {
		return false, errors.New("file not found")
	}

	// Return true if the user owns the file
	return true, nil
}

func (fs *FSService) CreateFile(ctx context.Context, file *model.File) error {
	// Create the file in the repository
	err := fs.fileRepo.Create(ctx, file)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) ReadFileByID(ctx context.Context, ID string) (*model.File, error) {
	// Fetch the file from the repository
	file, err := fs.fileRepo.Read(ctx, ID)
	if err != nil {
		return nil, err
	}

	// Check if the file exists
	if file == nil {
		return nil, errors.New("file not found")
	}

	return file, nil
}

func (fs *FSService) ReadFileByIDUserID(ctx context.Context, ID string, userID string) (*model.File, error) {
	// Fetch the file from the repository
	file, err := fs.fileRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return nil, err
	}

	// Check if the file exists
	if file == nil {
		return nil, errors.New("file not found")
	}

	return file, nil
}

func (fs *FSService) UpdateFile(ctx context.Context, ID string, userID string, request *dto.UpdateFileDTO) error {
	// Check if there is anything to update
	if request.Name == "" && request.DirectoryID == nil && request.IsShared == nil {
		return errors.New("no fields to update")
	}

	// Fetch the file from the repository
	file, err := fs.fileRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return err
	}

	// Check if the file exists
	if file == nil {
		return errors.New("file not found")
	}

	// Validate the file extension if a new name is provided
	fileName := file.Name
	if request.Name != "" {
		oldExt := strings.ToLower(filepath.Ext(file.Name))
		newExt := strings.ToLower(filepath.Ext(request.Name))

		if oldExt != newExt {
			return errors.New("cannot change file extension")
		}
		fileName = request.Name
	}

	// Prepare update data
	updateData := bson.M{
		"name": fileName,
	}

	// If a new directory ID is provided, validate and include it
	if request.DirectoryID != nil && *request.DirectoryID != "" {
		directory, err := fs.directoryRepo.ReadByIDUserID(ctx, *request.DirectoryID, userID)
		if err != nil {
			return errors.New("error fetching directory")
		}
		if directory == nil {
			return errors.New("directory not found")
		}
		updateData["directory_id"] = directory.ID
	}

	// Save the updated file in the repository
	err = fs.fileRepo.Update(ctx, ID, updateData)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) DeleteFile(ctx context.Context, ID string, userID string) error {
	// Fetch the file from the repository
	file, err := fs.fileRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return err
	}

	// Check if the file exists
	if file == nil {
		return errors.New("file not found")
	}
	// Save the updated file in the repository
	updateData := bson.M{
		"is_deleted": true,
	}
	err = fs.fileRepo.Update(ctx, ID, updateData)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) UpdateFileAccess(ctx context.Context, ID string, userID string, access string) error {
	// Fetch the file from the repository
	file, err := fs.fileRepo.ReadByIDUserID(ctx, ID, userID)
	if err != nil {
		return err
	}

	// Check if the file exists
	if file == nil {
		return errors.New("file not found")
	}

	// Update the file's access type
	updateData := bson.M{
		"access": access,
	}

	err = fs.fileRepo.Update(ctx, ID, updateData)
	if err != nil {
		return err
	}

	return nil
}

func (fs *FSService) SetTemporaryFileKey(ctx context.Context, fileKey string, fileID string, duration time.Duration) error {
	// Save the temporary access key in Redis
	err := fs.redisProvider.Set(ctx, "file_key:"+fileKey, fileID, duration)
	if err != nil {
		return fmt.Errorf("failed to save temporary file key: %w", err)
	}
	return nil
}

func (fs *FSService) GetTemporaryFileKey(ctx context.Context, fileKey string) (string, error) {
	// Retrieve the temporary access key from Redis
	fileID, err := fs.redisProvider.Get(ctx, "file_key:"+fileKey)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve temporary file key: %w", err)
	}
	return fileID, nil
}

func (fs *FSService) CreateFileAccess(ctx context.Context, fileAccess *model.FileAccess) error {
	// Create the file access record in the repository
	err := fs.fileAccessRepo.Create(ctx, fileAccess)

	if err != nil {
		return err
	}
	return nil
}

func (fs *FSService) ReadFileAccessByFileID(ctx context.Context, fileID string) (*model.FileAccess, error) {
	// Fetch the file access record by file ID from the repository
	fileAccess, err := fs.fileAccessRepo.ReadByFileID(ctx, fileID)
	if err != nil {
		return nil, err
	}

	// Check if the file access record exists
	if fileAccess == nil {
		return nil, errors.New("file access not found")
	}

	return fileAccess, nil
}

func (fs *FSService) DeleteFileAccessByFileID(ctx context.Context, fileID string) error {
	// Delete all file access records for the specified file ID
	err := fs.fileAccessRepo.DeleteByFileID(ctx, fileID)
	if err != nil {
		return fmt.Errorf("failed to delete file access records: %w", err)
	}
	return nil
}

func (fs *FSService) ValidateFileAccess(ctx context.Context, fileID string, userID string) bool {
	// Check file ID owner
	file, err := fs.fileRepo.Read(ctx, fileID)
	if err != nil || file == nil {
		return false
	}

	// If the user is the owner of the file, they have access
	if file.UserID.Hex() == userID {
		return true
	}

	// Fetch all file access records by file ID
	fileAccessList, err := fs.fileAccessRepo.ListByFileID(ctx, fileID)
	if err != nil || len(fileAccessList) == 0 {
		return false
	}

	// Loop through the records to find a match
	for _, access := range fileAccessList {
		if access.OwnerID.Hex() == userID || (access.RecipientID != nil && access.RecipientID.Hex() == userID) {
			return true
		}
	}

	return false
}

func (fs *FSService) ListFileAccessByFileID(ctx context.Context, fileID string) ([]*model.FileAccess, error) {
	// Fetch all file access records by file ID from the repository
	fileAccessList, err := fs.fileAccessRepo.ListByFileID(ctx, fileID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch file access records: %w", err)
	}

	// Check if any records were found
	if len(fileAccessList) == 0 {
		return nil, errors.New("no file access records found")
	}

	// Convert []model.FileAccess to []*model.FileAccess
	result := make([]*model.FileAccess, len(fileAccessList))
	for i := range fileAccessList {
		result[i] = &fileAccessList[i]
	}

	return result, nil
}

// EncryptFileForUpload handles encryption for file uploads
func (fs *FSService) EncryptFileForUpload(fileBytes []byte, passphrase string) (ciphertext []byte, salt string, nonce string, err error) {
	// Generate salt
	salt, err = helper.GenerateSalt()
	if err != nil {
		return nil, "", "", err
	}
	// Generate nonce
	nonce, err = helper.GenerateNonce()
	if err != nil {
		return nil, "", "", err
	}
	// Derive key from passphrase using the salt
	keyBytes, err := helper.DeriveKey(passphrase, salt)
	if err != nil {
		return nil, "", "", err
	}
	// Create AES-GCM Cipher
	aesGCM, err := helper.CreateAesGcmCipher(keyBytes)
	if err != nil {
		return nil, "", "", err
	}
	// Decode nonce for AES-GCM
	nonceBytes, err := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(nonce)
	if err != nil {
		return nil, "", "", err
	}
	ciphertext = aesGCM.Seal(nil, nonceBytes, fileBytes, nil)
	return ciphertext, salt, nonce, nil
}

// DecryptFileForDownload handles decryption for file downloads
func (fs *FSService) DecryptFileForDownload(encryptedFile []byte, encryptedSalt, encryptedNonce, passphrase string) ([]byte, error) {
	// Decrypt salt
	decryptedSalt, err := helper.Decrypt(encryptedSalt)
	if err != nil {
		return nil, err
	}
	// Decrypt nonce
	decryptedNonce, err := helper.Decrypt(encryptedNonce)
	if err != nil {
		return nil, err
	}
	// Derive key
	keyBytes, err := helper.DeriveKey(passphrase, decryptedSalt)
	if err != nil {
		return nil, err
	}
	// Create AES-GCM cipher
	aesGCM, err := helper.CreateAesGcmCipher(keyBytes)
	if err != nil {
		return nil, err
	}
	// Decode nonce
	nonceBytes, err := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(decryptedNonce)
	if err != nil {
		return nil, err
	}
	// Decrypt file
	plaintext, decErr := aesGCM.Open(nil, nonceBytes, encryptedFile, nil)
	if decErr != nil {
		return nil, decErr
	}
	return plaintext, nil
}
