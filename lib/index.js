const operators = {
    '^': { precedence: 13, associativity: 'right-to-left' },
    '*': { precedence: 12, associativity: 'left-to-right' },
    '/': { precedence: 12, associativity: 'left-to-right' },
    '%': { precedence: 12, associativity: 'left-to-right' },
    '+': { precedence: 11, associativity: 'left-to-right' },
    '-': { precedence: 11, associativity: 'left-to-right' }
}

Array.prototype.last = function () {
    return this[this.length - 1]
}

Array.prototype.lastIndex = function () {
    return this.length - 1
}

String.prototype.last = function () {
    return this[this.length - 1]
}

String.prototype.lastIndex = function () {
    return this.length - 1
}

String.prototype.hasHigherPrecedenceThan = function (operator) {
    return operators[this].precedence > operators[operator].precedence
}

String.prototype.hasSamePrecedenceAndTheOtherIsLeftAssociative = function (operator) {
    return operators[this].precedence === operators[operator].precedence && operators[operator].associativity === 'left-to-right'
}

export class Calc {

    #argv
    #includeInput
    #includeRpn
    #includeErrors
    #debug

    #operators
    #validTokens

    init({
        argv = process.argv.slice(2),
        includeInput = false,
        includeRpn = false,
        includeErrors = false,
        debug = false
    } = {}) {
        this.#argv = argv
        this.#includeInput = includeInput
        this.#includeRpn = includeRpn
        this.#includeErrors = includeErrors
        this.#debug = debug

        this.#operators = ['^', '*', '/', '%', '+', '-']
        this.#validTokens = ['^', '*', '/', '%', '+', '-', '(', ')']
    }

    process() {
        const output = {}
        const errors = []
        try {
            if (this.#argv.length === 1 && typeof (this.#argv[0]) === 'undefined') throw Error(`No arguments provided`)
            if (this.#argv.length < 1) throw Error(`No arguments provided`)
            if (this.#argv.length > 1) throw Error(`Too much arguments provided`)
            if (typeof (this.#argv[0]) !== 'string') throw Error(`Wrong argument type`)
            const argv = this.#argv[0].replaceAll(' ', '')
            const preparation = this.#prepare(argv)
            if (this.#includeInput) {
                output.input = argv
                output.input_array = preparation.toString()
            }
            const result = this.#solve(preparation)
            if (this.#includeRpn) {
                output.rpn = result[0].join('')
                output.rpn_array = result[0].toString()
            }
            output.result = result[1]
        } catch (error) {
            if (this.#debug) {
                console.log(error)
            } else {
                errors.push(error.message)
            }
        }
        if (this.#includeErrors) output.errors = errors
        return output
    }

    #prepare(array) {
        const output = []
        let partial = ''
        for (let i = 0; i < array.length; i++) {
            if (this.#validTokens.includes(array[i])) {
                if (partial !== '') {
                    output.push(this.#isNumber(partial))
                    partial = ''
                }
                output.push(array[i])
            } else {
                partial += array[i]
            }
            if (i === array.lastIndex()) {
                if (partial !== '') {
                    output.push(this.#isNumber(partial))
                }
            }
        }
        return output
    }

    #isNumber(value) {
        if (isNaN(value) || isNaN(parseFloat(value))) throw Error(`The value "${value}" is not a valid number`)
        return Number(value)
    }

    #solve(array) {
        const rpn = this.#rpn(array)
        return [rpn, this.#compute(rpn)]
    }

    // Postfix expression builder
    // Builds a Reverse Polish Notation expression returning an array
    #rpn(array) {
        const outputStack = []
        const operatorStack = []
        let temp
        for (let i = 0; i <= array.length; i++) {
            switch (true) {
                case typeof (array[i]) === 'number':
                    outputStack.push(array[i])
                    break
                case this.#operators.includes(array[i]):
                    while (
                        operatorStack.length !== 0 &&
                        operatorStack.last() !== '(' &&
                        (operatorStack.last().hasHigherPrecedenceThan(array[i]) || operatorStack.last().hasSamePrecedenceAndTheOtherIsLeftAssociative(array[i]))
                    ) {
                        outputStack.push(operatorStack.pop())
                    }
                    operatorStack.push(array[i])
                    break
                case array[i] === '(':
                    operatorStack.push(array[i])
                    break
                case array[i] === ')':
                    do {
                        temp = operatorStack.pop()
                        if (temp !== '(') outputStack.push(temp)
                    } while (temp !== '(')
                    break
            }
        }
        while (operatorStack.length > 0) {
            outputStack.push(operatorStack.pop())
        }
        return outputStack
    }

    // Computes the RPN array
    #compute(array) {
        const outputStack = []
        let result
        let n1
        let n2
        for (let i = 0; i <= array.length; i++) {
            switch (true) {
                case typeof (array[i]) === 'number':
                    outputStack.push(array[i])
                    break
                case this.#operators.includes(array[i]):
                    n2 = outputStack.pop()
                    n1 = outputStack.pop()
                    result = this.#operate(n1, n2, array[i])
                    outputStack.push(result)
                    break
            }
        }
        return outputStack.pop()
    }

    #operate(n1, n2, operator) {
        switch (true) {
            case operator === '^':
                return n1 ** n2
            case operator === '*':
                return n1 * n2
            case operator === '/':
                return n1 / n2
            case operator === '%':
                return n1 % n2
            case operator === '+':
                return n1 + n2
            case operator === '-':
                return n1 - n2
            default:
                throw Error('Operator not recognized')
        }
    }
}
