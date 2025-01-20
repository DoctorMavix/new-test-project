const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthEnum = require("../enums/auth.enum");
const MfaConfigEnum = require("../enums/mfaconfig.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  actorType: {
    type: String,
    required: true,
    _isExcludedFromInput: true,
    enum: Object.values(AuthEnum.ACTOR_TYPES).map(item => item.NAME),
  },

  accessToken: {
    type: String,
    required: true,
    _isExcludedFromInput: true,
  },

  accessTokenExpiresAt: {
    type: Date,
    required: true,
    _isExcludedFromInput: true,
  },

  refreshToken: {
    type: String,
    required: true,
    _isExcludedFromInput: true,
  },

  refreshTokenExpiresAt: {
    type: Date,
    required: true,
    _isExcludedFromInput: true,
  },

  mfa: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    code: {
      type: String,
      required: false,
      select: false
    },
    codeExpiresAt: {
      type: Date,
      required: false
    },
    method: {
      type: String,
      enum: [MfaConfigEnum.METHODS.EMAIL, MfaConfigEnum.METHODS.SMS, MfaConfigEnum.METHODS.NONE],
      default: MfaConfigEnum.METHODS.NONE
    },
    contactId: {
      type: String,
      required: false,
      select: false
    },
    isCodeSent: {
      type: Boolean,
      required: false
    },
    codeVerifiedAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      required: false
    }
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


module.exports = mongoose.model("Auth", Schema);