package database

import (
	"context"
	"fmt"
	"bongaquino/server/app/model"
	"bongaquino/server/app/provider"
	"bongaquino/server/core/logger"

	"go.mongodb.org/mongo-driver/bson"
	mongoDriver "go.mongodb.org/mongo-driver/mongo"
	mongoOptions "go.mongodb.org/mongo-driver/mongo/options"
)

// MigrateCollections creates or updates collections with indexes
func MigrateCollections(mongoProvider *provider.MongoProvider) {
	db := mongoProvider.GetDB()
	ctx := context.Background()

	collections := []struct {
		Name    string
		Indexes []mongoDriver.IndexModel
	}{
		{"users", []mongoDriver.IndexModel{{Keys: bson.D{{Key: "email", Value: 1}}, Options: mongoOptions.Index().SetUnique(true).SetName("unique_email")}}},
		{"profiles", generateIndexes(model.Profile{}.GetIndexes(), "unique_user_id")},
		{"settings", generateIndexes(model.Setting{}.GetIndexes(), "unique_user_id")},
		{"roles", generateIndexes(model.Role{}.GetIndexes(), "unique_role_name")},
		{"permissions", generateIndexes(model.Permission{}.GetIndexes(), "unique_permission_name")},
		{"policies", generateIndexes(model.Policy{}.GetIndexes(), "unique_policy_name")},
		{"policy_permission", []mongoDriver.IndexModel{{Keys: bson.D{{Key: "policy_id", Value: 1}, {Key: "permission_id", Value: 1}}, Options: mongoOptions.Index().SetUnique(true).SetName("unique_policy_permission")}}},
		{"role_permission", []mongoDriver.IndexModel{{Keys: bson.D{{Key: "role_id", Value: 1}, {Key: "permission_id", Value: 1}}, Options: mongoOptions.Index().SetUnique(true).SetName("unique_role_permission")}}},
		{"user_role", generateIndexes(model.UserRole{}.GetIndexes(), "unique_user_role")},
		{"service_accounts", generateIndexes(model.ServiceAccount{}.GetIndexes(), "unique_client_id")},
		{"organizations", generateIndexes(nil, "")},
		{"organization_user_role", generateIndexes(nil, "")},
		{"limits", generateIndexes(model.Limit{}.GetIndexes(), "unique_user_id")},
		{"directories", generateIndexes(nil, "")},
		{"files", generateIndexes(nil, "")},
		{"file_access", generateIndexes(nil, "")},
	}

	for _, collection := range collections {
		if err := ensureCollection(db, ctx, collection.Name, collection.Indexes); err != nil {
			logger.Log.Error(fmt.Sprintf("Failed to migrate collection: %s", collection.Name), logger.Error(err))
		} else {
			logger.Log.Info(fmt.Sprintf("Migrated collection: %s", collection.Name))
		}
	}
}

// generateIndexes converts multiple indexes into []mongoDriver.IndexModel
func generateIndexes(indexes []bson.D, baseIndexName string) []mongoDriver.IndexModel {
	indexModels := make([]mongoDriver.IndexModel, len(indexes))
	for i, index := range indexes {
		indexModels[i] = mongoDriver.IndexModel{
			Keys:    index,
			Options: mongoOptions.Index().SetUnique(true).SetName(fmt.Sprintf("%s_%d", baseIndexName, i+1)),
		}
	}
	return indexModels
}

// ensureCollection ensures a collection exists and applies indexes
func ensureCollection(db *mongoDriver.Database, ctx context.Context, name string, indexes []mongoDriver.IndexModel) error {
	exists, err := db.ListCollectionNames(ctx, bson.M{"name": name})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	if len(exists) == 0 {
		if err := db.CreateCollection(ctx, name); err != nil {
			return fmt.Errorf("failed to create collection %s: %w", name, err)
		}
	}

	if len(indexes) > 0 {
		if _, err := db.Collection(name).Indexes().CreateMany(ctx, indexes); err != nil {
			return fmt.Errorf("failed to create indexes on %s: %w", name, err)
		}
	}

	return nil
}
