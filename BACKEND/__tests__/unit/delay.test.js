jest.unmock("../../src/middleware/delay");
const delayMiddleware = require("../../src/middleware/delay");

describe("delayMiddleware", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("llama a next después del tiempo especificado", () => {
    const next = jest.fn();
    delayMiddleware(1000)({}, {}, next);
    expect(next).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("usa 5000ms por defecto", () => {
    const next = jest.fn();
    delayMiddleware()({}, {}, next);
    jest.advanceTimersByTime(4999);
    expect(next).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("respeta un valor personalizado de ms", () => {
    const next = jest.fn();
    delayMiddleware(250)({}, {}, next);
    jest.advanceTimersByTime(250);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
