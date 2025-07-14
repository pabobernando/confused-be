import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
export const comparePassword = async (plain, hashed) => {
    console.log("--- Entering comparePassword function ---");
    // WARNING: Do NOT log 'plain' (plain text password) or 'hashed' (hashed password) in production!
    console.log(`Plain password provided (for debug): ${plain}`);
    console.log(`Hashed password to compare against (for debug): ${hashed}`);
    try {
        const isValid = await argon2.verify(hashed, plain);
        if (isValid) {
            console.log("Password comparison: SUCCESS. Passwords match.");
        }
        else {
            console.log("Password comparison: FAILED. Passwords do NOT match.");
        }
        return isValid;
    }
    catch (err) {
        console.error("Password comparison error caught in comparePassword:", err);
        // You can add more specific logging for the error object if needed:
        // if (err instanceof Error) {
        //   console.error("Error name:", err.name);
        //   console.error("Error message:", err.message);
        //   console.error("Error stack:", err.stack);
        // }
        return false;
    }
    finally {
        console.log("--- Exiting comparePassword function ---");
    }
};
export function jwtSign(payload, secret) {
    // You can also add logs here if you want to trace token generation
    // console.log("Generating JWT for payload:", payload);
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    // console.log("JWT generated.");
    return token;
}
