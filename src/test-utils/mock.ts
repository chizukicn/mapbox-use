import type mapboxgl from "mapbox-gl";
import type { MapEventListenerCallback } from "../types";

export function createMockMap() {
  const layers: mapboxgl.Layer[] = [];

  let isLoaded = false;

  const listeners = new Map<string, MapEventListenerCallback[]>();

  const on = (event: string, callback: (...args: any[]) => void) => {
    const list = listeners.get(event) ?? [];
    list.push(callback);
    listeners.set(event, list);
  };

  const off = (event: string, callback: (...args: any[]) => void) => {
    const list = listeners.get(event) ?? [];
    const index = list.indexOf(callback);
    if (index > -1) {
      list.splice(index, 1);
    }
    listeners.set(event, list);
  };

  const once = (event: string, callback: (...args: any[]) => void) => {
    const _callback = (...args: any[]) => {
      callback(...args);
      off(event, _callback);
    };
    on(event, _callback);
  };

  const loadStyle = () => {
    isLoaded = false;
    setTimeout(() => {
      isLoaded = true;
    }, Math.random() * 1000);
  };

  loadStyle();

  const map = {
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
    getStyle() {
      return {
        layers
      };
    },
    loaded() {
      return isLoaded;
    },
    off,
    on,
    once
  } as mapboxgl.Map;

  return map;
}
