/**
 * Module to be tested
 */

const DestroyClaimValidator = require("../src/modules/DestroyClaimValidator");

/**
 * Buildup & Teardown
 */
let support = {};
let destroyclaim = {};
beforeEach(() => {
  support = {
    specVersion: ["1.0.0"],
    extensions: {
      "std:sha256": {},
      "std:agent": {},
      "std:fromPointInTime": {},
      "std:toPointInTime": {},
      "std:inTimeInterval": {},
      "std:alpha3CountryCode": {},
      "std:destructionLevel": {},
    },
    destroyReasons: [
      "security/integrity/malicious-data",
      "compliance/laws/personal-data/gdpr",
    ],
    strictMode: true,
    normalMode: true,
    realMode: true,
    simulationMode: false,
    automatedMode: true,
    optInMode: false,
    silentMode: true,
    notificationMode: false,
  };
  destroyclaim = {
    id: "02faafea-1c31-4771-b90b-2e8380af06dd",
    isActive: true,
    strictMode: false,
    optInMode: false,
    notificationMode: false,
    simulationMode: false,
    specVersion: "1.0.0",
    title: "Delete the old PowerPoint with old CI",
    destroyReasons: ["security/integrity/malicious-data"],
    destroyContacts: [
      {
        id: "05845dd7-e9a2-4285-95da-3dd259ac8aa1",
        name: "std:agent",
        payload: {
          name: "John Doe",
        },
        refs: [
          "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
          "a01ecbab-1e03-4823-87bb-aa0a48e80507",
        ],
      },
      {
        id: "3467e26e-6713-4d6e-a644-e5c11f8ea0d1",
        name: "std:agent",
        payload: {
          name: "Jane Doe",
        },
        refs: ["02faafea-1c31-4771-b90b-2e8380af06dd"],
      },
    ],
    destroySubjects: [
      {
        id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
        name: "std:sha256",
        payload: {
          sha256FileHash:
            "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
        },
        conditions: {
          or: [
            { var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" },
            { var: "c7ccae45-3276-426a-a7f1-6f90630a47a2" },
          ],
        },
        action: "d815f135-8723-407b-9549-aae65dae9ae8",
      },
      {
        id: "a01ecbab-1e03-4823-87bb-aa0a48e80507",
        name: "std:sha256",
        payload: {
          sha256FileHash:
            "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79",
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
        conditions: true,
      },
      {
        id: "c7ccae45-3276-426a-a7f1-6f90630a47a2",
        name: "std:inTimeInterval",
        payload: {
          from: "2022-10-01T00:00:00.000Z",
          to: "2022-10-01T00:00:00.000Z",
        },
        conditions: true,
      },
    ],
    destroyActions: [
      {
        id: "d815f135-8723-407b-9549-aae65dae9ae8",
        name: "std:destructionLevel",
        payload: {
          destructionLevel: "wiped",
        },
        conditions: true,
      },
    ],
    conditions: {
      or: [
        { var: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca" },
        { var: "a01ecbab-1e03-4823-87bb-aa0a48e80507" },
      ],
    },
  };
});

/**
 * Test Validator
 */
test("Validator validates correct destroy claim to true", () => {
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

/**
 * Test Validator: mode checks
 */
test("Normal Mode: Supported normal mode does validate to true", () => {
  destroyclaim.strictMode = false;
  support.supportNormalMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Unsupported normal mode does validate to false", () => {
  destroyclaim.strictMode = false;
  support.normalMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Strict Mode: Supported strict mode does validate to true", () => {
  destroyclaim.strictMode = true;
  support.supportStrictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Unsupported strict mode does validate to false", () => {
  destroyclaim.strictMode = true;
  support.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

/**
 * Test Validator: real/simulation mode checks
 */
test("Normal Mode: Unsupported realMode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.simulationMode = false;
  support.realMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: real mode is not supported by DCA"
  );
});

test("Normal Mode: Unsupported simulation mode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.simulationMode = true;
  support.simulationMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: simulation mode is not supported by DCA"
  );
});

test("Normal Mode: Unsupported real mode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.simulationMode = false;
  support.realMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: real mode is not supported by DCA"
  );
});

test("Strict Mode: Unsupported simulation mode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.simulationMode = true;
  support.simulationMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: simulation mode is not supported by DCA"
  );
});

