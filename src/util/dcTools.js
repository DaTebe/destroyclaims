const flatten = require("flat");
const jsonLogic = require("json-logic-js");

// eslint-disable-next-line no-bitwise
const xor = (a, b) => a ^ b;
jsonLogic.add_operation("xor", xor);

/**
 * Checks, if the destroy claim is to be interpreted in strict mode
 * @param {Object} destroyclaim
 * @returns {Boolean} if strict mode is on (true) or off (false)
 */
const isStrictMode = (destroyclaim) =>
  "strictMode" in destroyclaim && destroyclaim.strictMode;

/**
 * Checks, if the destroy claim is to be run as simulation
 * @param {Object} destroyclaim
 * @returns {Boolean} if simulation is on (true) or off (false)
 */
const isSimulationMode = (destroyclaim) =>
  "simulationMode" in destroyclaim && destroyclaim.simulationMode;

/**
 * Checks, if the destroy claim is to be run manually
 * @param {Object} destroyclaim
 * @returns {Boolean} if simulation is on (true) or off (false)
 */
const isOptInMode = (destroyclaim) =>
  "optInMode" in destroyclaim && destroyclaim.optInMode;

/**
 * Checks, if a user is to be notified on deletion
 * @param {Object} destroyclaim
 * @returns {Boolean} if simulation is on (true) or off (false)
 */
const isNotificationMode = (destroyclaim) =>
  "notificationMode" in destroyclaim && destroyclaim.notificationMode;

/**
 * Checks, if a destroy claim is expired acoding to the expires field.
 * @param {Object} destroyclaim
 * @returns {Boolean} returns true if not expired and false when expired
 */
const isExpired = (destroyclaim) =>
  "expires" in destroyclaim && destroyclaim.expires < new Date().toISOString();

/**
 * Will build a structure of extensions for better lookup.
 * @param {Object} destroyclaim
 * @returns {Array}
 */
const dcBuildQuickLookupStructure = (destroyclaim) => [
  ...(destroyclaim.destroySubjects || []),
  ...(destroyclaim.destroyContacts || []),
  ...(destroyclaim.destroyConditions || []),
  ...(destroyclaim.destroyActions || []),
];

/**
 * Returns a list of all extension ids and the destroy claim id.
 * @param {Object} destroyclaim
 * @typedef FieldSelector
 * @property {string} all "all"
 * @property {string} destroySubjects "destroySubjects"
 * @property {string} destroyContacts "destroyContacts"
 * @property {string} destroyActions "destroyActions"
 * @property {string} destroyConditions "destroyConditions"
 * @param {FieldSelector} field select which reference list you want to build
 * @returns {Array} List of extension ids of destroy claim
 */
const buildReferencesList = (destroyclaim, field = "all") => {
  const ids = [];
  if (field === "all") {
    ids.push(...dcBuildQuickLookupStructure(destroyclaim).map((ext) => ext.id));
    ids.push(destroyclaim.id);
  }
  if (field === "destroySubjects" && "destroySubjects" in destroyclaim) {
    ids.push(...destroyclaim.destroySubjects.map((ext) => ext.id));
  }
  if (field === "destroyContacts" && "destroyContacts" in destroyclaim) {
    ids.push(...destroyclaim.destroyContacts.map((ext) => ext.id));
  }
  if (field === "destroyActions" && "destroyActions" in destroyclaim) {
    ids.push(...destroyclaim.destroyActions.map((ext) => ext.id));
  }
  if (field === "destroyConditions" && "destroyConditions" in destroyclaim) {
    ids.push(...destroyclaim.destroyConditions.map((ext) => ext.id));
  }

  return ids;
};

/**
 * Returns a list of the ids used in a conditions field
 * @param {Object} conditions JSONLogic Object
 * @returns {Array} List of ids in conditions field
 */
const getReferencesOfConditionsField = (conditions) => {
  const refs = [];
  const flatConditions = flatten(conditions);

  // eslint-disable-next-line no-restricted-syntax
  for (const [key] of Object.entries(flatConditions)) {
    if (key.split(".").pop() === "var") {
      refs.push(flatConditions[key]);
    }
  }

  return refs;
};

/**
 * Evaluates JSONLogic with a given data object.
 * @param {Object|Boolean} conditions conditions field from a destroy claim
 * @param {Object} data evaluation data
 * @returns {Boolean|null} returns the evaluation of the statement. If data contains null, evaluation may return null. This should be prevented, as there are a couple of checks before that prevent this behaviour.
 */
const evaluateConditionsField = (conditions, data) =>
  jsonLogic.apply(conditions, data);

/**
 * Deep freeze an object
 * @param {Object} object object to be deep frozen
 * @returns {Object} that is deep frozen
 */
const deepFreeze = (object) => {
  const propNames = Object.getOwnPropertyNames(object);
  // eslint-disable-next-line no-restricted-syntax
  for (const name of propNames) {
    const value = object[name];
    // eslint-disable-next-line no-param-reassign
    object[name] =
      value && typeof value === "object" ? deepFreeze(value) : value;
  }
  return Object.freeze(object);
};

module.exports = {
  xor,
  isStrictMode,
  isSimulationMode,
  isOptInMode,
  isNotificationMode,
  isExpired,
  buildReferencesList,
  dcBuildQuickLookupStructure,
  getReferencesOfConditionsField,
  evaluateConditionsField,
  deepFreeze,
};
