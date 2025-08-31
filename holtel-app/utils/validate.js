// validate.js
export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
export const validatePassword = (pw) => pw.length >= 6;
