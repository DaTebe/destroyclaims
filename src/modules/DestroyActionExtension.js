/* eslint-disable class-methods-use-this */
const _ = require("lodash");
const Extension = require("./Extension");

/**
 * Destroy Action Extension Class
 */
class DestroyActionExtension extends Extension {
  #realModeCallback;

  #simulationModeCallback;

  #preProcess = () => {};

  #postProcess = () => {};

  /**
   * @param {Object} extension an extension element from a destroy claim (destroySubjects, destroyContacts, destroyConditions, destroyActions)
   * @param {Object} schema the schema of the extension. We can not guarantee, that we could resolve the schema from the schema field. Because of that, the class expects the scheam as second parameter.
   * @param {Function} evaluation function that is injected to evaluate the extension
   * @param {Object} process process functions for real mode and simulation mode
   * @param {Function} process.realMode function that is called in real mode to process destroy action
   * @param {Function} process.simulationMode function that is called in simulation mode to process destroy action
   */
  constructor(extension, schema, evaluation, process) {
    if (_.isUndefined(process) || !_.isObject(process)) {
      throw new TypeError(
        "DestroyActionExtension: process parameter must exist and be of type Object"
      );
    }
    if (
      _.isUndefined(process.realMode) &&
      _.isUndefined(process.simulationMode)
    ) {
      throw new TypeError(
        "DestroyActionExtension: At least one, realMode or simulation mode must be set"
      );
    }
    if (!_.isUndefined(process.realMode) && !_.isFunction(process.realMode)) {
      throw new TypeError(
        "DestroyActionExtension: realMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.simulationMode) &&
      !_.isFunction(process.simulationMode)
    ) {
      throw new TypeError(
        "DestroyActionExtension: simulationMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.preProcess) &&
      !_.isFunction(process.preProcess)
    ) {
      throw new TypeError(
        "DestroyActionExtension: preProcess key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.postProcess) &&
      !_.isFunction(process.postProcess)
    ) {
      throw new TypeError(
        "DestroyActionExtension: postProcess key in process parameter must be of type Function"
      );
    }

    super(extension, schema, evaluation);

    if (!_.isUndefined(process.realMode)) {
      this.#realModeCallback = process.realMode;
    }
    if (!_.isUndefined(process.simulationMode)) {
      this.#simulationModeCallback = process.simulationMode;
    }
    if (!_.isUndefined(process.preProcess)) {
      this.#preProcess = process.preProcess;
    }
    if (!_.isUndefined(process.postProcess)) {
      this.#postProcess = process.postProcess;
    }
  }

  /**
   * start processing destroy action and corresponding destroy subject in real mode
   * @param {Object} subject destroy subject that refers to this action
   * @param {Object} destroyclaim Destroyclaim object this subject is part of
   * @returns {*} return type depends on the injected realModeCallback.
   */
  async processRealMode(subject, destroyclaim) {
    if (_.isUndefined(this.#realModeCallback)) {
      throw new TypeError(
        "DestroyActionExtension: realMode function was not set on construction"
      );
    }
    await this.#preProcess(this, destroyclaim);
    await this.#realModeCallback(this, subject);
    await this.#postProcess(this, destroyclaim);
  }

  /**
   * start processing destroy action and corresponding destroy subject in simulation mode
   * @param {Object} subject destroy subject that refers to this action
   * @param {Object} destroyclaim Destroyclaim object this subject is part of
   * @returns {*} return type depends on the injected simulationModeCallback.
   */
  async processSimulationMode(subject, destroyclaim) {
    if (_.isUndefined(this.#simulationModeCallback)) {
      throw new TypeError(
        "DestroyActionExtension: simulationMode function was not set on construction"
      );
    }
    await this.#preProcess(this, destroyclaim);
    await this.#simulationModeCallback(this, subject);
    await this.#postProcess(this, destroyclaim);
  }
}

module.exports = DestroyActionExtension;
