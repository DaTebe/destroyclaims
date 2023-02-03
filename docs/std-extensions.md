# Standard Extensions

## Table of Content

+ [Introduction](#introduction)
+ [Extensions](#extensions)
  + [std:agent](#stdagent)
  + [std:sha256](#stdsha256)
  + [std:uuidv4](#stduuidv4)
  + [std:destructionLevel](#stddestructionlevel)
  + [std:fromPointInTime](#stdfrompointintime)
  + [std:toPointInTime](#stdtopointintime)
  + [std:inTimeInterval](#stdintimeinterval)
  + [std:dcaHasProperty](#stddcahasproperty)
  + [std:alpha3CountryCode](#stdalpha3countrycode)
  + [std:geoLocation](#stdgeolocation)

## Introduction

In order to be able to use Destroy Claims in a meaningful way, it is necessary that at least a certain amount of extensions is standardized.
Standardization allows Destroy Claims to be exchanged and understood across systems and companies.
For this reason, the Destroy Claim Model Specification offers a number of standard extensions.
The extensions are largely independent of the Destroy Claim Model Specification.
Therefore, the standard library can continue to grow independently.
Changes to the way extensions are represented in Destroy Claims will of course effect these.
The standard library is also versioned so that a compatibility assignment can take place in the course of its development.
The standard library primarily tries to design extensions as simple and universal as possible. 
For this reason, as of today, no extensions are included that are designed for specific technologies.

## Extensions

This section describes the extensions provided by the standard library.

### `std:agent`

> 🛎️ This is a `destroyContacts` and `destroyConditions` extension

> 🧬 v1.0.0

This extension describes a natural or legal person.
It can be used to model a contact for the Destroy Claim itself or any other part of it.
Furthermore, the extension can be used in Destroy Conditions.
There, the extension can be used to model that data should only be deleted by certain persons.

> 💡 If a DCA needs to support this extension as Destroy Condition, it must be assigned to one or more agents.
> For example, John Doe has an employee laptop. 
> On login the DCA will automatically be assigned to John.
> If a Destroy Claim then contains a condition that references John Doe, the DCA can respond accordingly.
> If a DCA is running on a server, you may statically assign an agent.

|field name|required|description|type|example|
|---|---|---|---|---|
|`name`|MUST|This is a human readable name of the natural or legal person.|`String`|`John Doe`|
|`mbox`|SHOULD|This is the email address where the person to contact can be reached.|`<email>String`|`john.doe@example.com`|
|`homepage`|MAY|Sometimes contacts have their own website as a first point of contact. The website can be added here.|`<url>String`|`https://example.com/johndoe`|
|`img`|MAY|For some DCA it makes sense to display a picture as well. The image can be stored here as a hyperreference or base64 string.|`<url\|base64>String`|`https://example.com/johndoe/avatar`|

### `std:sha256`

> 🛎️ This is a `destroySubjects` extension

> 🧬 v1.0.0

This extension can be used to address data based on its content.
The SHA256 hash method is used for this purpose.
It offers a sufficiently low collision rate to address data unambiguously on the basis of its content.
In general, this extension can be used for all types of data.
Especially file-based data are to be mentioned here.

> 💡 For example, a DCA can maintain an index of data with corresponding hashes.

|field name|required|description|type|example|
|---|---|---|---|---|
|`hash`|MUST|UUIDv4|`String`|`0dade23a4a9b8ac7cfb3...`|

### `std:uuidv4`

> 🛎️ This is a `destroySubjects` extension

> 🧬 v1.0.0

This extension can be used to address data based on a UUID.
In data management systems, universal unique IDs are often used to identify data sets.
If this is done with UUIDv4, this extension can be used to address data.

|field name|required|description|type|example|
|---|---|---|---|---|
|`uuid`|MUST|UUIDv4 pointing to data |`String`|`baf2bed3-8f78-4d01-9ce6-7d24ebd560cd`|


### `std:destructionLevel`

> 🛎️ This is a `destroyActions` extension

> 🧬 v1.0.0

This extension is used to describe the degree of technical deletion of the data under consideration.
Five different levels of deletion are offered.

+ `recycled`: The data should be moved to the recycle bin only.
If the data is in a database, it should be moved to a special "recycle" table/database.
+ `deleted`: In this level, data is marked as deleted.
For files, this is done by the operating system.
Usually the data remains on the hardware and is overwritten by new data at some point by chance.
Special tools can often be used to restore the data.
That the data existed is traceable by existing metadata.
In database a soft delete flag SHOULD be used.
+ `metadata destroyed`: At this level, the metadata is also deleted.
However, the data remains on the hardware until it is overwritten.
Restoring requires reading the entire hardware, since the location of the data pieces is unknown.
+ `wiped`: The data must be erased from the hardware using a special erasure method that guarantees that the data cannot be recovered.
An example of such a method is the Gutmann algorithm.
+ `physically destroyed`: The hardware on which the data is physically stored must be destroyed.
Usually, a DCA will not be able to perform this level.

> 💡 A DCA does not have to support all levels to support the extension itself.
> If a level is not supported, the DCA can return `false` when evaluating the extension.
> A DCA MAY also provide a notification.

|field name|required|description|type|example|
|---|---|---|---|---|
|`destructionLevel`|MUST|Level of data destruction. Enumeration: `recycled`, `deleted`, `metadata destroyed`, `wiped`, `physically destroyed`.|`String`|`wiped`|

### `std:fromPointInTime`

> 🛎️ This is a `destroyConditions` extension

> 🧬 v1.0.0

This extension is used when you want to delete data from a certain point of time.  

|field name|required|description|type|example|
|---|---|---|---|---|
|`from`|MUST|Point in time at which the deletion starts. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2022-12-01T00:00:00.000Z`|

### `std:toPointInTime`

> 🛎️ This is a `destroyConditions` extension

> 🧬 v1.0.0

This extension is used when you want to delete data until a certain point in time.

|field name|required|description|type|example|
|---|---|---|---|---|
|`to`|MUST|Point in time from which the data should no longer be deleted. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2022-12-01T00:00:00.000Z`|

### `std:dcaProperty`

> 🛎️ This is a `destroyConditions` extension

> 🧬 v1.0.0

This extension aims to allow data to be deleted if the DCA has or has not a certain property.
The property is generically encoded as string.
For example, a DCA can be given the property that it is part of a department or other type of group.

|field name|required|description|type|example|
|---|---|---|---|---|
|`property`|MUST|In this field a property is coded as a string.|`String`|`departmentA`|
|`has`|MUST|Specifies whether the DCA must or must not have the property.|`Boolean`|`true`|

> ⚠️ This extension has potential to produce unexpected behavior.
> The extension depends on self-selected and coded properties.
> It is recommended to code the properties uniquely.
> In a global context, the properties should be bound to IRIs that you control.
> Otherwise, there is potential for miscommunication.

### `std:alpha3CountryCode`

> 🛎️ This is a `destroyConditions` extension

> 🧬 v1.0.0

This extension allows to model if data should be deleted inside or outside to a country.
The extension here refers to the physical location of the data.
The DCA must be able to determine the physical location of the data. 
It can be specified whether the data should be deleted inside or outside the country.

|field name|required|description|type|example|
|---|---|---|---|---|
|`code`|MUST|Alpha3 code of a country. According to [ISO-3166-1](https://www.iso.org/iso-3166-country-codes.html).|`<alpha3>String`|`JPN`|
|`scope`|MUST|Specify whether to delete inside or outside the country. Enumeration: `inside`, `outside`|`String`|`inside`|

> ⚠️ There may be special cases where parts of the data are in different countries.
> You MUST use the extension several times to cover all possible countries where data fragments may be present.

### `std:geoLocation`

> 🛎️ This is a `destroyConditions` extension

> 🧬 v1.0.0

This extension models the physical position of the data using geometric figures on a world map.
[GeoJSON](https://geojson.org/) is used for this purpose.
The extension here refers to the physical location of the data.
The DCA must be able to determine the physical location of the data. 
It can be specified whether the data should be deleted inside or outside the modelled regions.

|field name|required|description|type|example|
|---|---|---|---|---|
|`location`|MUST|[GeoJSON](https://geojson.org/) encoded location.|`<GeoJSON>Object`|`JPN`|
|`scope`|MUST|Specify whether to delete inside or outside the GeoJSON location. Enumeration: `inside`, `outside`|`String`|`inside`|
