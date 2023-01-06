/* eslint-disable max-classes-per-file */
class SchemaValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "SchemaValidationError";
    this.errors = errors;
  }
}

class DestroyReasonSupportError extends Error {
  constructor(message, reasons) {
    super(message);
    this.name = "DestroyReasonSupportError";
    this.reasons = reasons;
  }
}

class ReferenceMissingError extends Error {
  constructor(message, missingReferences) {
    super(message);
    this.name = "ReferenceMissingError";
    this.missingReferences = missingReferences;
  }
}

class ConditionsValidationError extends Error {
  constructor(message, conditions) {
    super(message);
    this.name = "ConditionsValidationError";
    this.conditions = conditions;
  }
}

class ExtensionNotSupportedError extends Error {
  constructor(message, nonSupportedExtensions) {
    super(message);
    this.name = "ExtensionNotSupportedError";
    this.nonSupportedExtensions = nonSupportedExtensions;
  }
}

class DeadlockDetectionError extends Error {
  constructor(message, deadlocks) {
    super(message);
    this.name = "DeadlockDetectionError";
    this.deadlocks = deadlocks;
  }
}

class DestroyClaimValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "DestroyClaimValidationError";
    this.errors = errors;
  }
}

class SupportError extends Error {
  constructor(message) {
    super(message);
    this.name = "SupportError";
  }
}

class DestroyClaimError extends Error {
  constructor(message) {
    super(message);
    this.name = "DestroyClaimError";
  }
}

module.exports = {
  SchemaValidationError,
  ConditionsValidationError,
  DestroyReasonSupportError,
  ReferenceMissingError,
  ExtensionNotSupportedError,
  DeadlockDetectionError,
  DestroyClaimValidationError,
  SupportError,
  DestroyClaimError,
};
