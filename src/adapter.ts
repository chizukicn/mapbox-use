import type { InjectionKey, ShallowRef } from "vue";
import { getCurrentScope, inject, onScopeDispose, provide, shallowRef, watch } from "vue";
import type { Fn } from "./types";

export const MapInjectKey: InjectionKey<ShallowRef<mapboxgl.Map | null>> = Symbol("MapInstance");

export const injectOrProvideMap = () => {
  let map = inject(MapInjectKey, null);
  if (!map) {
    map = shallowRef<mapboxgl.Map | null>(null);
    provide(MapInjectKey, map);
  }
  return map;
};

export const vueAdapter = () => {
  const map = injectOrProvideMap();

  let stopWatch = () => {};

  const ready = new Promise<mapboxgl.Map>((resolve) => {
    stopWatch = watch(map, (val) => {
      if (val) {
        resolve(val);
      }
    }, { immediate: true });
  }).then((map) => {
    stopWatch();
    return map;
  });

  const setup = (_map: mapboxgl.Map) => {
    map.value = _map;
  };

  return {
    ready,
    setup,
    /**
     * tryOnScopeDispose
     * credit by antfu
     * @see https://github.com/vueuse/vueuse/blob/main/packages/shared/tryOnScopeDispose/index.ts
     * @param fn
     * @returns
     */
    onScopeDispose: (fn: Fn) => {
      if (getCurrentScope()) {
        onScopeDispose(fn);
        return true;
      }
      return false;
    }
  };
};

