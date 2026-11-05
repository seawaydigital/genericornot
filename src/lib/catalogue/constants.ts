/**
 * Account that "authors" catalogue comparisons and evidence. The email is the
 * one the original seed used, so existing production rows are re-used.
 * It is a regular USER: nobody should be able to sign in as an admin by
 * controlling this mailbox.
 */
export const SYSTEM_USER_EMAIL = "admin@genericornot.com";
export const SYSTEM_USERNAME = "genericornot-team";
export const SYSTEM_DISPLAY_NAME = "GenericOrNot Team";
