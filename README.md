# calc

This library is using the [__Shunting yard algorithm__](https://en.wikipedia.org/wiki/Shunting_yard_algorithm).

## Execution with node.js

The script should be called like this:

```bash
$ node ./app/index.js -x "4*5.3+(.7*(5+2.5)-3*(2-1))/23" -i -r
```

## Execution with npm:

__package.json__
```json
{
    "scripts": {
        "start": "node ./app/index.js"
    }
}
```

```bash
$ npm start -- -x "4*5.3+(.7*(5+2.5)-3*(2-1))/23" -i -r
```

## Usage

__app.js__
```javascript
import { Calc } from '@siziksu/calc'
import { Args } from '@siziksu/args'

const args = new Args()
args.parameters({
    '--includeInput': Boolean,
    '--includeRpn': Boolean,
    '--expression': String
}).aliases({
    '-i': '--includeInput',
    '-r': '--includeRpn',
    '-x': '--expression'
})
const params = args.process()

const calc = new Calc()
calc.expression(params.args.expression)
    .options({
        includeInput: params.args.includeInput,
        includeRpn: params.args.includeRpn
    })
const output = calc.process()

console.log(output)
```

__oputput__
```javascript
{
  input: '4*5.3+(.7*(5+2.5)-3*(2-1))/23',
  input_array: '4,*,5.3,+,(,0.7,*,(,5,+,2.5,),-,3,*,(,2,-,1,),),/,23',
  rpn: '45.3*0.752.5+*321-*-23/+',
  rpn_array: '4,5.3,*,0.7,5,2.5,+,*,3,2,1,-,*,-,23,/,+',
  result: 21.297826086956523
}
```

## Testing

__app.js__
```javascript
import { Calc } from '@siziksu/calc'
import { Args } from '@siziksu/args'

const expressions = [
    "4*5.3+(.7*(5+2.5)-3*(2-1))/23", // 21.297826086956523
    "4*5+(7*(5+2)-3*(2-1))/2", // 43
    "3+4*2/3", // 5.666666666666666
    "(2+6*3+5-(3*14/7+2)*5)+3", // -12
    "3+4*2/(1-5)^2^3", // 3.001953125
    "17%5", // 2
    "3+(58%6*(1.5*3)/2)^2/3", // 30
    "3*5^2+12*1.02" // 87.24
]

const args = new Args()
args.parameters({ '--expression': String }).aliases({ '-x': '--expression' })

const calc = new Calc()

let params
let output
for (let i = 0; i < expressions.length; i++) {
    args.argv(['-x', expressions[i]])
    params = args.process()
    calc.expression(params.args.expression)
    output = calc.process()
    console.log(`Test ${i + 1}: ${output.result}`)
}
```

__oputput__
```bash
Test 1: 21.297826086956523
Test 2: 43
Test 3: 5.666666666666666
Test 4: -12
Test 5: 3.0001220703125
Test 6: 2
Test 7: 30
Test 8: 87.24
```
