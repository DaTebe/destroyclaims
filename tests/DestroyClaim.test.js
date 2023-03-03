// Dependencies
jest.setTimeout(20000);
const fs = require("fs").promises;
const SupportObjectGenerator = require("../src/modules/SupportObjectGenerator");

// extension schemas
const stdSha256Schema = require("../schema/std_sha256.json");
const stdAgentSchema = require("../schema/std_agent.json");
const stdFromPointInTimeSchema = require("../schema/std_fromPointInTime.json");
const stdDestructionLevelSchema = require("../schema/std_destructionLevel.json");

// example connector
const connector = require("../example/connector");

// Module to be tested
const DestroyClaim = require("../src/modules/DestroyClaim");
const DestroyContactExtension = require("../src/modules/DestroyContactExtension");
const DestroySubjectExtension = require("../src/modules/DestroySubjectExtension");
const DestroyConditionExtension = require("../src/modules/DestroyConditionExtension");
const DestroyActionExtension = require("../src/modules/DestroyActionExtension");
/**
 * Mock Data
 */

const dir = "**/testFile*.txt";

const testFiles = [
  {
    path: "testFile1.txt",
    content: "Some content 1",
  },
  {
    path: "testFile2.txt",
    content: "Some content 2",
  },
  {
    path: "testFile3.txt",
    content: "Some content 3",
  },
  {
    path: "testFile4.txt",
    content: "Some content 4",
  },
  {
    path: "testFile5.txt",
    content: "Some content 5",
  },
];

let destroyclaim = null;
let support = null;

beforeEach(async () => {
  // reset destroy claim
  destroyclaim = {
    id: "02faafea-1c31-4771-b90b-2e8380af06dd",
    isActive: true,
    strictMode: false,
    notificationMode: false,
    optInMode: false,
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
        refs: ["04d26d8a-0fde-4e45-afc0-02cf9cd794ca"],
        comment: "he is our main contact here!",
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
          hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
        },
      },
      {
        id: "937f93b3-90b9-4b6f-b3a7-27a1b0a4476f",
        name: "std:sha256",
        payload: {
          hash: "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79",
        },
      },
    ],
    destroyConditions: [
      {
        id: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
        name: "std:fromPointInTime",
        payload: {
          from: "2022-12-01T00:00:00.000Z",
        },
      },
    ],
  };

  support = new SupportObjectGenerator();
  support.supportNormalMode(true);
  support.supportStrictMode(true);
  support.supportRealMode(true);
  support.supportSimulationMode(true);
  support.supportAutomatedMode(true);
  support.supportOptInMode(true, (dc, execute) => {
    // eslint-disable-next-line global-require
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      `If you want to delete data from destroy claim ${dc.id} please write (yes): `,
      (answer) => {
        if (answer === "yes") {
          execute();
        }
        rl.close();
      }
    );
  });
  support.supportSilentMode(true);
  support.supportNotificationMode(true, (dc) => {
    console.log(`destroy claim ${dc.id} will be executed!`);
  });
  support.addSupportedVersion("1.0.0");
  support.addSupportedDestroyReason("security/integrity/malicious-data");
  support.addSupportedDestroyReason(["compliance/laws/personal-data/gdpr"]);
  support.addDestroySubjectExtension(
    "std:sha256",
    stdSha256Schema,
    {
      evaluation: (subject) =>
        connector.sha256FileHash.exists(subject.getPayload().hash),
    },
    {
      realMode: (subject) =>
        connector.sha256FileHash.destroy(subject.getPayload().hash),
      simulationMode: (subject) =>
        connector.sha256FileHash.simDestroy(subject.getPayload().hash),
    }
  );
  support.addDestroyContactExtension("std:agent", stdAgentSchema, {
    evaluation: () => true,
  });
  support.addDestroyConditionExtension(
    "std:fromPointInTime",
    stdFromPointInTimeSchema,
    {
      evaluation: (contact) =>
        new Date().toISOString() >= contact.getPayload().from,
    }
  );
  support.addDestroyActionExtension(
    "std:destructionLevel",
    stdDestructionLevelSchema,
    {
      evaluation: (action) => {
        if (
          action.getPayload().destructionLevel === "deleted" ||
          action.getPayload().destructionLevel === "wiped"
        ) {
          return true;
        }
        return false;
      },
    },
    {
      realMode: (action, subject) => {
        if (action.getPayload().destructionLevel === "deleted") {
          connector.sha256FileHash.destroy(subject.getPayload().hash);
        }
        if (action.getPayload().destructionLevel === "wiped") {
          connector.sha256FileHash.wipe(subject.getPayload().hash);
        }
      },
      simulationMode: (action, subject) => {
        if (
          action.getPayload().destructionLevel === "deleted" ||
          action.getPayload().destructionLevel === "wiped"
        ) {
          connector.sha256FileHash.simDestroy(subject.getPayload().hash);
        }
      },
    }
  );

  const testFilesPromises = testFiles.map(async (f) =>
    fs.writeFile(f.path, f.content)
  );
  await Promise.all(testFilesPromises);
  return connector.init(dir);
});

