/**
 * Module to be tested
 */

const Extension = require("../src/modules/Extension");
const DestroySubjectExtension = require("../src/modules/DestroySubjectExtension");
const DestroyContactExtension = require("../src/modules/DestroyContactExtension");
const DestroyActionExtension = require("../src/modules/DestroyActionExtension");

const stdSha256Schema = require("../schema/std_sha256.json");
const stdAgentSchema = require("../schema/std_agent.json");
const stdDestructionLevelSchema = require("../schema/std_destructionLevel.json");

test("Extension can not be instanciated, because it is abstract", () => {
  expect(() => new Extension()).toThrow(TypeError);
});

test("Extension can not be instanciated, on missing extension parameter or wrong type", () => {
  expect(() => new DestroySubjectExtension()).toThrow(
    "Extension: extension parameter must exist and be of type Object"
  );
  expect(() => new DestroySubjectExtension("test")).toThrow(
    "Extension: extension parameter must exist and be of type Object"
  );
});

test("Extension can not be instanciated, on missing schema parameter or wrong type", () => {
  expect(() => new DestroySubjectExtension({})).toThrow(
    "Extension: schema parameter must exist and be of type Object"
  );
  expect(() => new DestroySubjectExtension({}, "test")).toThrow(
    "Extension: schema parameter must exist and be of type Object"
  );
});

test("Extension can not be instanciated, on missing evaluation parameter or wrong type", () => {
  expect(() => new DestroySubjectExtension({}, {})).toThrow(
    "Extension: evaluation parameter must exist and be of type Object"
  );
  expect(() => new DestroySubjectExtension({}, {}, "test")).toThrow(
    "Extension: evaluation parameter must exist and be of type Object"
  );
});

test("Extension can not be instanciated, on missing evaluation key in evaluation parameter or wrong type", () => {
  expect(() => new DestroySubjectExtension({}, {}, {})).toThrow(
    "Extension: evaluation key in evaluation parameter must exists and be of type Function"
  );
  expect(() => new DestroySubjectExtension({}, {}, { evaluation: 1 })).toThrow(
    "Extension: evaluation key in evaluation parameter must exists and be of type Function"
  );
});

test("Extension can not be instanciated, on wrong preEvaluation type", () => {
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => {}, preEvaluation: 1 }
      )
  ).toThrow(
    "Extension: preEvaluation key in evaluation parameter must be of type Function"
  );
});

test("Extension can not be instanciated, on wrong postEvaluation type", () => {
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => {}, postEvaluation: 1 }
      )
  ).toThrow(
    "Extension: postEvaluation key in evaluation parameter must be of type Function"
  );
});

test("DestroySubjectExtension can be instanciated", () => {
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        {
          evaluation: () => true,
          preEvaluation: () => {},
          postEvaluation: () => {},
        },
        { realMode: () => {}, preProcess: () => {}, postProcess: () => {} }
      )
  ).not.toThrow();
});

test("DestroySubjectExtension can not be instanciated, on missing process parameter or wrong type", () => {
  expect(
    () => new DestroySubjectExtension({}, {}, { evaluation: () => {} })
  ).toThrow(
    "DestroySubjectExtension: process parameter must exist and be of type Object"
  );
  expect(
    () => new DestroySubjectExtension({}, {}, { evaluation: () => {} }, "test")
  ).toThrow(
    "DestroySubjectExtension: process parameter must exist and be of type Object"
  );
  expect(
    () => new DestroySubjectExtension({}, {}, { evaluation: () => {} }, {})
  ).toThrow(
    "DestroySubjectExtension: At least one, realMode or simulation mode must be set"
  );
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => {} },
        { realMode: "test" }
      )
  ).toThrow(
    "DestroySubjectExtension: realMode key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => {} },
        { simulationMode: "test" }
      )
  ).toThrow(
    "DestroySubjectExtension: simulationMode key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => true },
        { simulationMode: () => {}, preProcess: 1 }
      )
  ).toThrow(
    "DestroySubjectExtension: preProcess key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroySubjectExtension(
        {},
        {},
        { evaluation: () => true },
        { simulationMode: () => {}, postProcess: 1 }
      )
  ).toThrow(
    "DestroySubjectExtension: postProcess key in process parameter must be of type Function"
  );
});

test("Extension methods return correct values", async () => {
  const dcExt = new DestroyContactExtension(
    {
      id: "05845dd7-e9a2-4285-95da-3dd259ac8aa1",
      name: "std:agent",
      payload: {
        name: "John Doe",
      },
      comment: "he is our main contact here!",
      conditions: true,
    },
    stdAgentSchema,
    { evaluation: () => true }
  );

  expect(dcExt.getId()).toEqual("05845dd7-e9a2-4285-95da-3dd259ac8aa1");
  expect(dcExt.getName()).toEqual("std:agent");
  expect(dcExt.getSchema()).toEqual(stdAgentSchema);
  expect(dcExt.getPayload()).toEqual({
    name: "John Doe",
  });
  expect(dcExt.getComment()).toEqual("he is our main contact here!");
  expect(dcExt.getConditions()).toEqual(true);
  expect(await dcExt.evaluate()).toEqual(true);
  expect(dcExt.getEvaluationResult()).toEqual(true);
});

test("DestroySubjectExtension methods return correct values", async () => {
  const dsExt = new DestroySubjectExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:sha256",
      payload: {
        hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
      },
      action: "2b50341d-7c53-4630-8a91-3df64d8025e8",
    },
    stdSha256Schema,
    { evaluation: () => true },
    { realMode: () => true }
  );

  const dsExt2 = new DestroySubjectExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:sha256",
      payload: {
        hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
      },
    },
    stdSha256Schema,
    { evaluation: () => true },
    { simulationMode: () => true }
  );

  expect(dsExt.getAction()).toEqual("2b50341d-7c53-4630-8a91-3df64d8025e8");
  expect(async () => dsExt.processRealMode()).not.toThrow();
  expect(async () => dsExt2.processSimulationMode()).not.toThrow();
});