/**
 * Test Validator: manual/automated mode checks
 */
test("Normal Mode: Unsupported optInMode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.optInMode = true;
  support.optInMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: manual mode not supported"
  );
});

test("Normal Mode: Unsupported automated mode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.optInMode = false;
  support.automatedMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: automated mode not supported"
  );
});

test("Strict Mode: Unsupported optInMode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.optInMode = true;
  support.optInMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: manual mode not supported"
  );
});

test("Strict Mode: Unsupported automated mode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.optInMode = false;
  support.automatedMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: automated mode not supported"
  );
});

/**
 * Test Validator: silent/notification mode checks
 */
test("Normal Mode: Unsupported silent mode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.notificationMode = false;
  support.silentMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: silent mode not supported"
  );
});

test("Normal Mode: Unsupported notification mode throws", () => {
  destroyclaim.strictMode = false;
  destroyclaim.notificationMode = true;
  support.notificationMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: notification mode not supported"
  );
});

test("Strict Mode: Unsupported silent mode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.notificationMode = false;
  support.silentMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: silent mode not supported"
  );
});

test("Strict Mode: Unsupported notification mode throws", () => {
  destroyclaim.strictMode = true;
  destroyclaim.notificationMode = true;
  support.notificationMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
  expect(Validator.getValidationErrors()[0].message).toEqual(
    "DestroyClaimValidator: notification mode not supported"
  );
});

/**
 * Test Validator: version checks
 */
