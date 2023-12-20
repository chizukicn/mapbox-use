import { describe, expect, it } from "vitest";
import { tryAddLayer, tryRemoveLayer, useMapbox } from "../src";
import { createMockMap } from "../src/test-utils";

describe("useMapbox", () => {
  const { instance, ready, setup } = useMapbox({
    handlers: {
      tryAddLayer,
      tryRemoveLayer
    }
  });

  it("should be defined", async () => {
    const map = createMockMap();

    setup(map);

    await ready;

    instance.tryAddLayer({
      id: "test",
      type: "fill",
      source: "test"
    });

    expect(map.getStyle().layers.length).toBe(1);

    instance.tryRemoveLayer("test");
    expect(map.getStyle().layers.length).toBe(0);
  });
});
