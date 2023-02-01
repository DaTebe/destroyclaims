const Ajv20 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const { SchemaValidationError } = require("./errors");
const { isStrictMode } = require("./dcTools");
const schema = require("../../schema/destroyclaim-schema.json");

/**
 * Checks, if the destroy claim has a proper schema
 * @param {Object} destroyclaim
 * @param {Boolean} strictmode if strict mode is active
 * @throws {SchemaValidationError}
 */
const validateCore = (destroyclaim) => {
  const ajv = new Ajv20({ strict: false, allErrors: true });
  addFormats(ajv);
  const dcSchema = JSON.parse(JSON.stringify(schema));
  if (isStrictMode(destroyclaim)) {
    dcSchema.unevaluatedProperties = false;
    dcSchema.required.push("modelVersion");
    dcSchema.required.push("manualMode");
    dcSchema.required.push("notificationMode");
    dcSchema.required.push("simulationMode");
    dcSchema.properties.destroySubjects.items.required = ["action"];
  }
  const validate = ajv.compile(dcSchema);
  if (!validate(destroyclaim)) {
    throw new SchemaValidationError(
      `destroy claim core schema not valid`,
      validate.errors
    );
  }
};

/**
 * Checks, if the extension payload has a proper schema
 * @param {Object} destroyclaim
 * @param {Object} schema JSON schema of the extension payload
 * @throws {SchemaValidationError}
 */
const validateExtension = (payload, schema) => {
  const ajv = new Ajv20({ strict: false, allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(payload)) {
    throw new SchemaValidationError(
      `extension schema (${schema?.title}) not valid`,
      validate.errors
    );
  }
};

module.exports = {
  validateCore,
  validateExtension,
};
