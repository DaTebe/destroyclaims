const rs = require("jsrsasign");

const { JWS } = rs.jws;

/**
 * Generates signature and returns signed destroy claim
 * @param {Object} destroyclaim destroy claom to be signed
 * @param {String} key key to use for signing
 * @param {String} [password=null] password that is needed to decrypt the private key
 * @returns {Object} destroy claim with signature
 */
const signDestroyClaim = (destroyclaim, key, password = null) => {
  const prvKey = rs.KEYUTIL.getKey(key, password);
  const signature = JWS.sign(
    "RS256",
    JSON.stringify({ alg: "RS256" }),
    JSON.stringify(destroyclaim),
    prvKey
  );
  return {
    ...destroyclaim,
    signature,
  };
};

const validateSignedDestroyClaim = (destroyclaim, pubKey) => {
  if (!("signature" in destroyclaim)) {
    throw new Error("JWS Validation: destroy claim not signed");
  }
  const key = rs.KEYUTIL.getKey(pubKey);
  return JWS.verify(destroyclaim.signature, key, ["RS256"]);
};

module.exports = {
  signDestroyClaim,
  validateSignedDestroyClaim,
};