test("DestroySubjectExtension methods throw if not set", async () => {
  const dsExt = new DestroySubjectExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:sha256",
      payload: {
        hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
      },
    },
    stdSha256Schema,
    { evaluation: () => true },
    { realMode: () => true }
  );

  const dsExt2 = new DestroySubjectExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:sha256",
      payload: {
        hash: "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af",
      },
    },
    stdSha256Schema,
    { evaluation: () => true },
    { simulationMode: () => true }
  );

  expect(async () => dsExt.processSimulationMode()).rejects.toThrow(
    "DestroySubjectExtension: simulationMode function was not set on construction"
  );
  expect(async () => dsExt2.processRealMode()).rejects.toThrow(
    "DestroySubjectExtension: realMode function was not set on construction"
  );
});

test("DestroyContactExtension methods return correct values", () => {
  const dcExt = new DestroyContactExtension(
    {
      id: "05845dd7-e9a2-4285-95da-3dd259ac8aa1",
      name: "std:agent",
      payload: {
        name: "John Doe",
      },
      refs: ["04d26d8a-0fde-4e45-afc0-02cf9cd794ca"],
      comment: "he is our main contact here!",
      conditions: true,
    },
    stdAgentSchema,
    { evaluation: () => true }
  );

  expect(dcExt.getRefs()).toEqual(["04d26d8a-0fde-4e45-afc0-02cf9cd794ca"]);
  expect(dcExt.isResponsible("04d26d8a-0fde-4e45-afc0-02cf9cd794ca")).toEqual(
    true
  );
});

test("DestroyActionExtension can be instanciated", () => {
  expect(
    () =>
      new DestroyActionExtension(
        {},
        {},
        { evaluation: () => true },
        { realMode: () => {}, preProcess: () => {}, postProcess: () => {} }
      )
  ).not.toThrow();
});

test("DestroyActionExtension can not be instanciated, on missing process parameter or wrong type", () => {
  expect(
    () => new DestroyActionExtension({}, {}, { evaluation: () => true })
  ).toThrow(
    "DestroyActionExtension: process parameter must exist and be of type Object"
  );
  expect(
    () => new DestroyActionExtension({}, {}, { evaluation: () => true }, "test")
  ).toThrow(
    "DestroyActionExtension: process parameter must exist and be of type Object"
  );
  expect(
    () => new DestroyActionExtension({}, {}, { evaluation: () => true }, {})
  ).toThrow(
    "DestroyActionExtension: At least one, realMode or simulation mode must be set"
  );
  expect(
    () =>
      new DestroyActionExtension(
        {},
        {},
        { evaluation: () => true },
        { realMode: "test" }
      )
  ).toThrow(
    "DestroyActionExtension: realMode key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroyActionExtension(
        {},
        {},
        { evaluation: () => true },
        { simulationMode: "test" }
      )
  ).toThrow(
    "DestroyActionExtension: simulationMode key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroyActionExtension(
        {},
        {},
        { evaluation: () => true },
        { simulationMode: () => {}, preProcess: 1 }
      )
  ).toThrow(
    "DestroyActionExtension: preProcess key in process parameter must be of type Function"
  );
  expect(
    () =>
      new DestroyActionExtension(
        {},
        {},
        { evaluation: () => true },
        { simulationMode: () => {}, postProcess: 1 }
      )
  ).toThrow(
    "DestroyActionExtension: postProcess key in process parameter must be of type Function"
  );
});

test("DestroyActionExtension methods return correct values", async () => {
  const daExt = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { realMode: () => true }
  );

  const daExt2 = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { simulationMode: () => true }
  );

  expect(async () => daExt.processRealMode()).not.toThrow();
  expect(async () => daExt2.processSimulationMode()).not.toThrow();
});

test("DestroyActionExtension methods throw if not set", async () => {
  const daExt = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { realMode: () => true }
  );

  const daExt2 = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { simulationMode: () => true }
  );

  expect(async () => daExt.processSimulationMode()).rejects.toThrow(
    "DestroyActionExtension: simulationMode function was not set on construction"
  );
  expect(async () => daExt2.processRealMode()).rejects.toThrow(
    "DestroyActionExtension: realMode function was not set on construction"
  );
});

test("Extension state can be set and read", async () => {
  const daExt = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { realMode: () => true }
  );
  expect(() => daExt.setState("test", true)).not.toThrow();
  expect(() => daExt.getState("test")).not.toThrow();
  expect(daExt.getState("test")).toEqual(true);
});

test("Extension state methods throw on wrong or missing parameters", async () => {
  const daExt = new DestroyActionExtension(
    {
      id: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca",
      name: "std:destructionLevel",
      payload: {
        destructionLevel: "deleted",
      },
    },
    stdDestructionLevelSchema,
    { evaluation: () => true },
    { realMode: () => true }
  );
  expect(() => daExt.setState()).toThrow(
    "Extension: key parameter must be set and of type String."
  );
  expect(() => daExt.setState(1)).toThrow(
    "Extension: key parameter must be set and of type String."
  );
  expect(() => daExt.setState("test")).toThrow(
    "Extension: value parameter must be set."
  );
  expect(() => daExt.getState()).toThrow(
    "Extension: key parameter must be set and of type String."
  );
  expect(() => daExt.getState(1)).toThrow(
    "Extension: key parameter must be set and of type String."
  );
});
