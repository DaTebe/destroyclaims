# Standard Extensions Library

## Table of Content

+ [Introduction](#introduction)
+ [Compatibility](#compatibility)
+ [Extensions](#extensions)
  + [std:agent](#stdagent)
  + [std:sha256](#stdsha256)
  + [std:destructionLevel](#stddestructionlevel)
  + [std:fromPointInTime](#stdfrompointintime)
  + [std:toPointInTime](#stdtopointintime)
  + [std:inTimeInterval](#stdintimeinterval)
  + [std:dcaHasProperty](#stddcahasproperty)
  + [std:alpha3CountryCode](#stdalpha3countrycode)
  + [std:geoLocation](#stdgeolocation)

## Introduction

In order to be able to use the destroy claims in a meaningful way, it is necessary that at least a certain amount of extensions is standardized.
Standardization allows destroy claims to be exchanged and understood across systems and companies.
For this reason, the destroy claim specification offers a number of standard extensions.
The extensions are largely independent of the destroy claim specification.
Therefore, the standard library can continue to grow independently.
Changes to the way extensions are represented in destroy claims will of course effect these.
For this reason, the standard library is also versioned so that a compatibility assignment can take place in the course of its development.
The standard library primarily tries to design extensions as simple and universal as possible. 
For this reason, as of today, no extensions are included that are designed for specific technologies.

## Compatibility

Currently the specification and the extensions are in the phase of a first release.
For this reason, there is full compatebility.
To ensure compatibility with other extensions, the standard library claimes the name prefix `std`.
A standard extension thus could be `std:agent`.

## Extensions

This section describes the extensions provided by the standard library.

### `std:agent`

> 🛎️ This is a `destroyContacts` and `destroyConditions` extension

This extension describes a natural or legal person.
The extension can be used to model contacts.
Furthermore, the extension can be used in conditions to model executors.

|field name|required|description|type|example|
|---|---|---|---|---|
|`name`|MUST|This is a human readable name of the natural or legal person.|`String`|`John Doe`|
|`mbox`|SHOULD|This is the email address where the person to contact can be reached.|`<email>String`|`john.doe@example.com`|
|`homepage`|MAY|Sometimes contacts have their own website as a first point of contact. The website can be added here.|`<url>String`|`https://example.com/johndoe`|
|`img`|MAY|For some DCA it makes sense to display a picture as well. The image can be stored here as a hyperreference or base64 string.|`<url\|base64>String`|`https://example.com/johndoe/avatar`|

### `std:sha256`

> 🛎️ This is a `destroySubjects` extension

This extension can be used to address data based on its content. The SHA256 hash method is used for this purpose.
It offers a sufficiently low collision rate to address data unambiguously on the basis of its content.
In general, this extension can be used for all types of data.
Especially file-based data are to be mentioned here.

|field name|required|description|type|example|
|---|---|---|---|---|
|`hash`|MUST|SHA256 hash of the data content.|`String`|`0dade23a4a9b8ac7cfb3...`|

### `std:destructionLevel`

> 🛎️ This is a `destroyActions` extension

This extension is used to describe the degree of deletion.
Five different levels of deletion are offered.

+ `recycled`: The data should be moved to the recycle bin only.
If the data is in a database, a soft delete would be equivalent.
+ `deleted`: In this level, data is marked as deleted.
For files, this is done by the operating system.
Usually the data remains on the hardware and is overwritten by new data at some point by chance.
Special tools can often be used to restore the data.
That the data existed is traceable by existing metadata.
+ `metadata destroyed`: At this level, the metadata is also deleted.
However, the data remains on the hardware until it is overwritten.
Restoring requires reading the entire hardware, since the location of the data pieces is unknown.
+ `wiped`: The data must be erased from the hardware using a special erasure method that guarantees that the data cannot be recovered.
An example of such a method is the Gutmann algorithm.
+ `physically destroyed`: The hardware on which the data is physically stored must be destroyed.
Usually, a DCA will not be able to perform this level.

|field name|required|description|type|example|
|---|---|---|---|---|
|`destructionLevel`|MUST|Level of data destruction. Enumeration: `recycled`, `deleted`, `metadata destroyed`, `wiped`, `physically destroyed`.|`String`|`wiped`|

### `std:fromPointInTime`

> 🛎️ This is a `destroyConditions` extension

This extension is used when you want to delete data only from a certain point of time.  

|field name|required|description|type|example|
|---|---|---|---|---|
|`from`|MUST|Point in time at which the deletion starts. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2022-12-01T00:00:00.000Z`|

### `std:toPointInTime`

> 🛎️ This is a `destroyConditions` extension

This extension is used when you want to delete data only until a certain point in time.

|field name|required|description|type|example|
|---|---|---|---|---|
|`to`|MUST|Point in time from which the data should no longer be deleted. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2022-12-01T00:00:00.000Z`|

### `std:inTimeInterval`

> 🛎️ This is a `destroyConditions` extension

With this extension time intervals can be modeled.
This allows to specify a time window in which the data must be deleted.
The DCA does not have to delete the data immediately.
If there is still time in the window, the DCA can postpone the deletion to a later time.
This can be useful if the DCA wants to perform the deletion with less expensive resources (e.g. unused Cloud CPU cycles).

|field name|required|description|type|example|
|---|---|---|---|---|
|`from`|MUST|Time at which the interval starts. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2022-12-01T00:00:00.000Z`|
|`to`|MUST|Time at which the interval stops. MUST be [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html).|`<ISO8601>String`|`2023-01-01T00:00:00.000Z`|

### `std:dcaHasProperty`

> 🛎️ This is a `destroyConditions` extension

This extension aims to allow data to be deleted if the DCA has certain properties.
The properties are generically encoded as strings.
So you can give a DCA for example the property that it is part of a department or other kind of group.

|field name|required|description|type|example|
|---|---|---|---|---|
|`property`|MUST|In this field a property is coded as a string.|`String`|`departmentA`|

> ⚠️ This extension has potential to produce unexpected behavior.
> The extension depends on self-selected and coded properties.
> It is recommended to code the properties uniquely.
> In a global context, the properties should be bound to IRIs that you control.
> Otherwise, there is potential for miscommunication.

### `std:alpha3CountryCode`

> 🛎️ This is a `destroyConditions` extension

This extension allows to model if data should be deleted inside or outside to a country.
The extension here refers to the physical location of the data.
The DCA must be able to determine the physical location of the data. 

|field name|required|description|type|example|
|---|---|---|---|---|
|`code`|MUST|Alpha3 code of a country. According to [ISO-3166-1](https://www.iso.org/iso-3166-country-codes.html).|`<alpha3>String`|`JPN`|
|`scope`|MUST|Specify whether to delete inside or outside the country. Enumeration: `inside`, `outside`|`String`|`inside`|

> ⚠️ There may be special cases where parts of the data are located in different countries.
> Here you have to use the extension several times to cover all possible countries.

### `std:geoLocation`

> 🛎️ This is a `destroyConditions` extension

This extension models the physical position of the data using Geometric Figures on the world map.
[GeoJSON](https://geojson.org/) is used for this purpose.
It can be determined whether the data should be deleted inside or outside the modeled regions.

|field name|required|description|type|example|
|---|---|---|---|---|
|`location`|MUST|[GeoJSON](https://geojson.org/) encoded location.|`<GeoJSON>Object`|`JPN`|
|`scope`|MUST|Specify whether to delete inside or outside the GeoJSON location. Enumeration: `inside`, `outside`|`String`|`inside`|
