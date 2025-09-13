// Comprehensive mock for cheerio to avoid Web API issues in Enzyme tests
const createCheerioElement = () => ({
  html: jest.fn(() => ''),
  text: jest.fn(() => ''),
  find: jest.fn(() => createCheerioCollection()),
  attr: jest.fn(() => ''),
  children: jest.fn(() => createCheerioCollection()),
  parent: jest.fn(() => createCheerioElement()),
  next: jest.fn(() => createCheerioElement()),
  prev: jest.fn(() => createCheerioElement()),
  siblings: jest.fn(() => createCheerioCollection()),
  contents: jest.fn(() => createCheerioCollection()),
  each: jest.fn(() => createCheerioCollection()),
  map: jest.fn(() => createCheerioCollection()),
  filter: jest.fn(() => createCheerioCollection()),
  first: jest.fn(() => createCheerioElement()),
  last: jest.fn(() => createCheerioElement()),
  eq: jest.fn(() => createCheerioElement()),
  slice: jest.fn(() => createCheerioCollection()),
  hasClass: jest.fn(() => false),
  addClass: jest.fn(() => createCheerioElement()),
  removeClass: jest.fn(() => createCheerioElement()),
  toggleClass: jest.fn(() => createCheerioElement()),
  val: jest.fn(() => ''),
  is: jest.fn(() => false),
  prop: jest.fn(() => null),
  removeAttr: jest.fn(() => createCheerioElement()),
  data: jest.fn(() => null),
  removeData: jest.fn(() => createCheerioElement()),
  clone: jest.fn(() => createCheerioElement()),
  empty: jest.fn(() => createCheerioElement()),
  remove: jest.fn(() => createCheerioElement()),
  replaceWith: jest.fn(() => createCheerioElement()),
  wrap: jest.fn(() => createCheerioElement()),
  unwrap: jest.fn(() => createCheerioElement()),
  wrapAll: jest.fn(() => createCheerioElement()),
  wrapInner: jest.fn(() => createCheerioElement()),
  append: jest.fn(() => createCheerioElement()),
  prepend: jest.fn(() => createCheerioElement()),
  after: jest.fn(() => createCheerioElement()),
  before: jest.fn(() => createCheerioElement()),
  insertAfter: jest.fn(() => createCheerioElement()),
  insertBefore: jest.fn(() => createCheerioElement()),
  replaceAll: jest.fn(() => createCheerioElement()),
  detach: jest.fn(() => createCheerioElement()),
  toArray: jest.fn(() => []),
  get: jest.fn(() => null),
  index: jest.fn(() => -1),
  length: 0,
  [Symbol.iterator]: function* () { yield createCheerioElement(); }
});

const createCheerioCollection = () => ({
  ...createCheerioElement(),
  length: 0,
  [Symbol.iterator]: function* () { yield createCheerioElement(); }
});

const cheerioMock = {
  load: jest.fn((html) => createCheerioElement()),
  html: jest.fn(() => ''),
  text: jest.fn(() => ''),
  parseHTML: jest.fn(() => [createCheerioElement()]),
  contains: jest.fn(() => false),
  merge: jest.fn(() => createCheerioCollection()),
  fn: {},
  prototype: createCheerioElement()
};

// Export both CommonJS and ES module formats for compatibility
module.exports = cheerioMock;
export default cheerioMock;