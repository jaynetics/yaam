/**
 * @throws {YaamError}
 */
export const calculate = (input: string) => {
  const ast = parse(input)
  return ast.calculate()
}

export const tryCalculate = (input: string): number | null => {
  try {
    return calculate(input)
  } catch (e) {
    console.log(e)
    return null
  }
}

export const isCalculation = (input: string) => {
  return tryCalculate(input) !== null
}

export class YaamError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "YaamError"
    Object.setPrototypeOf(this, YaamError.prototype)
  }
}

const parse = (input: string): Node => {
  input = input.replace(/\s+/g, "")
  if (!CalculationRegexp.test(input)) throw new YaamError("invalid input")

  const root = new Node()
  const stack = new Array<Node>()
  let currentNode = root

  input.match(TokenRegexp).forEach((token) => {
    if (token === "(") {
      stack.push(currentNode)
      const newNode = new Node()
      currentNode.children.push(newNode)
      currentNode = newNode
    } else if (token === ")") {
      if (!stack.length) throw new YaamError("unbalanced parentheses `)`")
      currentNode = stack.pop() as Node
    } else {
      currentNode.children.push(token)
    }
  })

  if (stack.length) throw new YaamError("unbalanced parentheses `(`")

  return root
}

type NodeChild = Node | string | number

class Node {
  children: Array<NodeChild>

  constructor() {
    this.children = new Array<NodeChild>()
  }

  calculate(): number {
    const nodes = [...this.children]
    if (nodes.length % 2 === 0) throw new YaamError(`invalid Node ${nodes}`)

    Operators.forEach((op) => {
      for (let i = nodes.length - 2; i > 0; i--) {
        if (nodes[i] !== op) continue

        const left = this.toNumber(nodes[i - 1])
        const right = this.toNumber(nodes[i + 1])
        let result: number

        // prettier-ignore
        switch (op) {
          case "+":  result = left + right; break
          case "-":  result = left - right; break
          case "*":  result = left * right; break
          case "/":  result = left / right; break
          case "%":  result = left % right; break
          case "%":  result = left % right; break
          case "^":  result = left ** right; break
          case "**": result = left ** right; break
          default:
            throw new YaamError(`unhandled operator ${op}`)
        }

        nodes.splice(i - 1, 3, result)
      }
    })

    if (nodes.length !== 1) throw new YaamError(`invalid Node ${nodes}`)

    return this.toNumber(nodes[0])
  }

  toNumber(child: NodeChild): number {
    if (child instanceof Node) return child.calculate()
    if (typeof child === "number") return child
    if (NumberRegexp.test(child)) {
      const [number, exponent] = child.split("e")
      const num = Number(number)
      if (!isNaN(num)) {
        return exponent === undefined ? num : num * 10 ** Number(exponent)
      }
    }
    throw new YaamError(`invalid token ${child}`)
  }
}

type Operator = "**" | "^" | "%" | "/" | "*" | "+" | "-"

// operators, sorted by precedence
const Operators = ["**", "^", "%", "/", "*", "+", "-"] as Array<Operator>

const OperatorRegexp = new RegExp(
  "(?:" + Operators.map((op) => op.replace(/(?=.)/g, "\\")).join("|") + ")"
)
const NumberRegexp = /(?:(?:\d+\.\d+|\d+)(?:e[+-]?\d+)?)/
const TokenRegexp = new RegExp(
  `(?:[()]|${OperatorRegexp.source}|${NumberRegexp.source})`,
  "g"
)

// rough pattern, because JS regexps don't support recursion. sad.
const CalculationRegexp = new RegExp(
  `
  ^
  ${TokenRegexp.source}*
  ${NumberRegexp.source}
  ${TokenRegexp.source}*
  ${OperatorRegexp.source}
  ${TokenRegexp.source}*
  ${NumberRegexp.source}
  ${TokenRegexp.source}*
  $
  `.replace(/\s+/g, "")
)
