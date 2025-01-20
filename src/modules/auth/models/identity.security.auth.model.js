const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthIdentitySecurityEnum = require("../enums/identity.security.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  identity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "AuthIdentity"
  },

  password: {
    type: String,
    required: false,
    select: false,
    _isHashed: true,
  },

  identifierVerification: {
    code: {
      type: String,
      required: false,
      select: false
    },
    expiredOn: {
      type: Date,
      required: false
    },
    verifiedOn: {
      type: Date,
      required: false
    },
    contactId: {
      type: String,
      required: false
    },
    lastAttemptAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false
    }
  },

  passwordReset: {
    code: {
      type: String,
      required: false,
      select: false
    },
    expiredOn: {
      type: Date,
      required: false
    },
    verifiedOn: {
      type: Date,
      required: false
    },
    contactId: {
      type: String,
      required: false
    },
    lastAttemptAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false
    }
  },

  oauth: {
    provider: {
      type: String,
      required: false,
      enum: Object.values(AuthIdentitySecurityEnum.OAUTH_PROVIDERS).map(item => item.PROVIDER)
    },
    id: {
      type: String,
      required: false
    }
  },

  lastLogin: {
    type: Date,
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


module.exports = mongoose.model("AuthIdentitySecurity", Schema);