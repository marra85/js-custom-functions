const fp = require("lodash/fp");

const DELIVERY_COUNT = 1000;
const ITEM_COUNT = 10000;

const generateNumberStrings = () => {
  const numberStrings = [];
  const characters = '0123456789';
  const length = 5;

  for (let i = 0; i < DELIVERY_COUNT; i++) {
    let numberString = '';
    for (let j = 0; j < length; j++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      numberString += characters[randomIndex];
    }
    numberStrings.push(numberString);
  }

  return numberStrings;
};

const deliveryNumbers = generateNumberStrings()

const generateInput = () => {
  const input = [];
  let counter = 1;

  for (let i = 0; i < ITEM_COUNT; i++) {
    const DeliveryNumber = getRandomDeliveryNumber();
    const test = counter.toString().padStart(5, '0');
    input.push({ DeliveryNumber, test });
    counter++;
  }

  return input;
};

const getRandomDeliveryNumber = () => {
  const randomIndex = Math.floor(Math.random() * deliveryNumbers.length);
  return deliveryNumbers[randomIndex];
};

const input = generateInput();

/*
const input = [
  { DeliveryNumber: "456", test: "02" },
  { DeliveryNumber: "123", test: "01" },
  { DeliveryNumber: "123", test: "02" },
  { DeliveryNumber: "123", test: "03" },
  { DeliveryNumber: "789", test: "03" },
];
*/

const logMetrics = (message, functionToCall) => {
  const start = Date.now();

  const result = functionToCall()

  const end = Date.now();
  console.log(`${message} - time: ${end - start} ms ->`, result);

  return result
} 

/**
 * objective: grouping delivery items but still mantaining the ordering from SQL query
 */

const groupByAndKeepOrderSlow = input => {
  const obj = []
  for (const entry of input) {
    const {DeliveryNumber} = entry
    const found = obj.find(x => x.DeliveryNumber === DeliveryNumber)
    found ? found.list.push(entry) : obj.push({DeliveryNumber, list: [entry]})
  }
  return obj
}

const groupByAndKeepOrderOptionA = input => {
  const grouped = {};
  const result = [];

  for (const entry of input) {
    const { DeliveryNumber } = entry;
    if (grouped[DeliveryNumber]) {
      grouped[DeliveryNumber].list.push(entry);
    } else {
      const group = { DeliveryNumber, list: [entry] };
      grouped[DeliveryNumber] = group;
      result.push(group);
    }
  }

  return result;
};

const groupByAndKeepOrderOptionB = input => {
  const grouped = {};
  const result = [];

  if (input === undefined)
    return result;

  for (const entry of input) {
    const { DeliveryNumber } = entry;
    const position = grouped[DeliveryNumber]
    if (position !== undefined) {
      result[position].list.push(entry);
    } else {
      const group = { DeliveryNumber, list: [entry] };
      const idx = result.push(group) - 1;
      grouped[DeliveryNumber] = idx;
    }
  }

  return result;
};

console.log ('Test Dataset', input)
let resultIterator = null

resultIterator = logMetrics('fp.groupBy', () => fp.groupBy("DeliveryNumber")(input));
console.log('total keys', fp.size(resultIterator))

resultIterator = logMetrics('groupByAndKeepOrderSlow',() => groupByAndKeepOrderSlow(input));
console.log('total keys', fp.size(resultIterator))

resultIterator = logMetrics('groupByAndKeepOrderOptionA',() => groupByAndKeepOrderOptionA(input));
console.log('total keys', fp.size(resultIterator))

resultIterator = logMetrics('groupByAndKeepOrderOptionB',() => groupByAndKeepOrderOptionB(input));
console.log('total keys', fp.size(resultIterator))
