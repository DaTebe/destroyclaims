/* eslint-disable no-undef */
/**
 * Module to be tested
 */
const {
  signDestroyClaim,
  validateSignedDestroyClaim,
} = require("../src/util/jwsDestroyClaim");

/**
 * Mock Data
 */
let exampleDestroyClaim;
beforeEach(async () => {
  exampleDestroyClaim = {
    id: "destroyclaim:uuid:02faafea-1c31-4771-b90b-2e8380af06dd",
    title: "Delete the old PowerPoint with old CI",
    what: [
      {
        "§extension": "sha256FileContent",
        "§payload": {
          hash: "8d5d33cf0917941602eecf16b34a0ab07d1ebf0c95d284557ebde921b46d5a1b",
        },
      },
    ],
  };
});

const exampleKey =
  "-----BEGIN PRIVATE KEY-----MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBANXGiTD01FlglvEXVCwm+xE0FDZa6e4OV44xfVmCS6Ujj7LVv+f0JoE7Q2OFZ99jp8jc/70xR1EsNeqMkFTQdB8eXasSvhZxDQBdmwkDSQ1VAQQHm+dWmcXTzJ82DTlU93B/eYv0zZPRL6ivL/HhkAzmTKoyi0FP/yYsq3YZqIifAgMBAAECgYEA0VOH0P1b1WzkQI10aYt9+vmA9TyOpgE7MMw7DuOsCLdKpXXyZUHIVnDeatwduzuM9v2YGfzf9ZcR8GrVhYdcu7XA4P7snEqFyOvcv9loyYWY0ZccbFudBX/e/1X2RIW8HBaHZddPriqUKZOaTkEPpnxqlc+0yCQELDxuWWXy1WkCQQDtioKdfK0FMO095Bn9rAag+nntD/WvRyFmxDVhdCkrPhWdoHo0VmMmPOkEvwA4f7oc4WVC7ZiIzMqGcQ9DVVglAkEA5mM/4iy3AtTN+OOL1l/hNwvH0jbQ8iSfSs6xTi/TXw2o6q6eXWlII6gZDZf4l5p0r9gHxrIzS+aW/ZHXjy8wcwJANcyIFpkVKrbRFJJj3JMokS8JjEpwD3mhs/++Q0smw9d019VvuAjUveVPtTZ5G1K6WS4nXAgp4tnXCKn0lgBvTQJAP9NHI3WXzeT+mvEPEHjHf+R3mzkscajLqIHShQKi4DZ8kWeG4AIGxjoPlsB/UiCsKvsCTH2Z0HE1a1I4EabVGQJAIC4ik0lkG6RvbvxbXrIGxdicZq/l1luTMYvodoWWzbqGJdefKtCbYIzHX372WpkJP4/hICEQadvN0hZT2keE0g==-----END PRIVATE KEY-----";
const exampleCert =
  "-----BEGIN CERTIFICATE-----MIICVDCCAb2gAwIBAgIBADANBgkqhkiG9w0BAQ0FADBHMQswCQYDVQQGEwJ1czEQMA4GA1UECAwHR2VybWFueTEPMA0GA1UECgwGRGFUZWJlMRUwEwYDVQQDDAxEZXN0cm95Q2xhaW0wHhcNMjIxMDE4MTA1NjQ5WhcNMjMxMDE4MTA1NjQ5WjBHMQswCQYDVQQGEwJ1czEQMA4GA1UECAwHR2VybWFueTEPMA0GA1UECgwGRGFUZWJlMRUwEwYDVQQDDAxEZXN0cm95Q2xhaW0wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBANXGiTD01FlglvEXVCwm+xE0FDZa6e4OV44xfVmCS6Ujj7LVv+f0JoE7Q2OFZ99jp8jc/70xR1EsNeqMkFTQdB8eXasSvhZxDQBdmwkDSQ1VAQQHm+dWmcXTzJ82DTlU93B/eYv0zZPRL6ivL/HhkAzmTKoyi0FP/yYsq3YZqIifAgMBAAGjUDBOMB0GA1UdDgQWBBT6m7wsEWWI+2lGNHXlEsdsN7EvAjAfBgNVHSMEGDAWgBT6m7wsEWWI+2lGNHXlEsdsN7EvAjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBDQUAA4GBACij1G+0FPsXF/ve7tuqmTxfViJos9vozwR85jvJrUzTEFyTJFqB1xmrk/VVBwjG5zg92/j+PDT6ijCwSAEb2ueqorhtdaTGwNWafi9W7t2RwXemoo6oF2ioo/p6HkoFuh7QQfQ0Rh9VQqUso4nmFzvYLpcnPBuHbe3xWyTWEp3Z-----END CERTIFICATE-----";
