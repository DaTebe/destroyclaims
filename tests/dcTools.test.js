/**
 * Module to be tested
 */
const {
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
} = require("../src/util/dcTools");

/**
 * Buildup & Teardown Test Data
 */
let destroyClaim = {};
beforeEach(() => {
  destroyClaim = {
    id: "02faafea-1c31-4771-b90b-2e8380af06dd",
    isActive: true,
    strictMode: false,
    expires: "2100-01-01T00:00:00.000Z",
    destroyClaim: "1.0.0",
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
            {
              and: [
                { var: "706927b9-7a3c-4271-96f7-1eb43b711e1e" },
                { var: "6ca7d3d6-a110-4edb-aa4d-54da26c61c5e" },
              ],
            },
            { var: "30489ad5-9daf-465c-91f8-e865b53b1c9ev" },
          ],
        },
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
    conditions: {
      or: [
        { var: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca" },
        { var: "a01ecbab-1e03-4823-87bb-aa0a48e80507" },
      ],
    },
  };
});

/**
 * Test xor
 */
test("XOR returns correct value", () => {
  delete destroyClaim.strictMode;
  expect(xor(false, false)).toEqual(0);
  expect(xor(true, false)).toEqual(1);
  expect(xor(false, true)).toEqual(1);
  expect(xor(true, true)).toEqual(0);
});

/**
 * Test strict mode
 */
test("Missing strictMode field returns false", () => {
  delete destroyClaim.strictMode;
  expect(isStrictMode(destroyClaim)).toEqual(false);
});

test("strictMode field set to false returns false", () => {
  destroyClaim.strictMode = false;
  expect(isStrictMode(destroyClaim)).toEqual(false);
});

test("strictMode field set to true returns true", () => {
  destroyClaim.strictMode = true;
  expect(isStrictMode(destroyClaim)).toEqual(true);
});

/**
 * Test simulation mode
 */
test("Missing simulationMode field returns false", () => {
  delete destroyClaim.simulationMode;
  expect(isSimulationMode(destroyClaim)).toEqual(false);
});

test("simulationMode field set to false returns false", () => {
  destroyClaim.simulationMode = false;
  expect(isSimulationMode(destroyClaim)).toEqual(false);
});

test("simulationMode field set to true returns true", () => {
  destroyClaim.simulationMode = true;
  expect(isSimulationMode(destroyClaim)).toEqual(true);
});

/**
 * Test manual mode
 */
test("Missing optInMode field returns false", () => {
  delete destroyClaim.optInMode;
  expect(isOptInMode(destroyClaim)).toEqual(false);
});

test("optInMode field set to false returns false", () => {
  destroyClaim.optInMode = false;
  expect(isOptInMode(destroyClaim)).toEqual(false);
});

test("optInMode field set to true returns true", () => {
  destroyClaim.optInMode = true;
  expect(isOptInMode(destroyClaim)).toEqual(true);
});

/**
 * Test notification mode
 */
test("Missing notificationMode field returns false", () => {
  delete destroyClaim.notificationMode;
  expect(isNotificationMode(destroyClaim)).toEqual(false);
});

test("notificationMode field set to false returns false", () => {
  destroyClaim.notificationMode = false;
  expect(isNotificationMode(destroyClaim)).toEqual(false);
});

test("notificationMode field set to true returns true", () => {
  destroyClaim.notificationMode = true;
  expect(isNotificationMode(destroyClaim)).toEqual(true);
});

/**
 * Test expiration date
 */
test("Normal Mode: Missing expires field validates to false", () => {
  delete destroyClaim.expires;
  destroyClaim.strictMode = false;
  expect(isExpired(destroyClaim)).toEqual(false);
});

test("Strict Mode: Missing expires field validates to false", () => {
  delete destroyClaim.expires;
  destroyClaim.strictMode = true;
  expect(isExpired(destroyClaim)).toEqual(false);
});

test("Normal Mode: Past expires field validates to true", () => {
  destroyClaim.expires = "2010-01-01T00:00:00.000Z";
  destroyClaim.strictMode = false;
  expect(isExpired(destroyClaim)).toEqual(true);
});

test("Strict Mode: Missing expires field validates to true", () => {
  destroyClaim.expires = "2010-01-01T00:00:00.000Z";
  destroyClaim.strictMode = true;
  expect(isExpired(destroyClaim)).toEqual(true);
});

test("Normal Mode: Future expires field validates to false", () => {
  destroyClaim.expires = "2100-01-01T00:00:00.000Z";
  destroyClaim.strictMode = false;
  expect(isExpired(destroyClaim)).toEqual(false);
});

test("Strict Mode: Future expires field validates to false", () => {
  destroyClaim.expires = "2100-01-01T00:00:00.000Z";
  destroyClaim.strictMode = true;
  expect(isExpired(destroyClaim)).toEqual(false);
});

/**
 * Test buildReferencesList
 */
