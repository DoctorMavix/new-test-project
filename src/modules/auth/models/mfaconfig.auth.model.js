const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const MfaConfigEnum = require("../enums/mfaconfig.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  method: {
    type: String,
    required: false,
    enum: [MfaConfigEnum.METHODS.EMAIL, MfaConfigEnum.METHODS.SMS, MfaConfigEnum.METHODS.NONE],
  },

  actorType: {
    type: String,
    required: true,
  },

  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  isEnabled: {
    type: Boolean,
    required: false,
  },

  phoneNumber: {
    type: String,
    required: false,
  },

  emailAddress: {
    type: String,
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


module.exports = mongoose.model("MFAConfig", Schema);