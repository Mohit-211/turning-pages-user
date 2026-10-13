// Mirrors the backend password rules: at least 8 characters, at least 2 digits, no spaces.
export const passwordRule = {
  validator: (_, value) => {
    if (!value) return Promise.resolve();
    if (value.includes(" ")) {
      return Promise.reject("Password cannot contain spaces");
    }
    if (value.length < 8) {
      return Promise.reject("Password must be at least 8 characters long");
    }
    const digitMatches = value.match(/\d/g) || [];
    if (digitMatches.length < 2) {
      return Promise.reject("Password must contain at least 2 digits");
    }
    return Promise.resolve();
  },
};

export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
