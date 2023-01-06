const _ = require("lodash");
const { SupportError } = require("../util/errors");

/**
 * Generates a Support Object that is accepted by the DestroyClaimValidator
 */
class SupportObjectGenerator {
  #support;

  /**
   * Build a default support object.
   * The default support is not a valid support object.
   * You need to support:
   * - normalMode or strictMode
   * - manualMode or automatedMode
   * - realMode or simulationMode
   * - silentMode or notificationMode
   * You also need at least one extension of type destroySubject.
   * If you support strictMode, you also need to support at least one destroy claim model version.
   */
  constructor() {
    this.#support = {
      extensions: {},
      destroyReasons: [],
      modelVersion: [],
      strictMode: false,
      normalMode: false,
      realMode: false,
      simulationMode: false,
      automatedMode: false,
      manualMode: false,
      silentMode: false,
      notificationMode: false,
      preAllEvaluationHook: () => {},
      postAllEvaluationHook: () => {},
      preAllExecuteHook: () => {},
      postAllExecuteHook: () => {},
    };
  }

  #addEvalOnlyExtension(extensionName, schema, evaluation, type) {
    if (!_.isString(extensionName)) {
      throw new TypeError(
        "SupportObjectGenerator: extension name must be of type String"
      );
    }
    if (_.has(this.#support.extensions, extensionName)) {
      throw new SupportError(
        "SupportObjectGenerator: extension already exists"
      );
    }
    if (!_.isObject(schema)) {
      throw new TypeError(
        "SupportObjectGenerator: schema must be of type Object"
      );
    }
    if (!_.isObject(evaluation)) {
      throw new TypeError(
        "SupportObjectGenerator: evaluation must be of type Object"
      );
    }
    if (
      _.isUndefined(evaluation.evaluation) ||
      !_.isFunction(evaluation.evaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: evaluation key in evaluation parameter must be set and of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.preEvaluation) &&
      !_.isFunction(evaluation.preEvaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: preEvaluation key in evaluation parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.postEvaluation) &&
      !_.isFunction(evaluation.postEvaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: postEvaluation key in evaluation parameter must be of type Function"
      );
    }
    this.#support.extensions[extensionName] = {
      extensionName,
      schema,
      evaluation,
      type,
    };
  }

  #addEvalAndProcessExtension(
    extensionName,
    schema,
    evaluation,
    process,
    type
  ) {
    if (!_.isString(extensionName)) {
      throw new TypeError(
        "SupportObjectGenerator: extension name must be of type String"
      );
    }
    if (_.has(this.#support.extensions, extensionName)) {
      throw new SupportError(
        "SupportObjectGenerator: extension already exists"
      );
    }
    if (!_.isObject(schema)) {
      throw new TypeError(
        "SupportObjectGenerator: schema must be of type Object"
      );
    }
    if (!_.isObject(evaluation)) {
      throw new TypeError(
        "SupportObjectGenerator: evaluation must be of type Object"
      );
    }
    if (
      _.isUndefined(evaluation.evaluation) ||
      !_.isFunction(evaluation.evaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: evaluation key in evaluation parameter must be set and of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.preEvaluation) &&
      !_.isFunction(evaluation.preEvaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: preEvaluation key in evaluation parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(evaluation.postEvaluation) &&
      !_.isFunction(evaluation.postEvaluation)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: postEvaluation key in evaluation parameter must be of type Function"
      );
    }
    if (!_.isObject(process)) {
      throw new TypeError(
        "SupportObjectGenerator: process must be of type Object"
      );
    }
    if (
      _.isUndefined(process.realMode) &&
      _.isUndefined(process.simulationMode)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: at least one, realMode or simulationMode, must be set in process"
      );
    }
    if (!_.isUndefined(process.realMode) && !_.isFunction(process.realMode)) {
      throw new TypeError(
        "SupportObjectGenerator: realMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.simulationMode) &&
      !_.isFunction(process.simulationMode)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: simulationMode key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.preProcess) &&
      !_.isFunction(process.preProcess)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: preProcess key in process parameter must be of type Function"
      );
    }
    if (
      !_.isUndefined(process.postProcess) &&
      !_.isFunction(process.postProcess)
    ) {
      throw new TypeError(
        "SupportObjectGenerator: postProcess key in process parameter must be of type Function"
      );
    }

    this.#support.extensions[extensionName] = {
      extensionName,
      schema,
      evaluation,
      process,
      type,
    };
  }

  /**
   * Add a destroySubject extension that is supported by the DCA
   * @param {String} extensionName
   * @param {Object} schema
   * @param {Object} evaluation
   * @param {Function} evaluation.evaluation
   * @param {Function} evaluation.preEvaluation
   * @param {Function} evaluation.postEvaluation
   * @param {Object} defaultSubjectDelete
   * @param {Function} defaultSubjectDelete.defaultDelete
   * @param {Function} defaultSubjectDelete.defaultDeleteSimulation
   */
  addDestroySubjectExtension(extensionName, schema, evaluation, process) {
    this.#addEvalAndProcessExtension(
      extensionName,
      schema,
      evaluation,
      process,
      "destroySubject"
    );
  }

  /**
   * Add a destroyContact extension that is supported by the DCA
   * @param {String} extensionName
   * @param {Object} schema
   * @param {Function} evaluation
   * @throws {TypeError} throws if parameter type is wrong
   * @throws {SupportError} throws if extension already exists
   */
  addDestroyContactExtension(extensionName, schema, evaluation) {
    this.#addEvalOnlyExtension(
      extensionName,
      schema,
      evaluation,
      "destroyContact"
    );
  }

  /**
   * Add an destroyCondition extension that is supported by the DCA
   * @param {String} extensionName
   * @param {Object} schema
   * @param {Function} evaluation
   * @throws {TypeError} throws if parameter type is wrong
   */
  addDestroyConditionExtension(extensionName, schema, evaluation) {
    this.#addEvalOnlyExtension(
      extensionName,
      schema,
      evaluation,
      "destroyCondition"
    );
  }

  /**
   * Add an destroyAction extension that is supported by the DCA
   * @param {String} extensionName
   * @param {Object} schema
   * @param {Function} evaluation
   * @throws {TypeError} throws if parameter type is wrong
   */
  addDestroyActionExtension(extensionName, schema, evaluation, process) {
    this.#addEvalAndProcessExtension(
      extensionName,
      schema,
      evaluation,
      process,
      "destroyAction"
    );
  }

  /**
   * Removes support for an extension
   * @param {String} extensionName
   * @throws {TypeError} throws if parameter type is wrong
   */
  removeExtension(extensionName) {
    if (!_.isString(extensionName)) {
      throw new TypeError(
        "SupportObjectGenerator: extensionName parameter must be of type String"
      );
    }
    delete this.#support.extensions[extensionName];
  }

  /**
   * Add a single reason or a list of reasons that are supported by the DCA
   * @param {String|Array.<String>} reason
   * @throws {TypeError} throws if parameter type is wrong
   */
  addSupportedDestroyReason(reason) {
    if (!_.isString(reason) && !_.isArray(reason)) {
      throw new TypeError(
        "SupportObjectGenerator: reason must be of type String or Array"
      );
    }
    if (_.isString(reason)) {
      this.#support.destroyReasons = [
        ...new Set([...this.#support.destroyReasons, reason]),
      ];
    }
    if (_.isArray(reason) && !reason.every((r) => _.isString(r))) {
      throw new TypeError(
        "SupportObjectGenerator: all reasons in Array must be of type String"
      );
    }
    if (_.isArray(reason) && reason.every((r) => _.isString(r))) {
      this.#support.destroyReasons = [
        ...new Set([...this.#support.destroyReasons, ...reason]),
      ];
    }
  }

  /**
   * Removes support for a reason
   * @param {String} reason
   * @throws {TypeError} throws if parameter type is wrong
   */
  removeSupportedDestroyReason(reason) {
    if (!_.isString(reason)) {
      throw new TypeError(
        "SupportObjectGenerator: reason parameter must be of type String"
      );
    }
    this.#support.destroyReasons = this.#support.destroyReasons.filter(
      (ext) => ext !== reason
    );
  }

  /**
   * Adds a supported destroy claim model version
   * @param {String} version
   * @throws {TypeError} throws if parameter type is wrong
   */
  addSupportedVersion(version) {
    if (!_.isString(version)) {
      throw new TypeError(
        "SupportObjectGenerator: version parameter must be of type String."
      );
    }
    this.#support.modelVersion = [
      ...new Set([...this.#support.modelVersion, version]),
    ];
  }

  /**
   * Removes support for a version
   * @param {String} version
   * @throws {TypeError} throws if parameter type is wrong
   */
  removeSupportedVersion(version) {
    if (!_.isString(version)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter version must be of type String."
      );
    }
    this.#support.modelVersion = this.#support.modelVersion.filter(
      (ext) => ext !== version
    );
  }

  /**
   * Set if normal mode is supported by DCA
   * @param {Booelan} [supported=true]
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportNormalMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.normalMode = supported;
  }

  /**
   * Set if strict mode is supported by DCA
   * @param {Boolean} [supported=true]
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportStrictMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.strictMode = supported;
  }

  /**
   * Set if real mode is supported by DCA
   * @param {Boolean} [supported=true]
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportRealMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.realMode = supported;
  }

  /**
   * Set if simulation mode is supported by DCA
   * @param {Boolean} [supported=true]
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportSimulationMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.simulationMode = supported;
  }

  /**
   * Set if automated mode is supported by DCA
   * @param {Boolean} [supported=true]
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportAutomatedMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.automatedMode = supported;
  }

  /**
   * Set if manual mode is supported by DCA
   * @param {Boolean} supported
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportManualMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.manualMode = supported;
  }

  /**
   * Set if silent mode is supported by DCA
   * @param {Boolean} supported
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportSilentMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.silentMode = supported;
  }

  /**
   * Set if notification mode is supported by DCA
   * @param {Boolean} supported
   * @throws {TypeError} throws if parameter type is wrong
   */
  supportNotificationMode(supported = true) {
    if (!_.isBoolean(supported)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter supported must be of type Boolean."
      );
    }
    this.#support.notificationMode = supported;
  }

  /**
   * Set pre evaluation hook that is executed before the evaluations
   * @param {Function} hook
   * @throws {TypeError} throws if hook is undefined or not a function
   */
  addPreAllEvaluationHook(hook) {
    if (_.isUndefined(hook) || !_.isFunction(hook)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter hook must be of type Function."
      );
    }
    this.#support.preAllEvaluationHook = hook;
  }

  /**
   * Remove pre evaluation hook
   */
  removePreAllEvaluationHook() {
    this.#support.preAllEvaluationHook = () => {};
  }

  /**
   * Set post evaluation hook that is executed before the evaluations
   * @param {Function} hook
   * @throws {TypeError} throws if hook is undefined or not a function
   */
  addPostAllEvaluationHook(hook) {
    if (_.isUndefined(hook) || !_.isFunction(hook)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter hook must be of type Function."
      );
    }
    this.#support.postAllEvaluationHook = hook;
  }

  /**
   * Remove post evaluation hook
   */
  removePostAllEvaluationHook() {
    this.#support.postAllEvaluationHook = () => {};
  }

  /**
   * Set pre execute hook that is executed before the evaluations
   * @param {Function} hook
   * @throws {TypeError} throws if hook is undefined or not a function
   */
  addPreAllExecuteHook(hook) {
    if (_.isUndefined(hook) || !_.isFunction(hook)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter hook must be of type Function."
      );
    }
    this.#support.preAllExecuteHook = hook;
  }

  /**
   * Remove pre execute hook
   */
  removePreAllExecuteHook() {
    this.#support.preAllExecuteHook = () => {};
  }

  /**
   * Set post execute hook that is executed before the evaluations
   * @param {Function} hook
   * @throws {TypeError} throws if hook is undefined or not a function
   */
  addPostAllExecuteHook(hook) {
    if (_.isUndefined(hook) || !_.isFunction(hook)) {
      throw new TypeError(
        "SupportObjectGenerator: parameter hook must be of type Function."
      );
    }
    this.#support.postAllExecuteHook = hook;
  }

  /**
   * Remove post execute hook
   */
  removePostAllExecuteHook() {
    this.#support.postAllExecuteHook = () => {};
  }

  /**
   * Returns the support object that is used by the destroyclaim library
   * @returns {Object} retuns the support object
   * @throws {SupportError} throws an error, if not all needed details were provided
   */
  getSupportObject() {
    if (!this.#support.normalMode && !this.#support.strictMode) {
      throw new SupportError(
        "SupportObjectGenerator: DCA needs to support at least one (normal or strict) mode."
      );
    }
    if (!this.#support.realMode && !this.#support.simulationMode) {
      throw new SupportError(
        "SupportObjectGenerator: you need to support at least one (real or simulation) mode."
      );
    }
    if (!this.#support.manualMode && !this.#support.automatedMode) {
      throw new SupportError(
        "SupportObjectGenerator: you need to support at least one (manual or automated) mode."
      );
    }
    if (!this.#support.notificationMode && !this.#support.silentMode) {
      throw new SupportError(
        "SupportObjectGenerator: you need to support at least one (notification or silent) mode."
      );
    }

    if (
      !Object.entries(this.#support.extensions).some(
        (e) => e[1].type === "destroySubject"
      )
    ) {
      throw new SupportError(
        "SupportObjectGenerator: DCA must at least support one destroySubject extension."
      );
    }
    if (this.#support.strictMode && this.#support.modelVersion.length === 0) {
      throw new SupportError(
        "SupportObjectGenerator: in strict mode the DCA needs to support at least one version of the destroy claim model."
      );
    }
    return this.#support;
  }
}

module.exports = SupportObjectGenerator;
