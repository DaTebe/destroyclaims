/**
 * Module to be tested
 */
const SupportObjectGenerator = require("../src/modules/SupportObjectGenerator");

let sg;
beforeEach(() => {
  sg = new SupportObjectGenerator();
  sg.supportNormalMode(true);
  sg.supportRealMode(true);
  sg.supportAutomatedMode(true);
  sg.supportSilentMode(true);
  sg.addDestroySubjectExtension(
    "myDemo",
    {},
    { evaluation: () => {} },
    {
      realMode: () => {},
    }
  );
  sg.addDestroySubjectExtension(
    "myDemo2",
    {},
    { evaluation: () => {} },
    {
      realMode: () => {},
    }
  );
});

/**
 * Tests
 */
test("SupportObject is generated", () => {
  expect(() => sg.getSupportObject()).not.toThrow();
});

test("addDestroySubjectExtension wrong parameter throws", () => {
  expect(() =>
    sg.addDestroySubjectExtension(
      1,
      {},
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: extension name must be of type String");

  sg.addDestroySubjectExtension(
    "demo",
    {},
    { evaluation: () => {} },
    {
      realMode: () => {},
    }
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo",
      {},
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: extension already exists");

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo2",
      1,
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: schema must be of type Object");

  expect(() =>
    sg.addDestroySubjectExtension("demo3", {}, 1, {
      realMode: () => {},
    })
  ).toThrow("SupportObjectGenerator: evaluation must be of type Object");

  expect(() =>
    sg.addDestroySubjectExtension("demo4", {}, { evaluation: () => {} }, 1)
  ).toThrow("SupportObjectGenerator: process must be of type Object");

  expect(() => sg.addDestroySubjectExtension("demo5", {}, {}, 1)).toThrow(
    "SupportObjectGenerator: evaluation key in evaluation parameter must be set and of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension("demo6", {}, { evaluation: 1 }, 1)
  ).toThrow(
    "SupportObjectGenerator: evaluation key in evaluation parameter must be set and of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension("demo7", {}, { evaluation: () => {} }, {})
  ).toThrow(
    "SupportObjectGenerator: at least one, realMode or simulationMode, must be set in process"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo8",
      {},
      { evaluation: () => {} },
      { realMode: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: realMode key in process parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo9",
      {},
      { evaluation: () => {} },
      { simulationMode: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: simulationMode key in process parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo10",
      {},
      { evaluation: () => {}, preEvaluation: 1 },
      { realMode: () => {} }
    )
  ).toThrow(
    "SupportObjectGenerator: preEvaluation key in evaluation parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo11",
      {},
      { evaluation: () => {}, postEvaluation: 1 },
      { realMode: () => {} }
    )
  ).toThrow(
    "SupportObjectGenerator: postEvaluation key in evaluation parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo12",
      {},
      { evaluation: () => {} },
      { realMode: () => {}, preProcess: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: preProcess key in process parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroySubjectExtension(
      "demo13",
      {},
      { evaluation: () => {} },
      { realMode: () => {}, postProcess: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: postProcess key in process parameter must be of type Function"
  );
});

test("addDestroyContactExtension wrong parameter throws", () => {
  sg.addDestroyContactExtension("demo", {}, { evaluation: () => {} });

  expect(() =>
    sg.addDestroyContactExtension(1, {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension name must be of type String");

  expect(() =>
    sg.addDestroyContactExtension("demo", {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension already exists");

  expect(() =>
    sg.addDestroyContactExtension("demo2", 1, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: schema must be of type Object");

  expect(() => sg.addDestroyContactExtension("demo3", {}, 1)).toThrow(
    "SupportObjectGenerator: evaluation must be of type Object"
  );
});

test("addDestroyConditionExtension wrong parameter throws", () => {
  sg.addDestroyConditionExtension("demo", {}, { evaluation: () => {} });

  expect(() =>
    sg.addDestroyConditionExtension(1, {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension name must be of type String");

  expect(() =>
    sg.addDestroyConditionExtension("demo", {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension already exists");

  expect(() =>
    sg.addDestroyConditionExtension("demo2", 1, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: schema must be of type Object");

  expect(() => sg.addDestroyConditionExtension("demo3", {}, 1)).toThrow(
    "SupportObjectGenerator: evaluation must be of type Object"
  );

  expect(() =>
    sg.addDestroyConditionExtension("demo4", {}, { evaluation: 1 })
  ).toThrow(
    "SupportObjectGenerator: evaluation key in evaluation parameter must be set and of type Function"
  );

  expect(() =>
    sg.addDestroyConditionExtension(
      "demo5",
      {},
      { evaluation: () => {}, preEvaluation: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: preEvaluation key in evaluation parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroyConditionExtension(
      "demo6",
      {},
      { evaluation: () => {}, postEvaluation: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: postEvaluation key in evaluation parameter must be of type Function"
  );
});

test("addDestroyActionExtension wrong parameter throws", () => {
  sg.addDestroyActionExtension(
    "demo",
    {},
    { evaluation: () => {} },
    {
      realMode: () => {},
    }
  );

  expect(() =>
    sg.addDestroyActionExtension(
      1,
      {},
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: extension name must be of type String");

  expect(() =>
    sg.addDestroyActionExtension(
      "demo",
      {},
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: extension already exists");

  expect(() =>
    sg.addDestroyActionExtension(
      "demo2",
      1,
      { evaluation: () => {} },
      {
        realMode: () => {},
      }
    )
  ).toThrow("SupportObjectGenerator: schema must be of type Object");

  expect(() =>
    sg.addDestroyActionExtension("demo3", {}, 1, {
      realMode: () => {},
    })
  ).toThrow("SupportObjectGenerator: evaluation must be of type Object");

  expect(() =>
    sg.addDestroyActionExtension("demo4", {}, { evaluation: () => {} }, 1)
  ).toThrow("SupportObjectGenerator: process must be of type Object");

  expect(() =>
    sg.addDestroyActionExtension("demo5", {}, { evaluation: () => {} }, {})
  ).toThrow(
    "SupportObjectGenerator: at least one, realMode or simulationMode, must be set in process"
  );

  expect(() =>
    sg.addDestroyActionExtension(
      "demo5",
      {},
      { evaluation: () => {} },
      { realMode: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: realMode key in process parameter must be of type Function"
  );

  expect(() =>
    sg.addDestroyActionExtension(
      "demo6",
      {},
      { evaluation: () => {} },
      { simulationMode: 1 }
    )
  ).toThrow(
    "SupportObjectGenerator: simulationMode key in process parameter must be of type Function"
  );
});

test("addDestroyConditionExtension wrong parameter throws", () => {
  sg.addDestroyConditionExtension("demo", {}, { evaluation: () => {} });

  expect(() =>
    sg.addDestroyConditionExtension(1, {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension name must be of type String");

  expect(() =>
    sg.addDestroyConditionExtension("demo", {}, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: extension already exists");

  expect(() =>
    sg.addDestroyConditionExtension("demo2", 1, { evaluation: () => {} })
  ).toThrow("SupportObjectGenerator: schema must be of type Object");

  expect(() => sg.addDestroyConditionExtension("demo3", {}, 1)).toThrow(
    "SupportObjectGenerator: evaluation must be of type Object"
  );
});

test("removeExtension removes extension", () => {
  sg.addDestroyConditionExtension("demo", {}, { evaluation: () => {} });

  expect(() => sg.removeExtension(1)).toThrow(
    "SupportObjectGenerator: extensionName parameter must be of type String"
  );
  sg.removeExtension("myDemo");
  expect(!("myDemo" in sg.getSupportObject().extensions)).toEqual(true);
});

test("addSupportedDestroyReason adds reasons", () => {
  sg.addSupportedDestroyReason("demoReason");
  expect(sg.getSupportObject().destroyReasons.includes("demoReason")).toEqual(
    true
  );
});

test("addSupportedDestroyReason throws on wrong parameter types", () => {
  expect(() => sg.addSupportedDestroyReason(1)).toThrow(
    "SupportObjectGenerator: reason must be of type String or Array"
  );
  expect(() => sg.addSupportedDestroyReason([1])).toThrow(
    "SupportObjectGenerator: all reasons in Array must be of type String"
  );
});

test("removeSupportedDestroyReason removes reasons", () => {
  sg.addSupportedDestroyReason("demoReason");
  sg.removeSupportedDestroyReason("demoReason");
  expect(sg.getSupportObject().destroyReasons.includes("demoReason")).toEqual(
    false
  );
});

test("removeSupportedDestroyReason throws on wrong parameter types", () => {
  expect(() => sg.removeSupportedDestroyReason(1)).toThrow(
    "SupportObjectGenerator: reason parameter must be of type String"
  );
});

test("addSupportedVersion adds version", () => {
  sg.addSupportedVersion("1.0.0");
  expect(sg.getSupportObject().specVersion.includes("1.0.0")).toEqual(true);
});

test("addSupportedVersion throws on wrong parameter types", () => {
  expect(() => sg.addSupportedVersion(1)).toThrow(
    "SupportObjectGenerator: version parameter must be of type String."
  );
});

test("removeSupportedVersion removes version", () => {
  sg.addSupportedVersion("1.0.0");
  sg.removeSupportedVersion("1.0.0");
  expect(sg.getSupportObject().destroyReasons.includes("1.0.0")).toEqual(false);
});

test("removeSupportedVersion throws on wrong parameter types", () => {
  expect(() => sg.removeSupportedVersion(1)).toThrow(
    "SupportObjectGenerator: parameter version must be of type String."
  );
});

test("supportNormalMode saves value", () => {
  sg.supportNormalMode();
  expect(sg.getSupportObject().normalMode).toEqual(true);
  sg.supportNormalMode(true);
  expect(sg.getSupportObject().normalMode).toEqual(true);
  sg.supportNormalMode(false);
  sg.supportStrictMode(true); // one mode must be supported to get object
  sg.addSupportedVersion("1.0.0"); // needed in strict mode
  expect(sg.getSupportObject().normalMode).toEqual(false);
});

test("supportNormalMode throws on wrong parameter types", () => {
  expect(() => sg.supportNormalMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportStrictMode saves value", () => {
  sg.addSupportedVersion("1.0.0"); // needed in strict mode
  sg.supportStrictMode();
  expect(sg.getSupportObject().strictMode).toEqual(true);
  sg.supportStrictMode(true);
  expect(sg.getSupportObject().strictMode).toEqual(true);
  sg.supportStrictMode(false);
  sg.supportNormalMode(true); // one mode must be supported to get object
  expect(sg.getSupportObject().strictMode).toEqual(false);
});

test("supportStrictMode throws on wrong parameter types", () => {
  expect(() => sg.supportStrictMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportRealMode saves value", () => {
  sg.supportRealMode();
  expect(sg.getSupportObject().realMode).toEqual(true);
  sg.supportRealMode(true);
  expect(sg.getSupportObject().realMode).toEqual(true);
  sg.supportRealMode(false);
  sg.supportSimulationMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().realMode).toEqual(false);
});

test("supportRealMode throws on wrong parameter types", () => {
  expect(() => sg.supportRealMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportSimulationMode saves value", () => {
  sg.supportSimulationMode();
  expect(sg.getSupportObject().simulationMode).toEqual(true);
  sg.supportSimulationMode(true);
  expect(sg.getSupportObject().simulationMode).toEqual(true);
  sg.supportSimulationMode(false);
  sg.supportRealMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().simulationMode).toEqual(false);
});

test("supportSimulationMode throws on wrong parameter types", () => {
  expect(() => sg.supportSimulationMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportAutomatedMode saves value", () => {
  sg.supportAutomatedMode();
  expect(sg.getSupportObject().automatedMode).toEqual(true);
  sg.supportAutomatedMode(true);
  expect(sg.getSupportObject().automatedMode).toEqual(true);
  sg.supportAutomatedMode(false);
  sg.supportOptInMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().automatedMode).toEqual(false);
});

test("supportAutomatedMode throws on wrong parameter types", () => {
  expect(() => sg.supportAutomatedMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportOptInMode saves value", () => {
  sg.supportOptInMode();
  expect(sg.getSupportObject().optInMode).toEqual(true);
  sg.supportOptInMode(true);
  expect(sg.getSupportObject().optInMode).toEqual(true);
  sg.supportOptInMode(false);
  sg.supportAutomatedMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().optInMode).toEqual(false);
});

test("supportOptInMode throws on wrong parameter types", () => {
  expect(() => sg.supportOptInMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportSilentMode saves value", () => {
  sg.supportSilentMode();
  expect(sg.getSupportObject().silentMode).toEqual(true);
  sg.supportSilentMode(true);
  expect(sg.getSupportObject().silentMode).toEqual(true);
  sg.supportSilentMode(false);
  sg.supportNotificationMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().silentMode).toEqual(false);
});

test("supportSilentMode throws on wrong parameter types", () => {
  expect(() => sg.supportSilentMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("supportNotificationMode saves value", () => {
  sg.supportNotificationMode();
  expect(sg.getSupportObject().notificationMode).toEqual(true);
  sg.supportNotificationMode(true);
  expect(sg.getSupportObject().notificationMode).toEqual(true);
  sg.supportNotificationMode(false);
  sg.supportSilentMode(true); // need to support at leat one mode
  expect(sg.getSupportObject().notificationMode).toEqual(false);
});

test("supportNotificationMode throws on wrong parameter types", () => {
  expect(() => sg.supportNotificationMode(1)).toThrow(
    "SupportObjectGenerator: parameter supported must be of type Boolean."
  );
});

test("getSupportObject throws on wrong parameter types", () => {
  sg.supportNormalMode(false);
  sg.supportStrictMode(false);
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: DCA needs to support at least one (normal or strict) mode."
  );
  sg.supportNormalMode();
  sg.supportRealMode(false);
  sg.supportSimulationMode(false);
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: you need to support at least one (real or simulation) mode."
  );
  sg.supportRealMode();
  sg.supportOptInMode(false);
  sg.supportAutomatedMode(false);
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: you need to support at least one (manual or automated) mode."
  );
  sg.supportAutomatedMode(true);
  sg.supportNotificationMode(false);
  sg.supportSilentMode(false);
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: you need to support at least one (notification or silent) mode."
  );
  sg.supportSilentMode(true);
  sg.removeExtension("myDemo");
  sg.removeExtension("myDemo2");
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: DCA must at least support one destroySubject extension."
  );
  sg.addDestroySubjectExtension(
    "myDemo",
    {},
    { evaluation: () => {} },
    {
      realMode: () => {},
    }
  );
  sg.supportStrictMode();
  expect(() => sg.getSupportObject()).toThrow(
    "SupportObjectGenerator: in strict mode the DCA needs to support at least one version of the destroy claim model."
  );
});

// Hooks
// Pre Evaluation Hook
test("can add pre evaluation hook", async () => {
  expect(() => sg.addPreAllEvaluationHook(() => 1)).not.toThrow();
  expect(await sg.getSupportObject().preAllEvaluationHook()).toEqual(1);
});

test("add pre evaluation hook throws on wrong parameters", async () => {
  expect(() => sg.addPreAllEvaluationHook()).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
  expect(() => sg.addPreAllEvaluationHook(1)).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
});

test("can remove pre evaluation hook", async () => {
  expect(() => sg.addPreAllEvaluationHook(() => 1)).not.toThrow();
  expect(() => sg.removePreAllEvaluationHook()).not.toThrow();
  expect(await sg.getSupportObject().preAllEvaluationHook()).not.toEqual(1);
});

// Post Evaluation Hook
test("can add post evaluation hook", async () => {
  expect(() => sg.addPostAllEvaluationHook(() => 1)).not.toThrow();
  expect(await sg.getSupportObject().postAllEvaluationHook()).toEqual(1);
});

test("add post evaluation hook throws on wrong parameters", async () => {
  expect(() => sg.addPostAllEvaluationHook()).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
  expect(() => sg.addPostAllEvaluationHook(1)).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
});

test("can remove post evaluation hook", async () => {
  expect(() => sg.addPostAllEvaluationHook(() => 1)).not.toThrow();
  expect(() => sg.removePostAllEvaluationHook()).not.toThrow();
  expect(await sg.getSupportObject().postAllEvaluationHook()).not.toEqual(1);
});

// Pre Execution Hook
test("can add pre execute hook", async () => {
  expect(() => sg.addPreAllExecuteHook(() => 1)).not.toThrow();
  expect(await sg.getSupportObject().preAllExecuteHook()).toEqual(1);
});

test("add pre execute hook throws on wrong parameters", async () => {
  expect(() => sg.addPreAllExecuteHook()).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
  expect(() => sg.addPreAllExecuteHook(1)).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
});

test("can remove pre execute hook", async () => {
  expect(() => sg.addPreAllExecuteHook(() => 1)).not.toThrow();
  expect(() => sg.removePreAllExecuteHook()).not.toThrow();
  expect(await sg.getSupportObject().preAllExecuteHook()).not.toEqual(1);
});

// Post Execute Hook
test("can add post execute hook", async () => {
  expect(() => sg.addPostAllExecuteHook(() => 1)).not.toThrow();
  expect(await sg.getSupportObject().postAllExecuteHook()).toEqual(1);
});

test("add post execute hook throws on wrong parameters", async () => {
  expect(() => sg.addPostAllExecuteHook()).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
  expect(() => sg.addPostAllExecuteHook(1)).toThrow(
    "SupportObjectGenerator: parameter hook must be of type Function."
  );
});

test("can remove post execute hook", async () => {
  expect(() => sg.addPostAllExecuteHook(() => 1)).not.toThrow();
  expect(() => sg.removePostAllExecuteHook()).not.toThrow();
  expect(await sg.getSupportObject().postAllExecuteHook()).not.toEqual(1);
});