afterEach(async () =>
  Promise.allSettled(testFiles.map(async (f) => fs.unlink(f.path)))
);

/**
 * Tests
 */

test("DestroyClaim: Not initialized on wrong parameters", async () => {
  expect(() => new DestroyClaim(1, 1)).toThrow(
    "DestroyClaim: parameter destroyclaim must be of type Object."
  );
  expect(() => new DestroyClaim(destroyclaim, 1)).toThrow(
    "DestroyClaim: parameter support must be of type Object."
  );
});

test("DestroyClaim: Not initialized on invalide destroy claim", async () => {
  expect(() => new DestroyClaim({}, support.getSupportObject())).toThrow(
    "DestroyClaim: destroy claim validation failed."
  );
});

test("DestroyClaim: Subjects are deleted", async () => {
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(false);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(false);
});

test("DestroyClaim: Subjects are not deleted (simulation)", async () => {
  destroyclaim.simulationMode = true;
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(true);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(true);
});

test("DestroyClaim: Subjects are deleted with conditions", async () => {
  destroyclaim.destroySubjects[0].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  destroyclaim.destroySubjects[1].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists({
      hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
    })
  ).toBe(false);
  expect(
    connector.sha256FileHash.exists({
      hash: "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79",
    })
  ).toBe(false);
});

test("DestroyClaim: No subjects are deleted because conditions not met", async () => {
  destroyclaim.destroySubjects[0].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  destroyclaim.destroySubjects[1].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  destroyclaim.destroyConditions[0].payload.from = "2222-12-01T00:00:00.000Z";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await expect(async () => dc.process()).rejects.toThrow();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(true);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(true);
});

test("DestroyClaim: No subjects are deleted because one conditions not met", async () => {
  destroyclaim.destroySubjects[0].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  destroyclaim.destroyConditions[0].payload.from = "2222-12-01T00:00:00.000Z";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await expect(async () => dc.process()).rejects.toThrow();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(true);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(true);
});

