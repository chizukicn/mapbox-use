import { describe, expect, it } from "vitest";
import type mapboxgl from "mapbox-gl";
import { tryAddLayer, tryRemoveLayer, useMapbox } from "../src";

describe("packageName", () => {
  const { instance, ready, setup } = useMapbox({
    handlers: {
      tryAddLayer,
      tryRemoveLayer
    }
  });



  it("should be defined", async () => {
    const layers: mapboxgl.Layer[] = [];

    setup({
      addLayer(this: mapboxgl.Map, layer: mapboxgl.AnyLayer) {
        layers.push(layer);
        return this;
      },
      removeLayer(this: mapboxgl.Map, id: string) {
        const index = layers.findIndex((layer) => layer.id === id);
        if (index > -1) {
          layers.splice(index, 1);
        }
        return this;
      },
      getLayer(id) {
        return layers.find((layer) => layer.id === id);
      },
      loaded() {
        return true;
      }
    } as mapboxgl.Map);

    await ready;

    instance.tryAddLayer({
      id: "test",
      type: "fill",
      source: "test"
    });

    expect(layers.length).toBe(1);

    instance.tryRemoveLayer("test");
    expect(layers.length).toBe(0);
  });
});
