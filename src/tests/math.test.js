import { fahrenheitToCelsius, celsiusToFahrenheit } from "../math.js";

test('Should convert 32 F to 0 C', () => {
    const result = fahrenheitToCelsius(32)
    expect(result).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    const result = celsiusToFahrenheit(0)
    expect(result).toBe(32)
})