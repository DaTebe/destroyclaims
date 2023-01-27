/* eslint-disable class-methods-use-this */
const _ = require("lodash");
const { validateExtension } = require("../util/validateDestroyClaimSchema");

/**
 * Extension Class
 */
class Extension {
  #id;

  #name;

  #schema;

  #payload;

  #comment;

  #conditions;

  #evaluation;

  #preEvaluation = () => {};

  #postEvaluation = () => {};

  #evaluationResult = false;

  #state = {};

  /**
   * @param {Object} extension an extension element from a destroy claim (destroySubjects, destroyContacts, destroyConditions, destroyActions)
   * @param {Object} schema the schema of the extension. We can not guarantee, that we could resolve the schema from the schema field. Because of that, the class expects the scheam as second parameter.
   * @param {Object} evaluation function that is injected to evaluate the extension
   * @throws {TypeError} throws when parameter are not of correct type
   * @throws {SchemaValidationError} throws when schema validation failed
   */
  constructor(extension, schema, evaluation) {
    if (new.target === Extension) {
      throw new TypeError(
        "Extension: Cannot construct Extension instances directly. It is an abstract class."
      );
    }
    if (_.isUndefined(extension) || !_.isObject(extension)) {
      throw new TypeError(
        "Extension: extension parameter must exist and be of type Object"
      );
    }
    if (_.isUndefined(schema) || !_.isObject(schema)) {
      throw new TypeError(
        "Extension: schema parameter must exist and be of type Object"
      );
    }
    // need to check if this is needed for DestroyContracts
    if (_.isUndefined(evaluation) || !_.isObject(evaluation)) {
      throw new TypeError(
        "Extension: evaluation parameter must exist and be of type Object"
      );
    }
    if (
      _.isUndefined(evaluation.evaluation) ||
      !_.isFunction(evaluation.evaluation)
    ) {
      throw new TypeError(
        "Extension: evaluation key in evaluation parameter must exists and be of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.preEvaluation) &&
      !_.isFunction(evaluation.preEvaluation)
    ) {
      throw new TypeError(
        "Extension: preEvaluation key in evaluation parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.postEvaluation) &&
      !_.isFunction(evaluation.postEvaluation)
    ) {
      throw new TypeError(
        "Extension: postEvaluation key in evaluation parameter must be of type Function"
      );
    }

    // we can take some things for granted
    // validation of the core schema has been done before
    this.#id = extension.id;
    this.#name = extension.name;
    this.#schema = schema;
    this.#payload = extension.payload;
    this.#comment = "comment" in extension ? extension.comment : null;
    this.#conditions = "conditions" in extension ? extension.conditions : null;
    this.#evaluation = evaluation.evaluation;

    if (!_.isUndefined(evaluation.preEvaluation)) {
      this.#preEvaluation = evaluation.preEvaluation;
    }
    if (!_.isUndefined(evaluation.postEvaluation)) {
      this.#postEvaluation = evaluation.postEvaluation;
    }

    validateExtension(this.#payload, this.#schema);
  }

  /**
   * get the id of the extension
   * @returns {String} the id
   */
  getId() {
    return this.#id;
  }

  /**
   * get the name of the extension
   * @returns {String} the name
   */
  getName() {
    return this.#name;
  }

  /**
   * get the schema of the extension
   * @returns {Object} the schema
   */
  getSchema() {
    return this.#schema;
  }

  /**
   * get the payload of the extension
   * @returns {Object} the payload
   */
  getPayload() {
    return this.#payload;
  }

  /**
   * get the comment of the extension
   * @returns {String} the comment
   */
  getComment() {
    return this.#comment;
  }

  /**
   * get the conditions of the extension
   * @returns {Object|} the conditions (JSONLogic)
   */
  getConditions() {
    return this.#conditions;
  }

  /**
   * Returns the evaluation result
   * @returns {Boolean} returns if evaluation was positive (true) or negative (false)
   */
  getEvaluationResult() {
    return this.#evaluationResult;
  }

  /**
   * Returns the state of the instanciation
   * @param {String} key key to receive from
   * @returns {*} returns state
   * @throws {TypeError} throws if parameter not set or wronmg type
   */
  getState(key) {
    if (_.isUndefined(key) || !_.isString(key)) {
      throw new TypeError(
        "Extension: key parameter must be set and of type String."
      );
    }
    return this.#state[key];
  }

  /**
   * Set a value by key in the state object of the instanciation
   * @param {String} key key where to store the value
   * @param {*} value value that will be stored
   * @throws {TypeError} throws, if parameter not set or wrong type
   */
  setState(key, value) {
    if (_.isUndefined(key) || !_.isString(key)) {
      throw new TypeError(
        "Extension: key parameter must be set and of type String."
      );
    }
    if (_.isUndefined(value)) {
      throw new TypeError("Extension: value parameter must be set.");
    }
    this.#state[key] = value;
  }

  /**
   * evaluate the extension
   * @param {Object} destroyclaim Destroyclaim object this extension is part of
   * @returns {Boolean} returns if evaluation was positive (true) or negative (false)
   */
  async evaluate(destroyclaim) {
    await this.#preEvaluation(this, destroyclaim);
    this.#evaluationResult = await this.#evaluation(this, destroyclaim);
    await this.#postEvaluation(this, destroyclaim);
    return this.#evaluationResult;
  }
}

module.exports = Extension;
