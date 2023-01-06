const Extension = require("./Extension");

/**
 *  Destroy Contact Extension Class
 */
class DestroyContactExtension extends Extension {
  #refs;

  /**
   * @param {Object} extension an extension element from a destroy claim (destroySubjects, destroyContacts, destroyConditions, destroyActions)
   * @param {Object} schema the schema of the extension. We can not guarantee, that we could resolve the schema from the schema field. Because of that, the class expects the scheam as second parameter.
   * @param {Function} evaluation function that is injected to evaluate the extension
   */
  constructor(extension, schema, evaluation) {
    super(extension, schema, evaluation);
    this.#refs = "refs" in extension ? extension.refs : [];
  }

  /**
   * get references of a contact
   * @returns {Array.<String>} returns a list of references a destroy contact has
   */
  getRefs() {
    return this.#refs;
  }

  /**
   * Check if destroy contact is responsible
   * @param {String} id id used in the destroy claim
   * @returns {Boolean} returns if this destroy contact is responsible for the id
   */
  isResponsible(id) {
    return this.#refs.includes(id);
  }
}

module.exports = DestroyContactExtension;