test("DestroyClaim: One subject is deleted because one conditions is met", async () => {
  destroyclaim.destroySubjects[0].conditions = {
    var: "744534c9-14c5-4d47-a0ee-cd432b197c3c",
  };
  destroyclaim.conditions = {
    or: [
      { var: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca" },
      { var: "937f93b3-90b9-4b6f-b3a7-27a1b0a4476f" },
    ],
  };
  destroyclaim.destroyConditions[0].payload.from = "2222-12-01T00:00:00.000Z";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(true);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(false);
});

test("DestroyClaim: One subject is deleted using an action, the other using default", async () => {
  destroyclaim.destroyActions = [];
  destroyclaim.destroyActions.push({
    id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
    name: "std:destructionLevel",
    payload: {
      destructionLevel: "deleted",
    },
  });
  destroyclaim.destroySubjects[0].action =
    "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(false);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(false);
});

test("DestroyClaim: One subject is deleted using an action, the other using default (simulation)", async () => {
  destroyclaim.simulationMode = true;
  destroyclaim.destroyActions = [];
  destroyclaim.destroyActions.push({
    id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
    name: "std:destructionLevel",
    payload: {
      destructionLevel: "deleted",
    },
  });
  destroyclaim.destroySubjects[0].action =
    "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.process();
  await connector.init(dir);
  expect(
    connector.sha256FileHash.exists(
      "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af"
    )
  ).toBe(true);
  expect(
    connector.sha256FileHash.exists(
      "aa7dea3f431b68a556487a914ade75b3e8db5bb2d32ad33874eff9ad3b29ad79"
    )
  ).toBe(true);
});

test("DestroyClaim: Error in DestroySubject evaluation throws", async () => {
  support.removeExtension("std:sha256");
  support.addDestroySubjectExtension(
    "std:sha256",
    stdSha256Schema,
    {
      evaluation: () => {
        throw new Error("Test Error");
      },
    },
    {
      realMode: (subject) =>
        connector.sha256FileHash.destroy(subject.getPayload().hash),
      simulationMode: (subject) =>
        connector.sha256FileHash.simDestroy(subject.getPayload().hash),
    }
  );
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow("Test Error");
});

test("DestroyClaim: Error in DestroyContact evaluation throws", async () => {
  support.removeExtension("std:agent");
  support.addDestroyContactExtension("std:agent", stdAgentSchema, {
    evaluation: () => {
      throw new Error("Test Error");
    },
  });
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow("Test Error");
});

test("DestroyClaim: Error in DestroyCondition evaluation throws", async () => {
  support.removeExtension("std:fromPointInTime");
  support.addDestroyConditionExtension(
    "std:fromPointInTime",
    stdFromPointInTimeSchema,
    {
      evaluation: () => {
        throw new Error("Test Error");
      },
    }
  );
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow("Test Error");
});

test("DestroyClaim: Error in DestroyAction evaluation throws", async () => {
  support.removeExtension("std:destructionLevel");
  support.addDestroyActionExtension(
    "std:destructionLevel",
    stdDestructionLevelSchema,
    {
      evaluation: () => {
        throw new Error("Test Error");
      },
    },
    {
      realMode: (action, subject) => {
        if (action.getPayload().destructionLevel === "deleted") {
          connector.sha256FileHash.destroy(subject.getPayload().hash);
        }
        if (action.getPayload().destructionLevel === "wiped") {
          connector.sha256FileHash.wipe(subject.getPayload().hash);
        }
      },
      simulationMode: (action, subject) => {
        if (
          action.getPayload().destructionLevel === "deleted" ||
          action.getPayload().destructionLevel === "wiped"
        ) {
          connector.sha256FileHash.simDestroy(subject.getPayload().hash);
        }
      },
    }
  );
  destroyclaim.destroyActions = [
    {
      id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
  ];
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow("Test Error");
});

test("DestroyClaim: Without destroyContacs, destroyConditions, and destroyActions work", async () => {
  delete destroyclaim.destroyContacts;
  delete destroyclaim.destroyConditions;
  delete destroyclaim.destroyActions;
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).not.toThrow();
});

test("DestroyClaim: Without evaluation methods that return a boolean value will not throw", async () => {
  // subject
  support.removeExtension("std:sha256");
  support.addDestroySubjectExtension(
    "std:sha256",
    stdSha256Schema,
    {
      evaluation: () => null,
    },
    {
      realMode: (subject) =>
        connector.sha256FileHash.destroy(subject.getPayload().hash),
      simulationMode: (subject) =>
        connector.sha256FileHash.simDestroy(subject.getPayload().hash),
    }
  );
  // contact
  support.removeExtension("std:agent");
  support.addDestroyContactExtension("std:agent", stdAgentSchema, {
    evaluation: () => null,
  });
  // condition
  support.removeExtension("std:fromPointInTime");
  support.addDestroyConditionExtension(
    "std:fromPointInTime",
    stdFromPointInTimeSchema,
    {
      evaluation: () => null,
    }
  );
  // action
  support.removeExtension("std:destructionLevel");
  support.addDestroyActionExtension(
    "std:destructionLevel",
    stdDestructionLevelSchema,
    {
      evaluation: () => null,
    },
    {
      realMode: () => {},
    }
  );
  destroyclaim.destroyActions = [
    {
      id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
  ];
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.evaluate()).not.toThrow();
});

test("DestroyClaim: Throws on execution if destroy claim is not active", async () => {
  destroyclaim.isActive = false;
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow(
    "DestroyClaim: destroy claim is not active"
  );
});

test("DestroyClaim: Throws on execution if destroy claim is expired", async () => {
  destroyclaim.expires = "2022-12-01T00:00:00.000Z";
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  expect(async () => dc.process()).rejects.toThrow(
    "DestroyClaim: destroy claim is expired"
  );
});

test("DestroyClaim: Methods return correct values", async () => {
  destroyclaim.strictMode = false;
  destroyclaim.optInMode = false;
  destroyclaim.notificationMode = false;
  destroyclaim.simulationMode = false;
  destroyclaim.expires = "2022-12-01T00:00:00.000Z";
  destroyclaim.issued = "2022-12-01T00:00:00.000Z";
  destroyclaim.modified = "2022-12-01T00:00:00.000Z";
  destroyclaim.title = "test";
  destroyclaim.description = "test";
  destroyclaim.keywords = ["test"];
  destroyclaim.specVersion = "1.0.0";
  destroyclaim.signature = "testSignature";
  destroyclaim.conditions = true;
  destroyclaim.destroyActions = [
    {
      id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
  ];
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.evaluate();

  expect(dc.getDestroyClaimJSON().id).toEqual(
    "02faafea-1c31-4771-b90b-2e8380af06dd"
  );
  expect(dc.getDestroyReasons()).toEqual(["security/integrity/malicious-data"]);
  expect(dc.getId()).toEqual("02faafea-1c31-4771-b90b-2e8380af06dd");
  expect(dc.getIsActive()).toEqual(true);
  expect(dc.getStrictMode()).toEqual(false);
  expect(dc.getSimulationMode()).toEqual(false);
  expect(dc.getOptInMode()).toEqual(false);
  expect(dc.getNotificationMode()).toEqual(false);
  expect(dc.getexpires()).toEqual("2022-12-01T00:00:00.000Z");
  expect(dc.getIssued()).toEqual("2022-12-01T00:00:00.000Z");
  expect(dc.getModified()).toEqual("2022-12-01T00:00:00.000Z");
  expect(dc.getTitle()).toEqual("test");
  expect(dc.getDescription()).toEqual("test");
  expect(dc.getKeywords()).toEqual(["test"]);
  expect(dc.getSpecVersion()).toEqual("1.0.0");
  expect(dc.getSignature()).toEqual("testSignature");
  expect(dc.getConditions()).toEqual(true);
  expect(dc.getDestroySubjects()[0]).toBeInstanceOf(DestroySubjectExtension);
  expect(dc.getDestroyContacts()[0]).toBeInstanceOf(DestroyContactExtension);
  expect(dc.getDestroyConditions()[0]).toBeInstanceOf(
    DestroyConditionExtension
  );
  expect(dc.getDestroyActions()[0]).toBeInstanceOf(DestroyActionExtension);
  expect(dc.getEvaluationState()).toEqual({
    "02faafea-1c31-4771-b90b-2e8380af06dd": {
      conditions: true,
      evaluation: true,
    },
    "04d26d8a-0fde-4e45-afc0-02cf9cd794ca": {
      conditions: true,
      evaluation: true,
    },
    "05845dd7-e9a2-4285-95da-3dd259ac8aa1": {
      conditions: true,
      evaluation: true,
    },
    "3467e26e-6713-4d6e-a644-e5c11f8ea0d1": {
      conditions: true,
      evaluation: true,
    },
    "744534c9-14c5-4d47-a0ee-cd432b197c3c": {
      conditions: true,
      evaluation: true,
    },
    "937f93b3-90b9-4b6f-b3a7-27a1b0a4476f": {
      conditions: true,
      evaluation: true,
    },
    "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1": {
      conditions: true,
      evaluation: true,
    },
  });
});

test("DestroyClaim state can be set and read", async () => {
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.evaluate();
  expect(() => dc.setState("test", true)).not.toThrow();
  expect(() => dc.getState("test")).not.toThrow();
  expect(dc.getState("test")).toEqual(true);
});

test("DestroyClaim state methods throw on wrong or missing parameters", async () => {
  const dc = new DestroyClaim(destroyclaim, support.getSupportObject());
  await dc.evaluate();

  expect(() => dc.setState()).toThrow(
    "DestroyClaim: key parameter must be set and of type String."
  );
  expect(() => dc.setState(1)).toThrow(
    "DestroyClaim: key parameter must be set and of type String."
  );
  expect(() => dc.setState("test")).toThrow(
    "DestroyClaim: value parameter must be set."
  );
  expect(() => dc.getState()).toThrow(
    "DestroyClaim: key parameter must be set and of type String."
  );
  expect(() => dc.getState(1)).toThrow(
    "DestroyClaim: key parameter must be set and of type String."
  );
});
