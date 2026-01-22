/**
 * Converts TL amount (float/decimal) to Kurus (integer).
 * PayTR requires amounts in sub-currencies (integers).
 * Example: 850.50 -> 85050
 */
export const toKurus = (amount: number): number => {
    // Rounding helps avoid floating point precision issues (e.g., 1.1 * 100 = 110.00000000000001)
    return Math.round(amount * 100);
};

/**
 * Formats Kurus back to TL string for display if needed.
 * Example: 85050 -> "850.50"
 */
export const toTL = (kurus: number): string => {
    return (kurus / 100).toFixed(2);
};
