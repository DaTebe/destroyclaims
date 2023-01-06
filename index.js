const SupportObjectGenerator = require("./src/modules/SupportObjectGenerator");
const DestroyClaim = require("./src/modules/DestroyClaim");
const DestroyClaimValidator = require("./src/modules/DestroyClaimValidator");
const {
  signDestroyClaim,
  validateSignedDestroyClaim,
} = require("./src/util/jwsDestroyClaim");

module.exports = {
  SupportObjectGenerator,
  DestroyClaim,
  DestroyClaimValidator,
  signDestroyClaim,
  validateSignedDestroyClaim,
};
