/* eslint-disable class-methods-use-this */
const _ = require("lodash");
const Extension = require("./Extension");

/**
 * Destroy Subject Extension Class
 */
class DestroySubjectExtension extends Extension {
  #action;

  #realModeCallback;

  #simulationModeCallback;

  #preProcess = () => {};

  #postProcess = () => {};

  /**
   * @param {Object} extension an extension element from a destroy claim (destroySubjects, destroyContacts, destroyConditions, destroyActions)
   * @param {Object} schema the schema of the extension. We can not guarantee, that we could resolve the schema from the schema field. Because of that, the class expects the scheam as second parameter.
   * @param {Function} evaluation function that is injected to evaluate the extension
   * @param {Object} process process functions for real mode and simulation mode
   * @param {Function} process.realMode function that is called in real mode to process destroy subject as default action
   * @param {Function} process.simulationMode function that is called in simulation mode to process destroy subject as default action
   */
  constructor(extension, schema, evaluation, process) {
    super(extension, schema, evaluation);
    if (_.isUndefined(process) || !_.isObject(process)) {
      throw new TypeError(
        "DestroySubjectExtension: process parameter must exist and be of type Object"
      );
    }
    if (
      _.isUndefined(process.realMode) &&
      _.isUndefined(process.simulationMode)
    ) {
      throw new TypeError(
        "DestroySubjectExtension: At least one, realMode or simulation mode must be set"
      );
    }
    if (!_.isUndefined(process.realMode) && !_.isFunction(process.realMode)) {
      throw new TypeError(
        "DestroySubjectExtension: realMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.simulationMode) &&
      !_.isFunction(process.simulationMode)
    ) {
      throw new TypeError(
        "DestroySubjectExtension: simulationMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.preProcess) &&
      !_.isFunction(process.preProcess)
    ) {
      throw new TypeError(
        "DestroySubjectExtension: preProcess key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.postProcess) &&
      !_.isFunction(process.postProcess)
    ) {
      throw new TypeError(
        "DestroySubjectExtension: postProcess key in process parameter must be of type Function"
      );
    }

    this.#action = "action" in extension ? extension.action : null;

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
   * get action that must be executed for this subject
   * @returns {String} id of the destroyAction to be executed
   */
  getAction() {
    return this.#action;
  }

  /**
   * start processing destroy subject in real mode
   * @param {Object} destroyclaim Destroyclaim object this subject is part of
   * @returns {*} return type depends on the injected realModeCallback.
   */
  async processRealMode(destroyclaim) {
    if (_.isUndefined(this.#realModeCallback)) {
      throw new TypeError(
        "DestroySubjectExtension: realMode function was not set on construction"
      );
    }
    await this.#preProcess(this, destroyclaim);
    await this.#realModeCallback(this, destroyclaim);
    await this.#postProcess(this, destroyclaim);
  }

  /**
   * start processing destroy subject in simulation mode
   * @param {Object} destroyclaim Destroyclaim object this subject is part of
   * @returns {*} return type depends on the injected simulationModeCallback.
   */
  async processSimulationMode(destroyclaim) {
    if (_.isUndefined(this.#simulationModeCallback)) {
      throw new TypeError(
        "DestroySubjectExtension: simulationMode function was not set on construction"
      );
    }
    await this.#preProcess(this, destroyclaim);
    await this.#simulationModeCallback(this, destroyclaim);
    await this.#postProcess(this, destroyclaim);
  }
}

module.exports = DestroySubjectExtension;
