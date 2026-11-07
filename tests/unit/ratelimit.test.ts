import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("Rate Limiting Guard", () => {
  it("should allow requests under the limit and block subsequent requests", () => {
    const testIp = `test-ip-${Date.now()}`;
    const options = {
      keyPrefix: "test-limit",
      maxRequests: 3,
      windowMs: 5000,
    };

    // First 3 requests must succeed
    const req1 = checkRateLimit(testIp, options);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = checkRateLimit(testIp, options);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = checkRateLimit(testIp, options);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4th request must be rejected
    const req4 = checkRateLimit(testIp, options);
    expect(req4.success).toBe(false);
    expect(req4.remaining).toBe(0);
    expect(req4.resetInSeconds).toBeGreaterThan(0);
  });
});
