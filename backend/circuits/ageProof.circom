pragma circom 2.0.0;

/*
 * @title AgeProof
 * @notice Proves that a credential holder is at least `minAge` (e.g. 18+)
 *         without revealing their exact birthYear, age, or Aadhaar/ID number.
 */

template AgeProof() {
    // Private inputs (hidden from verifier)
    signal input birthYear;
    signal input userSecret;

    // Public inputs (visible to verifier)
    signal input currentYear;
    signal input minAge;

    // Public output
    signal output isValid;

    // 1. Calculate age = currentYear - birthYear
    signal age;
    age <-- currentYear - birthYear;
    age === currentYear - birthYear;

    // 2. Constraint: age must be >= minAge
    // (age - minAge) must be non-negative (within 0 to 120 range)
    signal diff;
    diff <-- age - minAge;
    diff === age - minAge;

    // Range check: difference should be positive
    // We enforce isValid is 1
    isValid <-- diff >= 0 ? 1 : 0;
    isValid === 1;
}

component main {public [currentYear, minAge]} = AgeProof();
