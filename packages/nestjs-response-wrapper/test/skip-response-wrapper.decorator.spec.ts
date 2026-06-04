import { SKIP_RESPONSE_WRAPPER_KEY, SkipResponseWrapper } from "../src/decorators/skip-response-wrapper.decorator";

describe("SkipResponseWrapper decorator", () => {
  it("should export SKIP_RESPONSE_WRAPPER_KEY with correct value", () => {
    expect(SKIP_RESPONSE_WRAPPER_KEY).toBe("skipResponseWrapper");
  });

  it("should return a decorator that sets the metadata key", () => {
    const decorator = SkipResponseWrapper();
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe("function");
  });

  it("should work as a method decorator", () => {
    class TestClass {
      @SkipResponseWrapper()
      testMethod() {
        return "test";
      }
    }

    const instance = new TestClass();
    const metadata = Reflect.getMetadata(SKIP_RESPONSE_WRAPPER_KEY, instance.testMethod);
    expect(metadata).toBe(true);
  });
});
