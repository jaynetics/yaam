import {calculate, YaamError} from "../src/index"

test("errors for non-numeric input", () => {
  expect(() => calculate("foo")).toThrow(YaamError)
  expect(() => calculate("42foo")).toThrow(YaamError)
  expect(() => calculate("4foo2")).toThrow(YaamError)
  expect(() => calculate("foo42")).toThrow(YaamError)
})

test("errors for unbalanced input", () => {
  expect(() => calculate("1+2+")).toThrow(YaamError)
  expect(() => calculate("+1+2")).toThrow(YaamError)
  expect(() => calculate("(1+2")).toThrow(YaamError)
  expect(() => calculate("1+2)")).toThrow(YaamError)
  expect(() => calculate("1+(2")).toThrow(YaamError)
  expect(() => calculate("1)+2")).toThrow(YaamError)
})

describe("calculates like eval()", () => {
  ;[
    "1 + 2",
    "1 + 2.5",
    "1 + 2.5 - 0.5",
    "1 + 2.5 - 0.5 * 2",
    "1 + 2.5 - 0.5 * 2 / 10",
    "1 + 2.5 - 0.5 * 2 ** 8 / 10",
    "(1 + 2.5 - 0.5 * 2) ** 8 / 10",
    "(1 + (2.5 - 0.5) * 2) ** 8 / 10",
    "(1 + (2.5 - 0.5) * 2) ** (20 / 10)",
  ].forEach((string) => {
    const evalResult = eval(string)
    test(`${string} yields ${evalResult}`, () => {
      const yaamResult = calculate(string)
      expect(yaamResult).toEqual(evalResult)
    })
  })
})

test("converts to float automatically", () => {
  expect(String(calculate("1/2"))).toEqual("0.5")
  expect(String(calculate("2/3"))).toEqual("0.6666666666666666")
  expect(String(calculate("4/3"))).toEqual("1.3333333333333333")
})

test("supports exponent notation", () => {
  expect(calculate("5 + 12e3")).toEqual(12_005)
  expect(calculate("5 + 12e+3")).toEqual(12_005)
  expect(calculate("5 + 12e-3")).toEqual(5.012)
})
