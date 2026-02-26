class Calculadora {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
  multiply(a, b) { return a * b; }
  divide(a, b) {
    if (b === 0) return "Error";
    return a / b;
  }
}

const calc = new Calculadora();

let firstNumber = null;
let operation = null;
let shouldClear = false;

const display = document.getElementById("display");

function getDisplayNumber() {
  if (display.value === "" || display.value === "Error") return null;
  const n = Number(display.value);
  return Number.isFinite(n) ? n : null;
}

function setDisplayValue(value) {
  display.value = String(value);
}

function appendNumber(digit) {
  if (shouldClear) {
    display.value = "";
    shouldClear = false;
  }

  if (display.value === "0") display.value = "";

  display.value += String(digit);
}

function addDecimal() {
  if (shouldClear) {
    display.value = "0";
    shouldClear = false;
  }

  if (display.value === "" || display.value === "Error") {
    display.value = "0.";
    return;
  }

  if (!display.value.includes(".")) {
    display.value += ".";
  }
}

function backspace() {
  if (shouldClear) return; 
  if (display.value === "" || display.value === "Error") return;

  display.value = display.value.slice(0, -1);
}

function clearAll() {
  display.value = "";
  firstNumber = null;
  operation = null;
  shouldClear = false;
}

function runPendingOperation() {
  const secondNumber = getDisplayNumber();
  if (secondNumber === null) return firstNumber; 

  const result = calc[operation](firstNumber, secondNumber);
  return result;
}

function setOperation(op) {
  if (display.value === "" && firstNumber !== null) {
    operation = op;
    return;
  }

  const current = getDisplayNumber();
  if (current === null) return;

  if (firstNumber === null) {
    firstNumber = current;
    operation = op;
    shouldClear = true;
    return;
  }

  if (shouldClear) {
    operation = op;
    return;
  }

  const result = runPendingOperation();

  setDisplayValue(result);

  if (result === "Error") {
    firstNumber = null;
    operation = null;
    shouldClear = true;
    return;
  }

  firstNumber = Number(result);
  operation = op;
  shouldClear = true;
}

function calculate() {
  if (firstNumber === null || operation === null) return;

  if (shouldClear) return;

  const result = runPendingOperation();
  setDisplayValue(result);

  firstNumber = (result === "Error") ? null : Number(result);
  operation = null;
  shouldClear = true; 
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const num = btn.dataset.num;
  const op = btn.dataset.op;
  const action = btn.dataset.action;

  if (num !== undefined) appendNumber(num);
  else if (action === "decimal") addDecimal();
  else if (action === "backspace") backspace();
  else if (op) setOperation(op);
  else if (action === "equals") calculate();
  else if (action === "clear") clearAll();
});
