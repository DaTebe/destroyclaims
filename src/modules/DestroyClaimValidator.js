/* eslint-disable class-methods-use-this */
const findCycles = require("deadlock-detector");
const { validateCore } = require("../util/validateDestroyClaimSchema");
const {
  SupportError,
  DestroyReasonSupportError,
  ConditionsValidationError,
  ReferenceMissingError,
  ExtensionNotSupportedError,
  DeadlockDetectionError,
} = require("../util/errors");
const {
  isStrictMode,
  isSimulationMode,
  buildReferencesList,
  dcBuildQuickLookupStructure,
  getReferencesOfConditionsField,
} = require("../util/dcTools");

class DestroyClaimValidator {
  /**
   * @param {Object} destroyclaim JSON representation
   * @param {Object} support support object that is used to validate the destroy claim
   */
  constructor(destroyclaim, support) {
    this.destroyclaim = destroyclaim;
    this.support = support;
    this.errors = [];
    this.checkFunctions = [
      validateCore,
      this.#checkNormalStrictModeSupport,
      this.#checkRealSimulationSupport,
      this.#checkVersionSupport,
      this.#checkDestroyReasonSupport,
      this.#checkManualAutomatedSupport,
      this.#checkNotificationSilentSupport,
      this.#checkReferencesDestroySubject,
      this.#checkReferencesDestroyContacts,
      this.#checkConditions,
      this.#checkReferencesConditions,
      this.#checkExtensionSupport,
      this.#checkConditionsDeadlock,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const func of this.checkFunctions) {
      try {
        func.bind(this)(this.destroyclaim);
      } catch (e) {
        this.errors.push(e);
      }
    }
  }

