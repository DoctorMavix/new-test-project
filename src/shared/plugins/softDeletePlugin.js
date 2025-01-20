const mongoose = require('mongoose');

const softDeletePlugin = (schema) => {
    // Ensure the schema has 'deletedAt' field, if not present add it
    if (!schema.path('deletedAt')) {
        schema.add({
            deletedAt: {
                type: Date,
                required: false,
            },
        });
    }

    // Optional: Ensure the schema has 'deletedBy' field, if not present add it
    if (!schema.path('deletedBy')) {
        schema.add({
            deletedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Assumes 'User' is the model for users
                required: false,
            },
        });
    }

    // Prevent conflicts with existing schema properties
    if (!schema.query.includeDeleted) {
        schema.query.includeDeleted = function() {
            this._includeDeleted = true;
            return this;
        };
    }

    if (!schema.query.onlyDeleted) {
        schema.query.onlyDeleted = function() {
            this._onlyDeleted = true;
            return this;
        };
    }

    // Pre hook to filter documents based on deletion status
    schema.pre(['find', 'findOne'], function() {
        if (this._onlyDeleted) {
            this.where({ deletedAt: { $exists: true } });
        } else if (!this._includeDeleted) {
            this.where({ deletedAt: { $exists: false } });
        }
    });

    // Method to soft delete a document
    schema.methods.softDelete = async function(userId, session = null) {
        if (!this.deletedAt) {
            this.deletedAt = new Date();
            if (schema.path('deletedBy') && userId) {
                this.deletedBy = userId; // Use the user ID if provided
            }
            await this.save({ session });
        }
    };

    // Method to restore a soft deleted document
    schema.methods.restore = async function(session = null) {
        if (this.deletedAt) {
            this.deletedAt = null;
            if (schema.path('deletedBy')) {
                this.deletedBy = null; // Reset the deletedBy field
            }
            await this.save({ session });
        }
    };

    // Method for permanent deletion
    schema.methods.hardDelete = async function(session = null) {
        await this.remove({ session });
    };

    // Static method to restore all soft deleted documents
    schema.statics.restoreAll = async function(session = null) {
        return this.updateMany({ deletedAt: { $exists: true } }, { deletedAt: null, deletedBy: null }, { session });
    };

    // Static method to permanently delete soft deleted documents older than a specified time
    schema.statics.hardDeleteAfterTime = async function(days, session = null) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        return this.deleteMany({ deletedAt: { $lte: threshold } }, { session });
    };

    // Static method to find all non-deleted documents
    schema.statics.findNonDeleted = function(session = null) {
        return this.find({ deletedAt: { $exists: false } }).session(session);
    };

    // Static method to find all deleted documents
    schema.statics.findDeleted = function(session = null) {
        return this.find({ deletedAt: { $exists: true } }).session(session);
    };
};

module.exports = softDeletePlugin;