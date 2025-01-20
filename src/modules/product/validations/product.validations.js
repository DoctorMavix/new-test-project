/**
 * @ProductValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class ProductValidations {

  constructor() {

  }
  /**
   * CreateValidation 
   */
  static CreateValidation(data) {
    const validationSchema = {
      name: Joi.string().required(),
      description: Joi.string().required(),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * UpdateValidation 
   */
  static UpdateValidation(data) {
    const validationSchema = {
      name: Joi.string().allow('').allow(null),
      description: Joi.string().allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}