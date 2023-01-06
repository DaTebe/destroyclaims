/**
 * Module to be tested
 */

const {
  DeadlockDetectionError,
  DestroyClaimError,
  DestroyClaimValidationError,
  DestroyReasonSupportError,
  ExtensionNotSupportedError,
  ReferenceMissingError,
  SchemaValidationError,
  SupportError,
} = require("../src/util/errors");

test("DeadlockDetectionError thrown", () => {
  expect(() => {
    throw new DeadlockDetectionError("error", [{ error: "detailed error" }]);
  }).toThrow(DeadlockDetectionError);

  let thrownError;

  try {
    throw new DeadlockDetectionError("error", [{ error: "detailed error" }]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.deadlocks).toEqual([{ error: "detailed error" }]);
});

test("DestroyClaimError thrown", () => {
  expect(() => {
    throw new DestroyClaimError("error", [{ error: "detailed error" }]);
  }).toThrow(DestroyClaimError);
});

test("DestroyClaimValidationError thrown", () => {
  expect(() => {
    throw new DestroyClaimValidationError("error", [
      { error: "detailed error" },
    ]);
  }).toThrow(DestroyClaimValidationError);

  let thrownError;

  try {
    throw new DestroyClaimValidationError("error", [
      { error: "detailed error" },
    ]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.errors).toEqual([{ error: "detailed error" }]);
});

test("DestroyReasonSupportError thrown", () => {
  expect(() => {
    throw new DestroyReasonSupportError("error", [{ error: "detailed error" }]);
  }).toThrow(DestroyReasonSupportError);

  let thrownError;

  try {
    throw new DestroyReasonSupportError("error", [{ error: "detailed error" }]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.reasons).toEqual([{ error: "detailed error" }]);
});

test("ExtensionNotSupportedError thrown", () => {
  expect(() => {
    throw new ExtensionNotSupportedError("error", [
      { error: "detailed error" },
    ]);
  }).toThrow(ExtensionNotSupportedError);

  let thrownError;

  try {
    throw new ExtensionNotSupportedError("error", [
      { error: "detailed error" },
    ]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.nonSupportedExtensions).toEqual([
    { error: "detailed error" },
  ]);
});

test("ReferenceMissingError thrown", () => {
  expect(() => {
    throw new ReferenceMissingError("error", [{ error: "detailed error" }]);
  }).toThrow(ReferenceMissingError);

  let thrownError;

  try {
    throw new ReferenceMissingError("error", [{ error: "detailed error" }]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.missingReferences).toEqual([{ error: "detailed error" }]);
});

test("SchemaValidationError thrown", () => {
  expect(() => {
    throw new SchemaValidationError("error", [{ error: "detailed error" }]);
  }).toThrow(SchemaValidationError);

  let thrownError;

  try {
    throw new SchemaValidationError("error", [{ error: "detailed error" }]);
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError.errors).toEqual([{ error: "detailed error" }]);
});

test("SupportError thrown", () => {
  expect(() => {
    throw new SupportError("error", [{ error: "detailed error" }]);
  }).toThrow(SupportError);
});