  /**
   * Checks if mode (normal/strict) is supported by the DCA
   * @param {Object} destroyclaim
   * @throws {SupportError} throws if mode of destroy claim is not supported by DCA
   */
  #checkNormalStrictModeSupport(destroyclaim) {
    if (isStrictMode(destroyclaim) && !this.support.strictMode) {
      throw new SupportError(`strict mode is not supported by DCA`);
    }
    if (!isStrictMode(destroyclaim) && !this.support.normalMode) {
      throw new SupportError(`normal mode is not supported by DCA`);
    }
  }

  #checkRealSimulationSupport(destroyclaim) {
    if (!isSimulationMode(destroyclaim) && !this.support.realMode) {
      throw new SupportError(
        `DestroyClaimValidator: real mode is not supported by DCA`
      );
    }
    if (isSimulationMode(destroyclaim) && !this.support.simulationMode) {
      throw new SupportError(
        `DestroyClaimValidator: simulation mode is not supported by DCA`
      );
    }
  }

  /**
   * Checks, if the destroy claim model version is supported.
   * @param {object} destroyclaim
   * @throws {SupportError} Will throw an error in strict mode if destroy claim version is not set or supported
   */
  #checkVersionSupport(destroyclaim) {
    if (isStrictMode(destroyclaim)) {
      if (!("modelVersion" in destroyclaim)) {
        throw new SupportError(
          `destroy claim needs a model version in strict mode`
        );
      }
      if (!this.support.modelVersion.includes(destroyclaim.modelVersion)) {
        throw new SupportError(
          `destroy claim version ${destroyclaim.modelVersion} is not supported by DCA`
        );
      }
    }
  }

  /**
   * Checks, if the given destroy reasons are supported.
   * Only needs to check this in strict mode.
   * @param {object} destroyclaim
   * @throws {DestroyReasonSupportError} Will throw an error in strict mode if destro reason is unsupported
   */
  #checkDestroyReasonSupport(destroyclaim) {
    if (isStrictMode(destroyclaim)) {
      const unsupported = (
        "destroyReasons" in destroyclaim ? destroyclaim.destroyReasons : []
      ).filter((r) => !this.support.destroyReasons.includes(r));

      if (unsupported.length) {
        throw new DestroyReasonSupportError(
          `there are unsupported reasons in destroyReasons`,
          unsupported
        );
      }
    }
  }

  /**
   * Checks, if the automated mode provided in the destroy claim is supported.
   * @param {Object} destroyclaim
   * @throws {SupportError} throws if mode is not supported
   */
  #checkManualAutomatedSupport(destroyclaim) {
    if (destroyclaim.manualMode && !this.support.manualMode) {
      throw new SupportError(
        `DestroyClaimValidator: manual mode not supported`
      );
    }
    if (!destroyclaim.manualMode && !this.support.automatedMode) {
      throw new SupportError(
        `DestroyClaimValidator: automated mode not supported`
      );
    }
  }

  /**
   * Checks, if the silent mode provided in the destroy claim is supported.
   * @param {Object} destroyclaim
   * @throws {SupportError} throws when mode is not supported by DCA
   */
  #checkNotificationSilentSupport(destroyclaim) {
    if (destroyclaim.notificationMode && !this.support.notificationMode) {
      throw new SupportError(
        `DestroyClaimValidator: notification mode not supported`
      );
    }
    if (!destroyclaim.notificationMode && !this.support.silentMode) {
      throw new SupportError(
        `DestroyClaimValidator: silent mode not supported`
      );
    }
  }

  /**
   * Checks, if all ids in the action fields are part of the destroy claim
   * @param {Object} destroyclaim
   * @throws {ReferenceMissingError} throws when an id in action is not part of the destroy claim
   */
  #checkReferencesDestroySubject(destroyclaim) {
    if (isStrictMode(destroyclaim)) {
      const idsList = buildReferencesList(destroyclaim, "destroyActions");
      const missing = destroyclaim.destroySubjects.filter(
        (subject) =>
          !idsList.includes("action" in subject ? subject.action : "undefined")
      );

      if (missing.length) {
        throw new ReferenceMissingError(
          `id in destroySubjects action field does not exist in destroyActions`,
          missing.map((m) => m.action)
        );
      }
    }
  }

  /**
   * Check, if references in destroyContacts do not exist.
   * Only to check in strict mode
   * @param {*} destroyContacts
   * @param {*} idsList
   */
  #checkReferencesDestroyContacts(destroyclaim) {
    if (isStrictMode(destroyclaim)) {
      const idsList = buildReferencesList(destroyclaim);
      const contactsWithRefs = (
        "destroyContacts" in destroyclaim ? destroyclaim.destroyContacts : []
      ).filter((contacts) => "refs" in contacts);
      const allContactsRefs = contactsWithRefs
        .map((contact) => contact.refs)
        .flat();

      const missing = allContactsRefs.filter((ref) => !idsList.includes(ref));
      if (missing.length) {
        throw new ReferenceMissingError(
          `id reference in destroyContacts does not exist`,
          missing
        );
      }
    }
  }

  #checkConditions(destroyclaim) {
    const lookup = dcBuildQuickLookupStructure(destroyclaim);
    const conditionValidationErrors = [];

    // check if conditions contains own extensions id
    lookup.forEach((ext) => {
      if (
        "conditions" in ext &&
        getReferencesOfConditionsField(ext.conditions).includes(ext.id)
      ) {
        conditionValidationErrors.push(ext);
      }
    });

    if (
      "conditions" in destroyclaim &&
      getReferencesOfConditionsField(destroyclaim.conditions).includes(
        destroyclaim.id
      )
    ) {
      conditionValidationErrors.push(destroyclaim);
    }

    if (conditionValidationErrors.length > 0) {
      throw new ConditionsValidationError(
        `unallowed self references in condition field`,
        conditionValidationErrors
      );
    }
  }

  #checkReferencesConditions(destroyclaim) {
    const lookup = dcBuildQuickLookupStructure(destroyclaim);
    const idsList = buildReferencesList(destroyclaim);
    const missing = [];

    lookup.forEach((ext) => {
      if ("conditions" in ext) {
        missing.push(
          ...getReferencesOfConditionsField(ext.conditions).filter(
            (id) => !idsList.includes(id)
          )
        );
      }
    });

    if ("conditions" in destroyclaim) {
      missing.push(
        ...getReferencesOfConditionsField(destroyclaim.conditions).filter(
          (id) => !idsList.includes(id)
        )
      );
    }

    if (missing.length > 0) {
      throw new ReferenceMissingError(
        `some condition has non existing references`,
        missing
      );
    }
  }

  /**
   * Checks, if there are any unsupported extensions in the destroy claim
   * This must only be checked in strict mode.
   * @param {Object} destroyclaim
   * @throws {ExtensionNotSupportedError} throws when extension is not supported
   */
  #checkExtensionSupport(destroyclaim) {
    if (isStrictMode(destroyclaim)) {
      const unsupported = dcBuildQuickLookupStructure(destroyclaim).filter(
        (e) => !(e.name in this.support.extensions)
      );
      if (unsupported.length) {
        throw new ExtensionNotSupportedError(
          `not all extensions are supported`,
          unsupported.map((u) => u.name)
        );
      }
    }
  }

  /**
   * Performes a deadlock detection by looking for cycles in the conditions fields.
   * @param {Object} destroyclaim
   * @throws {DeadlockDetectionError} throws if a deadlock is detected
   */
  #checkConditionsDeadlock(destroyclaim) {
    const conditionsClean = {};

    dcBuildQuickLookupStructure(destroyclaim).forEach((ext) => {
      conditionsClean[ext.id] = [
        ...new Set(
          getReferencesOfConditionsField(ext.conditions || {}).filter(
            (id) => id !== ext.id
          )
        ),
      ];
    });

    if ("conditions" in destroyclaim) {
      conditionsClean[destroyclaim.id] = [
        ...new Set(
          getReferencesOfConditionsField(destroyclaim.conditions).filter(
            (id) => id !== destroyclaim.id
          )
        ),
      ];
    }

    const cycles = findCycles(conditionsClean);

    if (cycles.length > 0) {
      throw new DeadlockDetectionError(
        `deadlocks in destroy claim found`,
        cycles
      );
    }
  }

  /**
   * Get the list of validation errors
   * @returns {Array} returns list of errors
   */
  getValidationErrors() {
    return this.errors;
  }

  /**
   * Get the validation result of the Destroy Claim
   * @returns {Boolean} returns if the validation was successful
   */
  validateDestroyClaim() {
    return this.errors.length === 0;
  }
}

module.exports = DestroyClaimValidator;
