# Destroy Claim Model 1.0.0 Specification

[back to homepage](../README.md)

## Table of Content

+ [Introduction](#introduction)
+ [Terminology](#terminology)
+ [Definitions](#definitions)
+ [Destroy Claim Model](#destroy-claim-model)
  + [Core Model](#core-model)
  + [Extensions Model](#extensions-model)
+ [Extensions](#extensions)
  + [Understanding destroySubjects Extensions](#understanding-destroysubjects-extensions)
  + [Understanding destroyConditions Extensions](#understanding-destroyconditions-extensions)
  + [Understanding destroyActions Extensions](#understanding-destroyactions-extensions)
  + [Understanding destroyContacts Extensions](#understanding-destroycontacts-extensions)
  + [Writing an extension](#writing-an-extension)
+ [Destroy Claim Modes](#destroy-claim-modes)
  + [Normal Mode and Strict Mode](#normal-mode-and-strict-mode)
  + [Real Mode and Simulation Mode](#real-mode-and-simulation-mode)
  + [Manual Mode and Automated Mode](#manual-mode-and-automated-mode) 
  + [Notification Mode and Silent Mode](#notification-mode-and-silent-mode)
+ [Signing Destroy Claims](#signing-destroy-claims)
  + [Requirements for the Destroy Claims](#requirements-for-the-destroy-claims)
  + [Requirements to the DCA and Environment](#requirements-to-the-dca-and-environment)
  + [JWS Example](#example)
+ [DCA: Evaluation and executing a Destroy Claim](#dca-evaluating-and-executing-a-destroy-claim)
  + [Pre-Check](#pre-check)
  + [Interpreting destroySubjects](#interpreting-destroysubjects)
  + [Interpreting destroyConditions](#interpreting-destroyconditions)
  + [Interpreting destroyActions](#interpreting-destroyactions)
  + [Interpreting destroyContacs](#interpreting-destroycontacts)
  + [Interpreting destroyReasons](#interpreting-destroyreasons)
  + [Interpreting conditions](#interpreting-conditions)
  + [Pre-Execution](#pre-execution)
  + [Execution](#execution)
+ [Examples](#examples)
  + [Small Example](#small-example)
  + [More Complex Example](#more-complex-example)

## Introduction

The following documentation describes the Destroy Claim Model semantically and syntactically.
The model is derived from research on structuring the end of the data lifecycle.
The goal of the model is to provide a generic, technology-agnostic approach for pre-modeling and automating the end of the data lifecycle.
The model has a fixed core that is always uniform for describing the deletion request.
Through an extension system, the Destroy Claims can be customized to individual needs.
The documentation includes on the one hand the description of the core.
On the other hand, it goes into detail about how to write extensions for the Destroy Claim Model.
In addition to describing the model itself, we will also address, to the extent possible, how an agent must evaluate the model.

## Terminology
In the documentation, some of the terms used have a special meaning.
They are described in [RFC2119](https://www.ietf.org/rfc/rfc2119.txt).
The documentation highlights the terms by capitalization (e.g., MUST) and adheres to the definition in the RFC.

## Definitions

+ <a name="def-destroyclaim">__</a>Destroy Claim:__
A Destroy Claim models all necessary aspects to describe the end of the data lifecycle.

+ <a name="def-agent"></a>__Destroy Claim Agent (DCA):__
A DCA is a piece of software that acts as a link between the Destroy Claims and the environment where the real data is located.
The DCA processes and evaluates a Destroy Claim to check whether it can be applied.
The DCA can delete data according to the Destroy Claim.
Depending on the context, the DCA can offer additional features.
For example, it may simulate the deletion of data.

+ <a name="def-extension"></a>__Extension:__ 
An extension is a self-contained aspect of data deletion used within a Destroy Claim.
It can be a way of describing a region where data must be deleted or any other condition one might think of, that is relevant to check.

## Destroy Claim Model

In this section, the Destroy Claim Model is discussed.
The model is specified in JSON.
This makes it easy to read and use on different systems.
First, the core of the model is described.
Then it is explained how to integrate extensions into the model.
A complete JSON Schema is available [here](https://github.com/DaTebe/destroyclaim-js/blob/main/schema/destroyclaim-schema.json).

### Core Model

The core includes attributes that are immutable and should be preserved for a general understanding of Destroy Claims.
They include technical values as well as fields for a better communication with human actors.
A list of attributes of the data model is presented below.
The fields classified with MUST must be used in any case to create a valid Destroy Claim.
The fields classified with SHOULD are a recommendation that can greatly simplify the work with Destroy Claims (e.g., for humans).
They often contain information about contact persons or content descriptions.
The attributes classified with MAY are optional and to be used depending on the use case.
Systems that work with Destroy Claims may tighten attribute requirements, but never weaken them.
Adding additional properties is allowed.

> ⚠️ It is possible that attributes will be assigned a meaning in future versions of the model.
> This should be taken into account when adding your own attributes.
> You should couple custom attributes to a specific version of the Destroy Claim Model.


|field name|required|description|type|example|
|---|---|---|---|---|
|`id`|MUST|The unique id to identify a Destroy Claim. MUST be generated using [UUIDv4](https://datatracker.ietf.org/doc/html/rfc4122.html). It is needed to easily distinguish between different Destroy Claims. Can be used, for example, when a DCA wants to implement a backoff strategy for Destroy Claims that are not yet executable.|`String`|`02faafea-1c31-4771-b90b-2e8380af06dd`|
|`isActive`|MUST|Indicates if a Destroy Claim is active. If `isActive` is `false`, the Destroy Claim MUST NOT be executed. It can be used to ensure that a Destroy Claim is not accidentally executed at design time.|`Boolean`|`true`, `false`|
|`modelVersion`|SHOULD|Indicates which version of the Destroy Claim Model Specification was used to generate this Destroy Claim. [Semantic Versioning 2.0.0](https://semver.org/) MUST be used.|`String`|`1.0.0`|
|`expirationDate`|SHOULD|When Destroy Claims are not managed by a central entity such as a catalog, it can be difficult to decide when a Destroy Claim is no longer required to be evaluated. Therefore, it may be useful to let Destroy Claims expire over time. As of the specified date, the Destroy Claim will no longer be executed.[ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) with time zones MUST be used.|`<ISO8601>String`|`2024-01-01T00:00:00.000Z`|
|`strictMode`|SHOULD|Indicates whether the DCA should act in strict mode or normal mode. This can make a difference in certain cases. If not set, strict mode is not to be applied and normal mode is used. If the DCA does not support the selected mode (strict or normal), the Destroy Claim MUST NOT be evaluated and executed.|`Boolean`|`true`, `false`|
|`simulationMode`|SHOULD|Indicates whether the DCA should act in simulation mode or real mode. In simulation mode the DCA MUST NOT interact with the real data in the environment. Not all DCAs support simulated execution. If not set, simulation mode is not to be applied. If the DCA does not support the selected mode (simulation or real), the Destroy Claim MUST NOT be evaluated and executed.|`Boolean`|`true`, `false`|
|`notificationMode`|SHOULD|Indicates whether the DCA should act in notification mode or silent mode. In notification mode the DCA MUST notify on execution of a Destroy Claim. Not all DCAs support notifications. If not set, notification mode is not to be applied. If the DCA does not support the selected mode (notification or silent), the Destroy Claim MUST NOT be evaluated and executed.|`Boolean`|`true`, `false`|
|`manualMode`|SHOULD|Indicates whether the DCA should act in manual mode or automated mode. In manual mode the DCA MUST obtain the consent of a user to execute a Destroy Claim. Not all DCAs support manual mode. If not set, automated mode is to be applied. If the DCA does not support the selected mode (manual or automated), the Destroy Claim MUST NOT be evaluated and executed.|`Boolean`|`true`, `false`|
|`title`|SHOULD|Destroy Claims SHOULD have easy to understand names that describe what they are about. May be omitted when Destroy Claims are handled fully automated.|`String`|`Financial Report 2019`, `Personal Data Max Mustermann`, `Sensor Data S123 2022.04`|
|`description`|SHOULD|A detailed description of the Destroy Claim. The description can help a human actor to understand what the Destroy Claim is about and what the context is.|`String`|`We need to delete the test data, because it contains errors.`|
|`keywords`|SHOULD|Keywords which tag the Destroy Claim. Keywords can be used to make the Destroy Claims easier to find (e.g., in a data catalog system).|`[String]`|`["personal data", "report", "law"]`|
|`issued`|SHOULD|Date of formal issuance of the Destroy Claim as described in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html). Time zones MUST be used to avoid imprecision.|`<ISO8601>String`|`2021-10-05T01:20:12.000Z`|
|`modified`|SHOULD|Date on which the Destroy Claim was changed as described in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html). Time zones MUST be used to avoid imprecision.|`<ISO8601>String`|`2011-10-05T14:48:00.000Z`|
|`signature`|MAY|A JSON Web Signature [(JWS)](https://www.rfc-editor.org/rfc/rfc7515)) (see [Signing Destroy Claims](#✒️-signing-destroy-claims)). SHOULD be used when one does not control the entire environment in which the Destroy Claims exist.|`String`|`eyJhbGciOiJSUzI1NiJ9.eyJpZCI6ImRlc3Ryb3ljbGFpbTp1dWlk...`|
|`conditions`|MAY|A condition is written in Boolean algebra and can influence the applicability of the Destroy Claim (see [conditions](#conditions)). Conditions are written in [JSONLogic](https://jsonlogic.com/).|`<JSONLogic>Object`|`{and: [{ var: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca" },{ var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" }]}`|
|`destroyReasons`|SHOULD|A list of reasons why the data must be deleted can be specified. Free text is allowed. A controlled set, in which reasons can be addressed by IRI, SHOULD be used. This increases reusability and interpretability.|`[String]`|`["timeliness", "https://example/destroyclaim/reasons/compliance/laws/gdpr"]`|
|`destroySubjects`|MUST|`destroySubjects` describes what should be deleted. It depends on the specific extension on how an element of `destroySubjects` is modeled.|`[<extension>Object]`|see [Extension System](#extension-system)|
|`destroyContacts`|SHOULD|A list of contacts for this Destroy Claim. They are the contact persons for questions about the Destroy Claim or `destroySubjects`.|`[<extension>Object]`|see [Extension System](#extension-system)|
|`destroyConditions`|MAY|`destroyConditions` are conditions that must be met prior to executing the Destroy Claim. E.g., data must be at a physical or logical location or, there have to be time or event-based triggers or a specific person should be in charge of deletion. The modeling is the responsibility of the extension.|`[<extension>Object]`|see [Extension System](#extension-system)|
|`destroyActions`|MAY|`destroyActions` describe what the DCA MUST do when executing the Destroy Claim. E.g., data must be deleted using special algorithms or the deletion must be logged. The modeling is the responsibility of the extension.|`[<extension>Object]`|see [Extension System](#extension-system)|

### Extensions Model

A Destroy Claim should be able to address many distinct types of data and state conditions.
Since the amount of data types, databases, systems, algorithms for deletion or types of trigger events are almost infinite, the Destroy Claim Model offers an extension system.
An extension is modelled as a JSON object.
Additional properties are not allowed.

|field name|required|description|type|example|
|---|---|---|---|---|
|`id`|MUST|The unique id of an extension. Is given by the creator of the Destroy Claim and must only be unique in the context of the same Destroy Claim. It is needed for additional evaluation logic (conditions) that refer to the `id`. MUST be generated using UUIDv4.|`String`|`3140ae3f-4a62-4afb-941e-8d82290eb65b`|
|`name`|MUST|The name of an extension. To avoid collisions in a non-controlled global scope, a self-controlled domain can be used as name.|`String`|`sha256FileHash`, `http://example.com/destroyclaim/extension/sha256FileHash`, `com.example.destroyclaim.extension.sha256FileHash`|
|`schema`|SHOULD|A reference to a JSON Schema or the schema itself, which describes the `payload` of the extension. In the best case, the schema can be obtained directly or via a given reference. The schema SHOULD contain a human readable explanation of what the extension is trying to achieve in its `description` and/or `$comment` field.|`String`|`http://example.com/schemas/sha256FileHash.json`|
|`payload`|MUST|Contains the payload described by the extension.|`Object`|Depending on the extension|
|`comment`|MAY|Contains a human readable comment. E.g., why this extension or data is selected.|`String`|`Our data is stored in our PostgeSQL DB.`|
|`conditions`|MAY|A condition is written in Boolean algebra and can influence the applicability of the Destroy Claim (see [conditions](#conditions)). Conditions are written in [JSONLogic](https://jsonlogic.com/).|`<JSONLogic>Object`|`{and: [{ var: "04d26d8a-0fde-4e45-afc0-02cf9cd794ca" },{ var: "35f33c3d-50e2-4b33-bd23-2230d5445fc2" }]}`|
|`action`|SHOULD (only in `destroySubjects`)|`action` references an action from `destroyActions` that should be performed when deleting the subject. Only one action is allowed and it should model all needed methods, strategies or tools. If the field is omitted, the DCA MUST execute its default action that can handle the data deletion in regard to its extension.|`String`|`3140ae3f-4a62-4afb-941e-8d82290eb65b`|
|`refs`|MUST (only in `destroyContacts`)|References `id`s of Destroy Claim or extension to provide a contact for that specific part in the Destroy Claim.|`[String]`|`["3140ae3f-4a62-4afb-941e-8d82290eb65b"]`|

## Extensions

This section explains the main principles of an extension and how different kinds of extensions have to be designed.
Extensions provide a unified way to extend the Destroy Claims Model to meet your needs.
Any data model can be integrated in an extension.
The data stored there can then cause the DCA to perform special checks or delete data in a certain way.
Currently, in version 1.0.0 of the Destroy Claim Model Specification, there are 4 types of extensions.
Namely `destroySubject`, `destroyContact`, `destroyCondition` and `destroyAction`.
The following sections goes into more detail.

### Understanding `destroySubjects` Extensions

These extensions are used to address the data to be deleted.
The extension should be as precise as possible in addressing to prevent wrong data to be deleted.
An example can be seen here:

```json
{
  "id": "77253ba4-8508-4965-a03f-7a2cc362fc96",
  "name": "std:sha256",
  "schema": "https://example.com/destroyclaims/extensions/std-sha256/schema",
  "payload": {
    "hash": "75567069b476cd19a3519dda77c802ce8b1daf7d6a50dfe0330a3dfa23972889"
  },
  "action": "f8dd3ea9-33ad-4c3f-bebd-2705cc187cbc",
  "comment": "This is the old PowerPoint template to be deleted."
}
```

Following is to be considered:

+ `destroySubjects` MUST have the fields `id`, `name`, and `payload`.
+ The fields `schema`, `comment`, `action`, and `conditions` are optional.
+ `action` contains a reference to an element in destroyActions.
If no action is defined or referenced in `destroyActions` the DCA MUST perform its default delete operation that works with the data addressed.
If `strictMode` is `true`, an action MUST be defined and MUST be referenced.
+ Using the field `conditions` we can influence the evaluation result.
We can tell that specific data subjects should be or should not be deleted depending on the evaluation result of other extensions.
We can, for example, say, that data A must not be deleted when data B can be deleted.

### Understanding `destroyConditions` Extensions  

This kind of extensions is used to provide an additional way of influencing the deletion of data.
As the name already gives away, we can define conditions that must or must not be met before deleting data.
Environmental states, such as location, time, or events are usually used as conditions.
An example can be seen here:

```json
{
  "id": "73d95e1f-0122-4ff2-8287-3b2eaa267b13",
  "name": "std:inTimeInterval",
  "schema": "https://example.com/destroyclaims/extensions/stf-in-time-interval/schema",
  "payload": {
    "from": "2021-10-05T14:48:00.000Z",
    "to": "2022-10-05T14:48:00.000Z"
  },
  "comment": "A specific time window when we need to delete the data"
}
```

The following is to be considered:

+ The extension for `destroyConditions` MUST have the fields `id`, `name`, and `payload`.
+ The fields `schema`, `comment`, and `conditions` are optional.
+ The field `conditions` can be used to couple the evaluation to other extensions.

### Understanding `destroyActions` Extensions

This kind of extension is used to describe what to do, when it comes to deleting data.
An action should be able to model all the necessary steps required for an end of data lifecycle in the given context.
This includes, for example, which algorithm should be used to delete the data.
But also, whether the deletion must be logged or certified.

>💡 An action does not always have to involve the deletion of data.
> If one sees archiving data as the end of the data lifecycle, then an archiving task may be executed.

An example can be seen here:

```json
{
  "id": "d815f135-8723-407b-9549-aae65dae9ae8",
  "name": "std:destructionLevel",
  "payload": {
    "destructionLevel": "physically destroyed"
  }
}
```

The following is to be considered:

+ The extension for `destroyActions` MUST have the fields `id`, `name`, and `payload`.
+ The fields `schema`, `comment`, and `conditions` are optional.
+ The field `conditions` can be used to deactivate actions.
An action MUST NOT be executed, if it evaluates to `false`.
Certain conditions may prevent the execution of certain actions.

### Understanding `destroyContacts` Extensions

These extensions are there to be able to define contact persons or organizations.
An example can be seen here:

```json
{
  "id": "77253ba4-8508-4965-a03f-7a2cc362fc96",
  "name": "std:agent",
  "schema": "https://example.com/destroyclaims/extensions/std-agent/schema",
  "payload": {
    "name": "Jon Doe"
  },
  "refs": ["7ad7f39c-7125-4f68-b4ee-7e06c7b15fce"],
  "comment": "Jon Doe has more insights regarding the topic."
}
```

Following is to be considered:
+ An extension for `destroyContacts` must have the fields `id`, `name`, `payload`, and `refs`.
+ The fields `schema`, `comment`, and `conditions` are optional.
+ `refs` is used to reference the destroy claim `id` or any other extension `id`.
It means, that that contact can give further information regarding the Destroy Claim or specific extension and desicions made there.
A `refs` element may point to any `id` that exists in the Destroy Claim.
+ `conditions` can be used to select contacts in certain situations.
For example if data is located in the USA, the contact person can be different than in Australia.
The condition should be written in a way, that it will result in `false` if the contact is not to be applied.

### Writing an Extension

To create a new extension the following things MUST be considered:

1. The extension needs a name.
To avoid collisions, the context in which the Destroy Claims are used should be known.
If the context is not clear or global, a globally unique identifier MUST be used.
2. The extensions payload MUST be described using a JSON schema.
The JSON schema MUST be accessible to the DCA.
This can be done by hosting the schema and providing a reference in the `schema` field.
The agent can also have a local copy of the schema and apply it by knowing which `name` belongs to which schema.
3. It must be defined what leads to a positive evaluation and what to a negative evaluation.
The agent must be able to implement this behavior.
E.g., if an extension defines a geolocation as condition for deletion, the extension must not only specify how the payload of the Destroy Claim looks like.
It must also specify which specific geolocation should be used to check against the payload (e.g., geolocation of the data or the agent?) and how the agent has to provide this data.
In the best case the extension also provides a detailed description of how the evaluation is done.
Sometimes the agent may want to implement things on its own or there are no implementations available for the specific programming language.
4. If possible, it should be described whether evaluation results can be cached.
For example, the fact that a certain event has occurred can be cached by the DCA so that it is not checked again and again.
However, this can only be the case if the evaluation result can no longer change.

## Destroy Claim Modes

Destroy Claims can be executed in different modes.
It is the task of the DCA to consider and implement these modes.
For each of the following mode combinations, at least one MUST be supported by the DCA.

### Normal Mode and Strict Mode

Destroy Claims can be evaluated in two different modes.
Normal mode is a more relaxed mode that allows more implicit modeling.
In strict mode, many things need to be modeled more explicitly and completely.
The strict mode can be set in the core of the Destroy Claim Model.
If `strictMode` is not set, the default value is `false`.
If the `strictMode` is `false`, the Destroy Claim is to be evaluated in normal mode.
If `strictMode` is set to `true`, the DCA has to reject the Destroy Claim in the following cases:

+ If `modelVersion` is not set or the specified version is not supported by the DCA (even if the used core schema would validate just fine).
+ If `simulationMode` is not set or the selected mode is not supported by the DCA.
+ If `manualMode` is not set or the selected mode is not supported by the DCA.
+ If `notificationMode` is not set or the selected mode is not supported by the DCA.
+ If there is any extension that is unknown to the DCA (even if it would not be needed for its deletion task).
+ If there is any reason in `destroyReasons` that is unknown to the DCA.
+ If there is any additional property that the DCA cannot understand.
+ If a reference in `action`, a reference in `conditions`, or a reference in `refs` is not part of the Destroy Claim (even if it would not be needed for its deletion task).

>💡 In normal mode the DCA MUST ignore the list above.

### Real Mode and Simulation Mode

Destroy Claims can be run in two environment modes.
In real mode, the DCA MAY work on the real data in the real environment.
In simulation mode, the DCA MUST NOT work on the real data in the real environment.
It is not specified how the DCA performs the simulation.
This can range from a simple mock to a real full-fledged simulation.
The simulation mode can be set in the core of the Destroy Claim Model.
If `simulationMode` is not set, the default value is `false`.
If the `simulationMode` is `false`, the Destroy Claim is to be executed in real mode.
If `simulationMode` is set to `true`, the DCA has to perform all actions as simulation.
If the DCA does not support the selected mode, it has to reject the Destroy Claim.

>💡A DCA MAY always run in simulation mode. 
> It MAY NOT reject Destroy Claims that demand real mode.

### Manual Mode and Automated Mode

Destroy Claims can be run in two execution modes.
In automated mode, the DCA MAY simply executed the Destroy Claim without seeking further consent from a human actor.
In manual mode the, the DCA MUST obtain the user's consent.
It is up to the DCA to decide how and by whom to obtain consent.
The only requirement is that a human actor gives consent.
The consent is always given for the whole Destroy Claim.
If `manualMode` is not set, the default value is `false`.
If the `manualMode` is `false`, the Destroy Claim is to be executed in automated mode.
If `manualMode` is set to `true`, the DCA has to ask a human actor for consent.
If the DCA does not support the selected mode, it has to reject the Destroy Claim.

>💡 A DCA MAY always ask users for consent even in automated mode.

### Notification Mode and Silent Mode

Destroy Claims can be run in two user attention modes.
In notification mode, the DCA MUST inform about the execution of a Destroy Claim.
If the DCA has a user interface, this might be done using a pop-up notification.
If the DCA has no user interface, it may inform using emails.
In silent mode, the DCA SHOULD NOT inform a human actor.
If `notificationMode` is not set, the default value is `false`.
If the `notificationMode` is `false`, the Destroy Claim is to be executed in silent mode.
If `notificationMode` is set to `true`, the DCA has to inform a human actor.
If the DCA does not support the selected mode, it has to reject the Destroy Claim.

>💡 A DCA MAY inform users even in silent mode.

## Signing Destroy Claims

A Destroy Claim can contain a digital signature.
This signature can be used to validate the integrity and trustworthiness of the Destroy Claim in a public environment.

### Requirements for the Destroy Claims

+ [JWS](http://tools.ietf.org/html/rfc7515) MUST be used to sign the Destroy Claim.
+ A signed Destroy Claim MUST include a JWS.
+ The signature MUST be included in the `signature` field.
+ The Destroy Claims MUST use the \ac{JWS} Compact Serialization.
+ The Destroy Claim MUST have its syntax validated before signing using the official JSON Schema.
+ As long as the signature generator and signature validator understand each other, any JWS procedure can be used.
+ To increase interoperability, a \ac{RSA} + \ac{SHA} procedure ("RS256", "RS384", or "RS512") SHOULD be used in combination with X.509 certificates.

### Requirements to the DCA and Environment

+ The DCA/environment MUST reject Destroy Claims with non-valid signatures.
+ The DCA/environment SHOULD indicate that they reject the Destroy Claim because of an invalid signature.
+ The DCA/environment SHOULD validate the signature according to the applied procedure.
+ The DCA/environment SHOULD check the in \ac{JWS} included payload against the plain text Destroy Claim.

### Example

The following is a brief example on how to sign a Destroy Claim.

Example Destroy Claim

```json
{
  "id": "destroyclaim:uuid:02faafea-1c31-4771-b90b-2e8380af06dd",
  "title": "Delete the old PowerPoint with old CI",
  "what": [
    {
        "§extension": "sha256FileContent",
        "§payload": {
            "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b"
        }
    }
  ]
}
```

Example Private Key

```text
-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBANXGiTD01FlglvEXVCwm+xE0FDZa6e4OV44xfVmCS6Ujj7LVv+f0JoE7Q2OFZ99jp8jc/70xR1EsNeqMkFTQdB8eXasSvhZxDQBdmwkDSQ1VAQQHm+dWmcXTzJ82DTlU93B/eYv0zZPRL6ivL/HhkAzmTKoyi0FP/yYsq3YZqIifAgMBAAECgYEA0VOH0P1b1WzkQI10aYt9+vmA9TyOpgE7MMw7DuOsCLdKpXXyZUHIVnDeatwduzuM9v2YGfzf9ZcR8GrVhYdcu7XA4P7snEqFyOvcv9loyYWY0ZccbFudBX/e/1X2RIW8HBaHZddPriqUKZOaTkEPpnxqlc+0yCQELDxuWWXy1WkCQQDtioKdfK0FMO095Bn9rAag+nntD/WvRyFmxDVhdCkrPhWdoHo0VmMmPOkEvwA4f7oc4WVC7ZiIzMqGcQ9DVVglAkEA5mM/4iy3AtTN+OOL1l/hNwvH0jbQ8iSfSs6xTi/TXw2o6q6eXWlII6gZDZf4l5p0r9gHxrIzS+aW/ZHXjy8wcwJANcyIFpkVKrbRFJJj3JMokS8JjEpwD3mhs/++Q0smw9d019VvuAjUveVPtTZ5G1K6WS4nXAgp4tnXCKn0lgBvTQJAP9NHI3WXzeT+mvEPEHjHf+R3mzkscajLqIHShQKi4DZ8kWeG4AIGxjoPlsB/UiCsKvsCTH2Z0HE1a1I4EabVGQJAIC4ik0lkG6RvbvxbXrIGxdicZq/l1luTMYvodoWWzbqGJdefKtCbYIzHX372WpkJP4/hICEQadvN0hZT2keE0g==
-----END PRIVATE KEY-----
```

Example X.509 Cert

```text
-----BEGIN CERTIFICATE-----
MIICVDCCAb2gAwIBAgIBADANBgkqhkiG9w0BAQ0FADBHMQswCQYDVQQGEwJ1czEQMA4GA1UECAwHR2VybWFueTEPMA0GA1UECgwGRGFUZWJlMRUwEwYDVQQDDAxEZXN0cm95Q2xhaW0wHhcNMjIxMDE4MTA1NjQ5WhcNMjMxMDE4MTA1NjQ5WjBHMQswCQYDVQQGEwJ1czEQMA4GA1UECAwHR2VybWFueTEPMA0GA1UECgwGRGFUZWJlMRUwEwYDVQQDDAxEZXN0cm95Q2xhaW0wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBANXGiTD01FlglvEXVCwm+xE0FDZa6e4OV44xfVmCS6Ujj7LVv+f0JoE7Q2OFZ99jp8jc/70xR1EsNeqMkFTQdB8eXasSvhZxDQBdmwkDSQ1VAQQHm+dWmcXTzJ82DTlU93B/eYv0zZPRL6ivL/HhkAzmTKoyi0FP/yYsq3YZqIifAgMBAAGjUDBOMB0GA1UdDgQWBBT6m7wsEWWI+2lGNHXlEsdsN7EvAjAfBgNVHSMEGDAWgBT6m7wsEWWI+2lGNHXlEsdsN7EvAjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBDQUAA4GBACij1G+0FPsXF/ve7tuqmTxfViJos9vozwR85jvJrUzTEFyTJFqB1xmrk/VVBwjG5zg92/j+PDT6ijCwSAEb2ueqorhtdaTGwNWafi9W7t2RwXemoo6oF2ioo/p6HkoFuh7QQfQ0Rh9VQqUso4nmFzvYLpcnPBuHbe3xWyTWEp3Z
-----END CERTIFICATE-----
```

JWS Signature

```text
eyJhbGciOiJSUzI1NiJ9.eyJpZCI6ImRlc3Ryb3ljbGFpbTp1dWlkOjAyZmFhZmVhLTFjMzEtNDc3MS1iOTBiLTJlODM4MGFmMDZkZCIsInRpdGxlIjoiRGVsZXRlIHRoZSBvbGQgUG93ZXJQb2ludCB3aXRoIG9sZCBDSSJ9.HWeztiWFjG6uSGIR2zoSGYl53IcwKm0e8qRW1U_SsAHVBdsqtTZQT7uXSUYTDT7dOJcKzk49dPyegHrgmywM-bkVBSIcyeAsngo4sv4IYc3kTH1VvSlEnAg3juWc6wlzu2JPU2JvAz7hCySzX-4w58T59_CiLurM-mMsbDuEoyY
```

Example signed destroy claim

```json
{
  "id": "destroyclaim:uuid:02faafea-1c31-4771-b90b-2e8380af06dd",
  "title": "Delete the old PowerPoint with old CI",
  "what": [
    {
        "§extension": "sha256FileContent",
        "§payload": {
            "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b"
        }
    }
  ],
  "signature": "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6ImRlc3Ryb3ljbGFpbTp1..."
}
```

## DCA: Evaluating and executing a Destroy Claim

The following explains the basic procedure for evaluating a Destroy Claim.
For these steps it makes no difference whether the Destroy Claim is processed manually or automatically.
Due to the extension system, it is not possible to define a general evaluation and execution guideline.
How an extension must be evaluated is to be taken from the documentation that MUST be provided alongside the extension.

### Pre-Check

Before the main evaluation process starts, some formalities MUST be checked.
If the formalities are not correct, further evaluation and execution of the Destroy Claim MUST NOT be performed.

1. Check if the Destroy Claim is to be evaluated in normal mode or strict mode.
If mode is not supported by the DCA, stop evaluation.
2. Validate the schema of the Destroy Claim using the JSON schema of the core model.
If `modelVersion` is set, check if that specific version is supported by the DCA and use the core schema of that version.
If `modelVersion` is not set or not supported and the Destroy Claim is evaluated in normal mode, try to validate against the most recent version of the schema.
If validation fails, stop evaluation.
If running in strict mode and `modelVersion` is not set or not supported, stop evaluation.
3. Check if the Destroy Claim is to be executed in real mode or simulation mode.
If mode is not supported by the DCA, stop evaluation.
4. Check if the Destroy Claim is to be executed in manual mode or automated mode.
If mode is not supported by the DCA, stop evaluation.
5. Check if the Destroy Claim is to be executed in notification mode or silent mode.
If mode is not supported by the DCA, stop evaluation.
6. If `strictMode` is `true`, the agent MUST test all points stated in [strict mode](#normal-mode-and-strict-mode) before moving on.
7. If any of the `conditions` fields contains the `id` of the element it belongs to, stop evaluation.
8. Check all `conditions` fields for cyclic dependencies. If you find a deadlock, stop evaluation.

### Interpreting `destroySubjects`

A `destroySubject` addresses the data under consideration.
The extension system is used here because there are practically infinite possibilities for addressing data.
A `destroySubject` extension must describe exactly how it addresses the data to be deleted.
A Destroy Claim MAY address multiple data points.
Various extensions can also be used.
The following should be considered when interpreting:

+ The DCA needs to evaluate all entries in the `destroySubjects` field.
If one of the checking steps fails, the evaluation for that specific extension element returns `false`.
If all checks pass, the evaluation returns `true`.
+ The evaluation includes four control steps.
  1. Check if the DCA knows the extension.
  2. Check whether the addressed data exists.
  3. Check if `conditions` is set and all referenced elements have been evaluated.
  If `conditions` is not set, evaluation is finished, and the value depends only on the existence of the data.
  If `conditions` is set but not all dependencies are evaluated, come back later.
  If `conditions` is set and all dependencies are evaluated, calculate result using Boolean algebra ([JSONLogic](https://jsonlogic.com/)).
  4. The evaluation value of the whole `destroySubject` is this existence evaluation and the conditions evaluation combined using a Boolean `AND`.
+ Not all evaluations necessarily have to have a positive outcome.
Whether the DCA has to support certain extensions and delete certain data depends on the `conditions`.
Sometimes conditions forbid the deletion of a subject, and by luck it was also a subject with an unsupported extension.
Remember, this is still not allowed in strict mode.
By default all `destroySubjects` are connected by a Boolean `AND`, if the root `conditions` field is not set.
In the following case the DCA needs to know both extensions and needs to confirm the existence of both data.

  ```json
  {
    "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
    "isActive": true,
    "destroySubjects": [
      {
        "id": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8",
        "name": "std:sha256",
        "payload": {
          "hash": "8d5d33cf0..."
        }
      },
      {
        "id": "c42c35ab-6fa3-4639-a860-0ea28ee1b6c6",
        "name": "thirdparty:md5FileContent",
        "payload": {
          "hash": "4746bbbd02bb590f379be8945e5da5cd"
        }
      }
    ]
  }
  ```

  The next example shows a Destroy Claim where the DCA does only need to know one of the two extensions.
  This is because of the Boolean OR that is used to combine the two `destroySubjects` elements.
  If the DCA is capable of handling and deleting one of the `destroySubjects`, it is sufficient to fulfill its task.

  ```json
  {
    "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
    "isActive": true,
    "destroySubjects": [
      {
        "id": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8",
        "name": "std:sha256",
        "payload": {
          "hash": "8d5d33cf0..."
        }
      },
      {
        "id": "c42c35ab-6fa3-4639-a860-0ea28ee1b6c6",
        "name": "thirdparty:md5FileContent",
        "payload": {
          "hash": "4746bbbd02bb590f379be8945e5da5cd"
        }
      }
    ],
    "conditions": {
      "or": [
        {"var": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8"}
        {"var": "c42c35ab-6fa3-4639-a860-0ea28ee1b6c6"}
      ]
    }
  }
  ```

  When all evaluations result in a `true`, the DCA can go on an delete the data.
  Of course, this applies only to the data for which it knows the extension and has evaluated it as `true`. 
+ It is possible to address the same data using different extensions.
The DCA SHOULD try to delete the data if it understands the extension and the evaluation of the condition forces it to do so.
During execution, data may have already been deleted and it is no longer possible to delete the same data using another extension.
This is fine, because we wanted to delete the data anyway.

  >💡If data has already been deleted by someone else (e.g., because of a race condition), the DCA MAY ignore this.
  >Depending on the context, the DCA MAY also react differently.
  >There is no general solution strategy here.


### Interpreting `destroyConditions`

`destroyConditions` give the possibility to formulate conditions that have to be fulfilled before a Destroy Claim is executed.
The extension system is used here because there are practically infinite possibilities for conditions.
A `destroyCondition` extension MUST describe exactly how a condition is defined and how it is evaluated by the DCA.
A Destroy Claim MAY have multiple conditions.
Various extensions can also be used.
The following should be considered when interpreting:

+ The agent needs to evaluate all entries in the `destroyConditions` field.
If one of the checking steps fails, the evaluation for that specific extension element return `false`.
If all checks pass, the evaluation returns `true`.
+ The evaluation has four steps:
  1. Check if the DCA knows the extension.
  2. Evaluate the extension in regards to the given `payload`.
  3. Check if `conditions` is set and all referenced elements have been evaluated.
  If `conditions` is not set, evaluation is finished, and the value depends on `payload` evaluation only.
  If `conditions` is set but not all dependencies are evaluated, come back later.
  If `conditions` is set and all dependencies are evaluated, calculate result using boolean algebra [JSONLogic](https://jsonlogic.com/)).
  4. The evaluation value of the whole `destroyCondition` is this payload evaluation and the conditions evaluation combined using a Boolean `AND`.

+ Not all evaluations necessarily have to have a positive outcome.
Whether the DCA has to delete certain data depends on the `conditions` written.
Sometimes conditions forbid the deletion of a subject.
`destroyConditions` must be explicitly mentioned in the `conditions` fields of other extensions.
If `destroyConditions` are not mentioned in any of the `conditions` fields, there SHOULD be a warning displayed while designing the Destroy Claim.
In the follwing case the `destroyConditions` both needs to evaluate to `true`.
  ```json
  {
    "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
    "isActive": true,
    "destroySubjects": [
      {
        "id": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8",
        "name": "std:sha256",
        "payload": {
          "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b"
        },
        "conditions": {
          "and": [
            { "var": "049ad387-35b9-4272-9954-51d0d8c1f16e" },
            { "var": "44292930-2c80-48d5-b525-bde35eb81da3" }
          ]
        }
      }
    ],
    "destroyConditions": [
      {
        "id": "049ad387-35b9-4272-9954-51d0d8c1f16e",
        "name": "std:inTimeInterval",
        "payload": {
          "from": "2022-07-21T09:35:31.820Z",
          "to": "2022-08-222T19:02:11.000Z"
        }
      },
      {
        "id": "44292930-2c80-48d5-b525-bde35eb81da3",
        "name": "std:inGeoLocation",
        "payload": {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "coordinates": [
                  [
                    [
                      9.19149872439084,
                      43.16399159051218
                    ],
                    [
                      8.112577339422984,
                      42.10073907850375
                    ],
                    [
                      9.030915076395473,
                      41.26499731035668
                    ],
                    [
                      10.250347153359826,
                      41.74977689739501
                    ],
                    [
                      9.577903127379358,
                      43.16765177784765
                    ],
                    [
                      9.19149872439084,
                      43.16399159051218
                    ]
                  ]
                ],
                "type": "Polygon"
              }
            }
          ]
        }
      }
    ]
  }
  ```

  The next example shows a Destroy Claim where only one `destroyConditions` element must evaluate to `true`.
  This is because of the Boolean `OR` that is used to combine the two `destroyConditions` elements.

  ```json
    {
    "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
    "isActive": true,
    "destroySubjects": [
      {
        "id": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8",
        "name": "std:sha256",
        "payload": {
          "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b"
        }
        "conditions": {
          "and": [
            {"var": "37f699d4-2f41-4a82-b22a-ef7ea6d102d8"},
            "or": [
              {"var": "049ad387-35b9-4272-9954-51d0d8c1f16e"},
              {"var": "44292930-2c80-48d5-b525-bde35eb81da3"}
            ]
          ]
        }
      }
    ],
    "destroyConditions": [
      {
        "id": "049ad387-35b9-4272-9954-51d0d8c1f16e",
        "name": "std:inTimeInterval",
        "payload": {
          "from": "2022-07-21T09:35:31.820Z",
          "to": "2022-08-222T19:02:11.000Z"
        }
      },
      {
        "id": "44292930-2c80-48d5-b525-bde35eb81da3",
        "name": "std:inGeoLocation",
        "payload": {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "coordinates": [
                  [
                    [
                      9.19149872439084,
                      43.16399159051218
                    ],
                    [
                      8.112577339422984,
                      42.10073907850375
                    ],
                    [
                      9.030915076395473,
                      41.26499731035668
                    ],
                    [
                      10.250347153359826,
                      41.74977689739501
                    ],
                    [
                      9.577903127379358,
                      43.16765177784765
                    ],
                    [
                      9.19149872439084,
                      43.16399159051218
                    ]
                  ]
                ],
                "type": "Polygon"
              }
            }
          ]
        }
      }
    ]
  }
  ```

>💡 It is possible that conditions contradict each other. 
>This should be checked at design time. 
>Of course, the DCA will not be executed in the event of an objection.

### Interpreting `destroyActions`

A list of actions can be specified here.
Since actions can be very diverse, they are modeled with extensions.
A subject can only ever be deleted with one action.
It may be that the DCA supports the action only in certain constellations.
For example, it can wipe data but not physically destroy the hard disk.
Therefore, the DCA has to check if it knows the extension and if it can execute the action in combination with the provided `payload`.

This may evaluate to `true`:
```json
{
  "id": "d815f135-8723-407b-9549-aae65dae9ae8",
  "name": "destructionLevel",
  "payload": {
    "destructionLevel": "wiped"
  }
}
```

This may evaluate to `false`:
```json
{
  "id": "d815f135-8723-407b-9549-aae65dae9ae8",
  "name": "destructionLevel",
  "payload": {
    "destructionLevel": "physically destroyed"
  }
}
```

+ The DCA MAY ignore unknown extensions here, if the action is not used (e.g., because the subject specifying the action evaluated to `false`).
This does not apply in strict mode.  
+ The evaluation has four steps:
  1. Check if the extension is supported.
  2. Evaluate the extension in regards to the given `payload`.
  The DCA has to check if it could execute the action under the given conditions and parameters.
  3. Check if `conditions` is set and all referenced elements have been evaluated.
  If `conditions` is not set, evaluation is finished and the value depends on the payload.
  If `conditions` is set but not all dependencies are evaluated, come back later.
  If `conditions` is set and all dependencies are evaluated, calculate result using boolean algebra ([JSONLogic](https://jsonlogic.com/)).

### Interpreting `destroyContacts`

A list of contacts can be specified here.
No specifications are made as to what these contacts should look like.
Therefore extensions are used here.
The field `refs` is specific to extensions in the `destroyContacts` field.
There, one can reference which parts of the Destroy Claim this contact is responsible for.

Furthermore:

+ If \texttt{strictMode} is \texttt{false}, the DCA MAY ignore unknown extensions here.
+ If \texttt{strictMode} is \texttt{false}, the DCA MAY ignore references to non existing \texttt{id}s.
+ If the DCA provides a user interface, it SHOULD provide a view where the contacts and their responsibilites are listed.
+ The evaluation has two steps:
  1. Check if the extension is supported.
  If yes, the evaluation defaults to `true`.
  2. Check `conditions` if set.
  If conditions evaluate to `false`, this contact is not to be applied.
  If conditions evaluate to `true`, this contact is to be applied.

### Interpreting `destroyReasons`

The `destroyReasons` MAY cause the DCA to behave differently.
This guide cannot make any specifications in this regard.
If a reason is used to achieve a different behavior by the DCA, it is important to document and standardize this.
If Destroy Claims are to be used in a larger context, the reasons should be addressable via IRI.
The deletion reason MUST NOT have any influence on the other evaluation processes.
The reason MAY trigger side tasks.

Some ideas are:

+ When the reason has to do with `security`, the security responsible of a company may be informed.
  ```json
  [
    "https://example/destroyclaim/reasons/security/integrity/malicious-data"
  ]
  ```

+ When the reason has to do with `gdpr`, the deletion process will be recorded and signed
  ```json
  [
    "https://example/destroyclaim/reasons/compliance/laws/data-protection/gdpr"
  ]
  ```
+ ...

### Interpreting `conditions`

Conditions can be used to influence the outcome of the Destroy Claim and extension evaluation.
The `conditions` use the `id` field of the extensions as a reference.
Boolean algebra is used to formulate the conditions.
The values injected in a `conditions` statement are the evaluation results of the referenced extensions. 
To model `conditions`, [JSONLogic](https://jsonlogic.com/) is used.
An Example can be seen here:

```json
{    
  "conditions": {
    "or": [
      { "var": "35f33c3d-50e2-4b33-bd23-2230d5445fc2" },
      { "var": "c7ccae45-3276-426a-a7f1-6f90630a47a2" }
    ]
  }
}
```

The following applies:

+ The DCA MUST check if it supports all operators and reject a Destroy Claim if it does not.
+ The DCA MUST reject Destroy Claims with cyclic dependencies over different `conditions` fields.
+ The DCA MUST reject destroy claims where references are not linked to an extension.
+ The DCA MUST reject Destroy Claims where in `conditions` of an extension there is a reference to itself.
+ When `conditions` is not set in the root of the Destroy Claim, the DCA MUST combine all extension evaluations of `destroySubjects` with a Boolean `AND`.
+ The DCA MUST first evaluate conditions in extensions.
+ The DCA SHOULD support at least `AND` and `OR`.

>💡 When `conditions` is not set in an extension, the evaluation is just depending on the extensions inner evaluations logic.

>⚠️ If `conditions` is used, there may be cyclic dependencies that lead to deadlocks. 
>Ideally, these should already be checked at the producer side on design-time.
>However, a DCA SHOULD check for deadlocks on its own, when deadlocks cannot be ruled out.

### Pre-Execution

If all evaluations were positive, we can now decide if the Destroy Claim will be executed.
For this, the values of `isActive` and `expirationDate` MUST be checked.

+ If `isActive` is `true` `AND` `expirationDate` is in the future or not set, the Destroy Claim MAY be executed.
+ If it is `false` `OR` `expirationDate` is in the past, the Destroy Claim MUST NOT be executed.

### Execution

The execution of the Destroy Claim is the responsibility of the DCA.
If all previous evaluations are positive, the DCA MAY perform the execution of the Destroy Claim.
The DCA must consider the following when executing:

+ The DCA MUST perform the `action` described in the Destroy Claim.
+ If no `action` is defined, the DCA MUST use its default action.
+ If an `action` cannot be performed (e.g. due to an error, or because the data was deleted during the interpretation process) the DCA SHOULD raise an alarm.
An alarm can be an Email to a responsible person set in `destroyContacts` or a fixed responsible of the DCA software.
+ If the DCA is to delete more than one subject and one or more subjects cannot be deleted, then the already deleted dates MAY be restored.

## Examples
In this section, examples of Destroy Claims are presented.
They are intended to give an impression of what both simple and more complex Destroy Claims look like.
Extensions from the standard library (`std`) are used.
More information on this can be found [here](../docs/std-extensions.md).

### Small Example

The following example shows one of the shortest valid Destroy Claims.
It contains a unique `id`, `isActive` and a data object to be deleted, which is identified by the extension `std:sha256` using SHA256 as content hash.

```json
{
  "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
  "isActive": true,
  "destroySubjects": [
    {
      "id": "40133723-9adf-47b7-80f5-3281fbae8dfc",
      "name": "std:sha256",
      "payload": {
        "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b"
      }
    }
  ]
}
```

### More complex Example

The following example shows one of the more complex Destroy Claims.
This example is about retiring an outdated PowerPoint template.
For this purpose, instances of the template are to be deleted so that users do not accidentally build a new presentation with the old style.
`title`, `description` and `keywords` provide a human actor a good insight into the context of the deletion request.
If questions remain unanswered, you can contact `John Doe` and `Jane Roe`, who are listed under `destroyContacts`.
`John Doe` is the contact person when it comes to the Destroy Claim itself.
He can answer questions about why the data should be deleted and what alternative data services may be available.
`Jane Roe` is the contact person for the data to be deleted.
She can answer questions regarding content.
If you want to know why the data should be deleted, this can be looked up in `destroyReasons`.
Here it is listed that the data is on the one hand outdated and on the other hand no longer has any value for the company.
The data itself is addressed under `destroySubjects` with the `std:sha256` extension.
This extension addresses data by its SHA256 content hash.
If a DCA understands this extension it can check its existence and may delete it.
In this case there are conditions under which the data should be deleted.
If the template is located in Germany, it should be deleted immediately.
For all other countries, there is a transition period in which the deletion will not take place until 2024.
If one of the conditions is met, the data is deleted with the `std:destructionLevel` action.
In this case, the data is simply deleted without further measures.

```json
{
  "id": "02faafea-1c31-4771-b90b-2e8380af06dd",
  "isActive": false,
  "strictMode": false,
  "title": "Delete PowerPoint Template with old CI",
  "description": "A new PowerPoint Template with new CI was generated. In Germany the old template should be taken out of circulation immediately. All other countries have a transition period.",
  "keywords": ["ci", "powerpoint", "template", "design"],
  "destroyContacts": [
    {
      "id": "0aef0f41-41f1-4cd3-8c1f-d974e64779f8",
      "name": "std:agent",
      "payload": {
        "name": "John Doe",
      },
      "refs": ["02faafea-1c31-4771-b90b-2e8380af06dd"],
      "comment": "He is responsible for the new CI and that the old CI needs to be removed in our company",
    },
    {
      "id": "6f868cd2-6253-4808-8a2b-3ab190a1e4be",
      "name": "std:agent",
      "payload": {
        "name": "Jane Roe",
      },
      "refs": ["7d58d622-a6b2-49f9-91ef-1ea79f96edb1"],
      "comment": "She knows a lot about the PowerPoint Template",
    },
  ],
  "destroyReasons": [
    "https://example.com/destroyclaim/reasons/data-quality/contextual-data-quality/timeliness",
    "https://example.com/destroyclaim/reasons/organizational/economics/lack-of-value",
  ],
  "destroySubjects": [
    {
      "id": "7d58d622-a6b2-49f9-91ef-1ea79f96edb1",
      "name": "std:sha256",
      "payload": {
        "hash": "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b",
      },
      "comment": "This is the PowerPoint template to be deleted",
      "conditions": {
        "or": [
          { 
            "and": [
              { "var": "35f33c3d-50e2-4b33-bd23-2230d5445fc2" },
              { "var": "ef727a15-5c4a-489d-903b-1ca6bc2dab4c" },
            ]
          },
          { "var": "c7ccae45-3276-426a-a7f1-6f90630a47a2" },
        ],
      },
      "action": "d815f135-8723-407b-9549-aae65dae9ae8",
  ],
  "destroyConditions": [
    {
      "id": "35f33c3d-50e2-4b33-bd23-2230d5445fc2",
      "name": "std:validFromDate",
      "payload": {
        "from": "2024-01-01T00:00:00.000Z",
      },
    },
    {
      "id": "c7ccae45-3276-426a-a7f1-6f90630a47a2",
      "name": "std:insideAlpha3Location",
      "payload": {
        "alpha3": "DEU",
      },
    },
    {
      "id": "ef727a15-5c4a-489d-903b-1ca6bc2dab4c",
      "name": "std:outsideAlpha3Location",
      "payload": {
        "alpha3": "DEU",
      },
    },
  ],
  "destroyActions": [
    {
      "id": "d815f135-8723-407b-9549-aae65dae9ae8",
      "name": "std:destructionLevel",
      "payload": {
        "destructionLevel": "deleted",
      },
    },
  ],
  "signature": "eyJpZCI6ImRlc3Ryb3ljbGFpb...",
}
```
