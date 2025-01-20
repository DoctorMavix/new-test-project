const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Owner"
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Owner"
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Owner"
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

/**
 * ENTITY ANNOTATIONS
 * @CREATED_BY_AUDIT createdBy
 * @UPDATED_BY_AUDIT updatedBy
 * @DELETED_BY_AUDIT deletedBy
 */

const dateFields = [];

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


module.exports = mongoose.model("Product", Schema);