test("List of all Ids (References) is build correct", () => {
  const refList = [
    "02faafea-1c31-4771-b90b-2e8380af06dd",
    "05845dd7-e9a2-4285-95da-3dd259ac8aa1",
    "3467e26e-6713-4d6e-a644-e5c11f8ea0d1",
    "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
    "a01ecbab-1e03-4823-87bb-aa0a48e80507",
    "35f33c3d-50e2-4b33-bd23-2230d5445fc2",
    "c7ccae45-3276-426a-a7f1-6f90630a47a2",
    "d815f135-8723-407b-9549-aae65dae9ae8",
  ];
  destroyClaim.strictMode = true;
  expect(buildReferencesList(destroyClaim).sort()).toEqual(refList.sort());
});

test("List of all destroySubjects Ids (References) is build correct", () => {
  const refList = [
    "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
    "a01ecbab-1e03-4823-87bb-aa0a48e80507",
  ];
  destroyClaim.strictMode = true;
  expect(buildReferencesList(destroyClaim, "destroySubjects").sort()).toEqual(
    refList.sort()
  );
});

test("List of all destroyContacts Ids (References) is build correct", () => {
  const refList = [
    "05845dd7-e9a2-4285-95da-3dd259ac8aa1",
    "3467e26e-6713-4d6e-a644-e5c11f8ea0d1",
  ];
  destroyClaim.strictMode = true;
  expect(buildReferencesList(destroyClaim, "destroyContacts").sort()).toEqual(
    refList.sort()
  );
});

test("List of all Ids destroyConditions (References) is build correct", () => {
  const refList = [
    "35f33c3d-50e2-4b33-bd23-2230d5445fc2",
    "c7ccae45-3276-426a-a7f1-6f90630a47a2",
  ];
  destroyClaim.strictMode = true;
  expect(buildReferencesList(destroyClaim, "destroyConditions").sort()).toEqual(
    refList.sort()
  );
});

test("List of all Ids destroyActions (References) is build correct", () => {
  const refList = ["d815f135-8723-407b-9549-aae65dae9ae8"];
  destroyClaim.strictMode = true;
  expect(buildReferencesList(destroyClaim, "destroyActions").sort()).toEqual(
    refList.sort()
  );
});

/**
 * Test dcBuildQuickLookupStructure
 */
test("Build quick lookup structure correct", () => {
  destroyClaim.destroySubjects.pop();
  delete destroyClaim.destroyContacts;
  delete destroyClaim.destroyConditions;
  delete destroyClaim.destroyActions;
  const result = [
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:sha256",
      payload: {
        sha256FileHash:
          "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
      },
      conditions: {
        or: [
          {
            var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2",
          },
          {
            var: "c7ccae45-3276-426a-a7f1-6f90630a47a2",
          },
        ],
      },
      action: "d815f135-8723-407b-9549-aae65dae9ae8",
    },
  ];

  expect(dcBuildQuickLookupStructure(destroyClaim).sort()).toEqual(
    result.sort()
  );
});

/**
 * Test getReferencesOfConditionsField
 */
test("References from conditions are extracted correct", () => {
  const refList = [
    "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
    "a01ecbab-1e03-4823-87bb-aa0a48e80507",
  ];
  destroyClaim.strictMode = true;
  expect(
    getReferencesOfConditionsField(destroyClaim.conditions).sort()
  ).toEqual(refList.sort());
});

test("References from conditions are extracted correct", () => {
  destroyClaim.strictMode = true;
  expect(
    getReferencesOfConditionsField({
      and: [{ ">": [3, 1] }, { "<": [1, 3] }],
    }).sort()
  ).toEqual([].sort());
});

/**
 * Test evaluateConditionsField
 */
test("Evaluation of truthy conditions field is equal to true", () => {
  const data = {
    "706927b9-7a3c-4271-96f7-1eb43b711e1e": true,
    "6ca7d3d6-a110-4edb-aa4d-54da26c61c5e": true,
    "30489ad5-9daf-465c-91f8-e865b53b1c9ev": false,
  };

  expect(
    evaluateConditionsField(destroyClaim.destroySubjects[1].conditions, data)
  ).toEqual(true);
});

test("Evaluation of falsy conditions field is equal to true", () => {
  const data = {
    "706927b9-7a3c-4271-96f7-1eb43b711e1e": true,
    "6ca7d3d6-a110-4edb-aa4d-54da26c61c5e": false,
    "30489ad5-9daf-465c-91f8-e865b53b1c9ev": false,
  };

  expect(
    evaluateConditionsField(destroyClaim.destroySubjects[1].conditions, data)
  ).toEqual(false);
});

/**
 * Test deepFreeze
 */
test("Test if Object is frozen", () => {
  const data = {
    test: "this is a test object",
  };

  deepFreeze(data);

  expect(Object.isFrozen(data)).toEqual(true);
});

test("Test if nested Object is frozen", () => {
  const data = {
    test: "this is a test object",
    nested: {
      something: "nested",
    },
  };

  deepFreeze(data);

  expect(Object.isFrozen(data.nested)).toEqual(true);
});