test("Normal Mode: Supported version does validate to true", () => {
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Supported version does validate to true", () => {
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing version does validate to false", () => {
  destroyclaim.strictMode = true;
  delete destroyclaim.specVersion;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Strict Mode: Unsupported version does validate to false", () => {
  destroyclaim.strictMode = true;
  destroyclaim.specVersion = "1.0.1";
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

/**
 * Test Validator: destroyReasons checks
 */

test("Normal Mode: Missing destroyReasons field does validate to true", () => {
  delete destroyclaim.destroyReasons;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing destroyReasons field does validate to true", () => {
  delete destroyclaim.destroyReasons;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Unsupported reasons does validate to true", () => {
  destroyclaim.destroyReasons.push("unsupportedReason");
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Unsupported reasons does validate to false", () => {
  destroyclaim.destroyReasons.push("unsupportedReason");
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Normal Mode: Supported reasons does validate to true", () => {
  destroyclaim.destroyReasons = ["compliance/laws/personal-data/gdpr"];
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Supported reasons does validate to true", () => {
  destroyclaim.destroyReasons = ["compliance/laws/personal-data/gdpr"];
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

/**
 * Test Validator: action field checks
 */

test("Normal Mode: Missing action field does validate to true", () => {
  delete destroyclaim.destroySubjects[0].action;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing action field does validate to false", () => {
  delete destroyclaim.destroySubjects[0].action;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Normal Mode: Existing action field does validate to true", () => {
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Existing action field does validate to true", () => {
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Non existing action field reference validates to true", () => {
  destroyclaim.destroySubjects[0].action =
    "18dc4978-5469-4c6b-8300-3c3571f7d180";
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Non existing action field reference validates to false", () => {
  destroyclaim.destroySubjects[0].action =
    "18dc4978-5469-4c6b-8300-3c3571f7d180";
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

/**
 * Test Validator: refs field checks
 */

test("Normal Mode: Missing refs field does validate to false", () => {
  delete destroyclaim.destroyContacts[0].refs;
  delete destroyclaim.destroyContacts[1].refs;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Strict Mode: Missing refs field does validate to false", () => {
  delete destroyclaim.destroyContacts[0].refs;
  delete destroyclaim.destroyContacts[1].refs;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Normal Mode: Non existing id in refs field does validate to true", () => {
  destroyclaim.destroyContacts[0].refs.push(
    "30d66b95-ffa0-4991-a263-3aaedeec02e0"
  );
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Non existing id in refs field does validate to false", () => {
  destroyclaim.destroyContacts[0].refs.push(
    "30d66b95-ffa0-4991-a263-3aaedeec02e0"
  );
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Normal Mode: No destroyContacts does validate to true", () => {
  delete destroyclaim.destroyContacts;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: No destroyContacts does validate to true", () => {
  delete destroyclaim.destroyContacts;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

/**
 * Test Validator: conditions field checks
 */
test("Normal Mode: Missing conditions field in destroySubjects does validate to true", () => {
  delete destroyclaim.destroySubjects[0].conditions;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing conditions field in destroySubjects does validate to true", () => {
  delete destroyclaim.destroySubjects[0].conditions;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Missing conditions field in destroyConditions does validate to true", () => {
  delete destroyclaim.destroyConditions[0].conditions;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing conditions field in destroyConditions does validate to true", () => {
  delete destroyclaim.destroyConditions[0].conditions;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Missing conditions field in destroyActions does validate to true", () => {
  delete destroyclaim.destroyActions[0].conditions;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing conditions field in destroyActions does validate to true", () => {
  delete destroyclaim.destroyActions[0].conditions;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Missing conditions field in root does validate to true", () => {
  delete destroyclaim.conditions;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Missing conditions field in root does validate to true", () => {
  delete destroyclaim.conditions;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Normal Mode: Non existing id in conditions field does validate to false", () => {
  destroyclaim.conditions.or[0].var = "8a0af8ca-86c2-44ad-8f34-cb54d4df8921";
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Strict Mode: Non existing id in conditions field does validate to false", () => {
  destroyclaim.conditions.or[0].var = "8a0af8ca-86c2-44ad-8f34-cb54d4df8921";
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Normal Mode: Non existing conditions field in destroy claim does validate to true", () => {
  delete destroyclaim.conditions;
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Non existing conditions field in destroy claim does validate to true", () => {
  delete destroyclaim.conditions;
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

/**
 * Test Validator: extensions check
 */

test("Normal Mode: Unsupported extension validates to true", () => {
  destroyclaim.destroySubjects[0].name = "unsupportedExtension";
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(true);
});

test("Strict Mode: Unsupported extension validates to false", () => {
  destroyclaim.destroySubjects[0].name = "unsupportedExtension";
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

// Test Self References in Conditions
test("Self References are detected and validate to false", () => {
  destroyclaim.destroyConditions[0].conditions = {
    and: [{ var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" }],
  };
  destroyclaim.conditions.or.push({
    var: "02faafea-1c31-4771-b90b-2e8380af06dd",
  });
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

/**
 * Test Validator: deadlock check
 */
test("Normal Mode: Deadlock in conditions validates to false", () => {
  destroyclaim.destroyConditions[0].conditions = {
    and: [{ var: "c7ccae45-3276-426a-a7f1-6f90630a47a2" }],
  };
  destroyclaim.destroyConditions[1].conditions = {
    and: [{ var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" }],
  };
  destroyclaim.strictMode = false;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});

test("Strict Mode: Deadlock in conditions validates to false", () => {
  destroyclaim.destroyConditions[0].conditions = {
    and: [{ var: "c7ccae45-3276-426a-a7f1-6f90630a47a2" }],
  };
  destroyclaim.destroyConditions[1].conditions = {
    and: [{ var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" }],
  };
  destroyclaim.strictMode = true;
  const Validator = new DestroyClaimValidator(destroyclaim, support);
  expect(Validator.validateDestroyClaim()).toEqual(false);
});
