# yaam - Yet Another Arithmetics Module

Calculates arithmetic expressions without using `eval()`.


```js
import {calculate, tryCalculate} from 'yaam'

calculate("2 ^ 3 * (4 + 5)") // => 72
calculate("foo") // ERROR

tryCalculate("2.5 % 2") // => 0.5
tryCalculate("foo") // null
tryCalculate("foo", { verbose: true }) // null, but logs to console
```
