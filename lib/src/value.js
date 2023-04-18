export function getNumber(value) {
    if (!isNumber(value)) throw Error(`Value '${value}' is not a number`)
    return Number(value)
}

function isNumber(value) {
    return !(isNaN(value) || isNaN(parseFloat(value)))
}