const exampleSig =
  "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6ImRlc3Ryb3ljbGFpbTp1dWlkOjAyZmFhZmVhLTFjMzEtNDc3MS1iOTBiLTJlODM4MGFmMDZkZCIsInRpdGxlIjoiRGVsZXRlIHRoZSBvbGQgUG93ZXJQb2ludCB3aXRoIG9sZCBDSSIsIndoYXQiOlt7IsKnZXh0ZW5zaW9uIjoic2hhMjU2RmlsZUNvbnRlbnQiLCLCp3BheWxvYWQiOnsiaGFzaCI6IjhkNWQzM2NmMDkxNzk0MTYwMmVlY2YxNmIzNGEwYWIwN2QxZWJmMGM5NWQyODQ1NTdlYmRlOTIxYjQ2ZDVhMWIifX1dfQ.mqH_h5roRJRWTLYdkuy0OHn9DOOrrCfyv4k3mzmdZknwZox83ohsWtDMYc4cXnp3wJDxRW7O1iGJelMCdeFyFp8vXC0s12DPDpTid34zbXVDewW9GcEqnsWBgzxQO4sxr84_QHXOjiwxL4QqqCHLU9EB2MChxDAN55CTFoelKeg";
const exampleInvalidSig =
  "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6ImRlc3Ryb3ljbGFpbTp1dWlkOjAyZmFhZmVhLTFjMzEtNDc3MS1iOTBiLTJlODM4MGFmMDZkZCIsInRpdGxlIjoiRGVsZXRlIHRoZSBvbGQgUG93ZXJQb2lufCB3aXRoIG9sZCBDSSJ9.Q1x0aWloffnlTdL3VmVpuM9S1nVh2jf0wB78jwp5qZ5Vrg3xRFQi90jWOWPKV1dBdvJoIWsMzuEaAX1mEsGyLz3Gaml1ih5kFjDeE68sfhyVxJuGYm4xjGzymtfNb8wva1I8wrqDytv2hrkJ0Xu9m8hCMq1gVyLqZ-ABEJ1e4DY";

/**
 * Tests
 */
test("Destroy Claim signature throws error on unsupported algorithm", () => {
  expect(() => {
    signDestroyClaim(exampleDestroyClaim, exampleRsaPrivateKey, "RS257");
  }).toThrow();
});

test("Destroy Claim signature is generated", () => {
  const signedDestroyClaim = signDestroyClaim(exampleDestroyClaim, exampleKey);
  expect(signedDestroyClaim.signature).toBeDefined();
  expect(signedDestroyClaim.signature).toMatch(exampleSig);
});

test("Destroy Claim signature is correct", () => {
  const signedDestroyClaim = signDestroyClaim(exampleDestroyClaim, exampleKey);
  expect(validateSignedDestroyClaim(signedDestroyClaim, exampleCert)).toBe(
    true
  );
});

test("Destroy Claim signature is incorrect", () => {
  exampleDestroyClaim.signature = exampleInvalidSig;
  expect(validateSignedDestroyClaim(exampleDestroyClaim, exampleCert)).toBe(
    false
  );
});

test("Destroy Claim not signed throws on validation", () => {
  expect(() =>
    validateSignedDestroyClaim(exampleDestroyClaim, exampleCert)
  ).toThrow();
});
