const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const keys = document.querySelector(".keys");

const state = {
  current: "0",
  previous: null,
  operator: null,
  justEvaluated: false,
  waitingForOperand: false,
};

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit != null) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.op) {
    inputOperator(button.dataset.op);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "clear") {
    clearAll();
  } else if (button.dataset.action === "equals") {
    evaluate();
  }
  render();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+" || key === "-") {
    inputOperator(key === "-" ? "−" : "+");
  } else if (key === "*" || key === "x" || key === "X") {
    inputOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    inputOperator("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
  } else if (key === "Escape" || key === "c" || key === "C") {
    clearAll();
  } else {
    return;
  }
  render();
});

function inputDigit(digit) {
  if (state.current === "错误" || state.justEvaluated || state.waitingForOperand) {
    state.current = digit;
    state.justEvaluated = false;
    state.waitingForOperand = false;
    return;
  }
  state.current = state.current === "0" ? digit : state.current + digit;
}

function inputDecimal() {
  if (state.current === "错误" || state.justEvaluated || state.waitingForOperand) {
    state.current = "0.";
    state.justEvaluated = false;
    state.waitingForOperand = false;
    return;
  }
  if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function inputOperator(operator) {
  if (state.current === "错误") {
    clearAll();
  }
  if (state.waitingForOperand) {
    state.operator = operator;
    return;
  }
  if (state.previous != null && state.operator && !state.justEvaluated) {
    evaluate();
  }
  state.previous = state.current;
  state.operator = operator;
  state.justEvaluated = false;
  state.waitingForOperand = true;
}

function evaluate() {
  if (state.previous == null || !state.operator) return;

  const left = Number(state.previous);
  const right = Number(state.current);
  let result;

  switch (state.operator) {
    case "+":
      result = left + right;
      break;
    case "−":
      result = left - right;
      break;
    case "×":
      result = left * right;
      break;
    case "÷":
      if (right === 0) {
        clearAll();
        state.current = "错误";
        return;
      }
      result = left / right;
      break;
    default:
      return;
  }

  state.current = formatResult(result);
  state.previous = null;
  state.operator = null;
  state.justEvaluated = true;
  state.waitingForOperand = false;
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.justEvaluated = false;
  state.waitingForOperand = false;
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "错误";
  const rounded = Number(value.toPrecision(12));
  return String(rounded);
}

function render() {
  displayEl.textContent = state.current;
  if (state.previous != null && state.operator) {
    expressionEl.textContent = `${state.previous} ${state.operator}`;
  } else {
    expressionEl.textContent = "";
  }
}

render();
