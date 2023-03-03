/* eslint-disable no-undef */
/**
 * Module to be tested
 */
const {
  validateCore,
  validateExtension,
} = require("../src/util/validateDestroyClaimSchema");

/**
 * Mock Data
 */
const extensionSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "sha256FileHash",
  title: "SHA 256 File Hash",
  description: "This extension models a sha256 hash of a file content.",
  $comment:
    "The Interpreter must be able to compare the hash with hashes of files and to delete that files.",
  type: "object",
  unevaluatedProperties: false,
  properties: {
    hash: {
      title: "SHA 256 File Hash",
      description: "A SHA 256 hash",
      type: "string",
      pattern: "^[A-Fa-f0-9]{64}$",
      examples: [
        "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b",
      ],
    },
  },
};

const extensionPayload = {
  hash: "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b",
};

const nonValidExtensionPayload = {
  hash: "8d5d33cf09179416021ebf0c95d284557ebde921b46d5a1b",
};

let exampleDestroyClaim = {};

/**
 * Setup, Teardown
 */
beforeEach(() => {
  exampleDestroyClaim = {
    specVersion: "1.0.0",
    id: "02faafea-1c31-4771-b90b-2e8380af06dd",
    isActive: false,
    strictMode: false,
    optInMode: false,
    notificationMode: false,
    simulationMode: false,
    title: "Delete the old PowerPoint with old CI",
    destroyContacts: [
      {
        id: "0aef0f41-41f1-4cd3-8c1f-d974e64779f8",
        name: "std:agent",
        payload: {
          name: "Max Mustermann",
        },
        refs: ["02faafea-1c31-4771-b90b-2e8380af06dd"],
      },
    ],
    destroyReasons: [
      "timeliness",
      "https://example/destroyclaim/reasons/compliance/laws/gdpr",
    ],
    destroySubjects: [
      {
        id: "7d58d622-a6b2-49f9-91ef-1ea79f96edb1",
        name: "std:sha256",
        payload: {
          hash: "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b",
        },
        conditions: {
          or: [
            { var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" },
            { var: "c7ccae45-3276-426a-a7f1-6f90630a47a2" },
          ],
        },
        action: "d815f135-8723-407b-9549-aae65dae9ae8",
      },
    ],
    destroyConditions: [
      {
        id: "35f33c3d-50e2-4b33-bd23-2230d5445fc2",
        name: "std:inTimeInterval",
        payload: {
          from: "2022-10-01T00:00:00.000Z",
          to: "2024-10-01T00:00:00.000Z",
        },
      },
      {
        id: "c7ccae45-3276-426a-a7f1-6f90630a47a2",
        name: "std:inTimeInterval",
        payload: {
          from: "2022-10-01T00:00:00.000Z",
          to: "2022-10-01T00:00:00.000Z",
        },
      },
    ],
    destroyActions: [
      {
        id: "d815f135-8723-407b-9549-aae65dae9ae8",
        name: "std:destructionLevel",
        payload: {
          destructionLevel: "wiped",
        },
      },
    ],
    signature:
      "eyJpZCI6ImRlc3Ryb3ljbGFpbTp1dWlkOjAyZmFhZmVhLTFjMzEtNDc3MS1iOTBiLTJlODM4MGFmMDZkZCIsInRpdGxlIjoiRGVsZXRlIHRoZSBvbGQgUG93ZXJQb2ludCB3aXRoIG9sZCBDSSIsIndoYXQiOlt7IsKnZXh0ZW5zaW9uIjoic2hhMjU2RmlsZUNvbnRlbnQiLCLCp3BheWxvYWQiOnsiaGFzaCI6IjhkNWQzM2NmMDkxNzk0MTYwMmVlY2YxNmIzNGEwYWIwN2QxZWJmMGM5NWQyODQ1NTdlYmRlOTIxYjQ2ZDVhMWIifX1dfQ",
    conditions: {},
  };
});

/**
 * Test Core Schema
 */
test("Core Schema Validation: Correct Destroy Claim is validated true", () => {
  expect(() => validateCore(exampleDestroyClaim)).not.toThrow();
});
test("Core Schema Validation: Additional field is validated true", () => {
  exampleDestroyClaim.unevaluatedProperty = "test";
  expect(() => validateCore(exampleDestroyClaim)).not.toThrow();
});
test("Core Schema Validation: Missing id is validated false", () => {
  delete exampleDestroyClaim.id;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Core Schema Validation: Missing isActive is validated false", () => {
  delete exampleDestroyClaim.isActive;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Core Schema Validation: Missing destroySubjects is validated false", () => {
  delete exampleDestroyClaim.destroySubjects;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Core Schema Validation: destroyReasons wrong data type is validated false", () => {
  exampleDestroyClaim.destroyReasons.push(1);
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});

/**
 * Test Core Schema Strict Mode
 */
test("Core Schema Validation (Strict Mode): Destrtoy Claim is validated true", () => {
  exampleDestroyClaim.strictMode = true;
  expect(() => validateCore(exampleDestroyClaim)).not.toThrow();
});

test("Core Schema Validation (Strict Mode): Additional field is validated false", () => {
  exampleDestroyClaim.strictMode = true;
  exampleDestroyClaim.unevaluatedProperty = "test";
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});

/**
 * Test Extension Schema
 */
test("Extension Schema Validation: Missing extension id is validated false", () => {
  delete exampleDestroyClaim.destroySubjects[0].id;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Extension Schema Validation: Missing extension name is validated false", () => {
  delete exampleDestroyClaim.destroySubjects[0].name;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Extension Schema Validation: Missing §payload is validated false", () => {
  delete exampleDestroyClaim.destroySubjects[0].payload;
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Extension Schema Validation: Additional field in extension throws", () => {
  exampleDestroyClaim.destroySubjects[0]["§unevaluatedProperty"] = "test";
  expect(() => validateCore(exampleDestroyClaim)).toThrow();
});
test("Extension Payload Schema Validation: Valid schema and valid payload does not throw", () => {
  expect(() =>
    validateExtension(extensionPayload, extensionSchema)
  ).not.toThrow();
});
test("Extension Payload Schema Validation: Valid schema and non valid payload throws", () => {
  expect(() =>
    validateExtension(nonValidExtensionPayload, extensionSchema)
  ).toThrow();
});
