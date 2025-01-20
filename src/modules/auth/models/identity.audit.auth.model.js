const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const IdentityAuditAuthEnum = require("../enums/identity.audit.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  identity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    _isExcludedFromInput: true,
    ref: "AuthIdentity"
  },

  action: {
    type: String,
    required: true,
    _isExcludedFromInput: true,
    enum: Object.values(IdentityAuditAuthEnum.ACTIONS).map(item => item.KEY),
  },

  performBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    _isExcludedFromInput: true,
    ref: "AuthIdentity"
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
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


module.exports = mongoose.model("AuthIdentityAudit", Schema);