const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const IdentifierAuthEnum = require("../enums/identity.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: false,
  },

  identifier: {
    type: String,
    required: true,
    unique: true,
  },

  identifierType: {
    type: String,
    required: true,
    enum: Object.values(IdentifierAuthEnum.IDENTIFIER_TYPES).map(item => item.KEY),
  },

  isActive: {
    type: Boolean,
    required: false,
    _isExcludedFromInput: true,
  },

  isBlocked: {
    type: Boolean,
    required: false,
    _isExcludedFromInput: true,
  },
}, {
  timestamps: true
});

/**
 * ENTITY ANNOTATIONS
 * @CREATED_BY_AUDIT 
 * @UPDATED_BY_AUDIT 
 * @DELETED_BY_AUDIT 
 */

const dateFields = ['createdAt', 'updatedAt', 'deletedAt'];

Schema.plugin(uniqueValidator, {
  message: '{PATH} already exists.'
});
Schema.plugin(softDeletePlugin);

Schema.post("find", async function(data, next) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    helperMethod.dateFieldsFormatAlgo(item, dateFields);
  }
  next();
});

Schema.post("findOne", async function(item, next) {
  helperMethod.dateFieldsFormatAlgo(item, dateFields);
  next();
});

module.exports = mongoose.model("AuthIdentity", Schema);