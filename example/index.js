/* eslint-disable no-console */
const fs = require("fs").promises;
const { isManualMode } = require("../src/util/dcTools");

// Data Connector
const connector = require("./connector");

// Models
const SupportObjectGenerator = require("../src/modules/SupportObjectGenerator");
const DestroyClaim = require("../src/modules/DestroyClaim");

// Extension Schemas
const stdSha256Schema = require("../schema/std_sha256.json");
const stdAgentSchema = require("../schema/std_agent.json");
const stdFromPointInTimeSchema = require("../schema/std_fromPointInTime.json");
const stdDestructionLevelSchema = require("../schema/std_destructionLevel.json");

const support = new SupportObjectGenerator();
support.supportNormalMode();
support.supportStrictMode();
support.supportRealMode();
support.supportSimulationMode();
support.supportAutomatedMode();
support.supportManualMode();
support.supportSilentMode();
support.supportNotificationMode();
support.addSupportedVersion("1.0.0");
support.addSupportedDestroyReason("security/integrity/malicious-data");
support.addSupportedDestroyReason(["compliance/laws/personal-data/gdpr"]);
support.addDestroySubjectExtension(
  "std:sha256",
  stdSha256Schema,
  {
    preEvaluation: (subject) => {
      console.log(`pre evaluate ${subject.getId()}`);
    },
    evaluation: (subject) =>
      connector.sha256FileHash.exists(subject.getPayload().hash),
    postEvaluation: (subject) => {
      console.log(`post evaluate result: ${subject.getEvaluationResult()}`);
    },
  },
  {
    preProcess: (subject) => {
      console.log(`will delete ${subject.getId()}`);
      // throw new Error("Test Error in Subject PreProcessHook");
    },
    realMode: (subject) => {
      connector.sha256FileHash.destroy(subject.getPayload().hash);
    },
    simulationMode: (subject) => {
      connector.sha256FileHash.simDestroy(subject.getPayload().hash);
    },
    postProcess: (subject) => {
      console.log(`deletion of ${subject.getId()} finished`);
    },
  }
);
support.addDestroyContactExtension("std:agent", stdAgentSchema, {
  evaluation: () => true,
});
support.addDestroyConditionExtension(
  "std:fromPointInTime",
  stdFromPointInTimeSchema,
  {
    evaluation: (condition) =>
      new Date().toISOString() >= condition.getPayload().from,
  }
);
support.addDestroyActionExtension(
  "std:destructionLevel",
  stdDestructionLevelSchema,
  {
    preEvaluation: () => {},
    evaluation: (action) => {
      if (
        action.getPayload().destructionLevel === "deleted" ||
        action.getPayload().destructionLevel === "wiped"
      ) {
        return true;
      }
      return false;
    },
    postEvaluation: () => {},
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
support.addPreAllEvaluationHook((destroyclaim) => {
  destroyclaim.setState("test", "banana");
  console.log(
    `before all evaluation hook of destroy claim ${
      destroyclaim.getDestroyClaimOriginalJSON().id
    }`
  );
  console.log(`state = ${JSON.stringify(destroyclaim.getState())}`);
});
support.addPostAllEvaluationHook(() => {
  console.log("after all evalúation hook");
});
support.addPreAllExecuteHook((destroyclaim) => {
  console.log("pre exec. hook: I start a transaction logic...");
});
support.addPostAllExecuteHook((destroyclaim) => {
  console.log(
    "post exec. hook: when there was no error I commit, else I rollback..."
  );
});

const exampleDestroyClaim = {
  id: "02faafea-1c31-4771-b90b-2e8380af06dd",
  isActive: true,
  strictMode: false,
  notificationMode: true,
  manualMode: false,
  simulationMode: false,
  modelVersion: "1.0.0",
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
      action: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
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
  destroyActions: [
    {
      id: "a98a0d6b-69fc-4e63-b1e8-a8d04a79f5d1",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "wiped",
      },
    },
  ],
};

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

(async () => {
  const testFilesPromises = testFiles.map(async (f) => {
    await fs.writeFile(f.path, f.content);
  });
  await Promise.all(testFilesPromises);
  await connector.init(dir);

  const dc = new DestroyClaim(exampleDestroyClaim, support.getSupportObject());
  try {
    if (isManualMode(dc.getDestroyClaimOriginalJSON())) {
      // eslint-disable-next-line global-require
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(
        `If you want to process destroy claim ${
          dc.getDestroyClaimOriginalJSON().id
        } please write (yes): `,
        (answer) => {
          if (answer === "yes") {
            dc.process();
          }
          rl.close();
        }
      );
    } else {
      await dc.process();
    }
  } catch (e) {
    console.log(e);
  }
})();
