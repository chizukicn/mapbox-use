import type { Fn, MaybePromise } from "maybe-types";

export { MaybePromise, Fn };

export type PickKeys<T, V> = {
  [K in keyof T ]: T[K] extends V ? K : never
}[keyof T];

export type MapLifecycleCallback = (map: mapboxgl.Map) => void | MaybePromise<(() => void)>;

export type MapEventListenerCallback<E = any> = (map: mapboxgl.Map, ev: E) => void | MaybePromise<(() => void)>;

export type MapHandler<P extends any[], R = any> = (map: mapboxgl.Map, ...args: P) => R;

export type UnwrapMapHandler<T extends MapHandler<any[], any>> = T extends MapHandler<infer P, infer R> ? (...args: P) => R : never;

export type MapEffectHander<P extends any[], R extends Function> = (map: mapboxgl.Map, ...args: P) => R;

export type UnwrapMapEffectHandler<T extends MapHandler<any[], any>> = T extends MapEffectHander<infer P, infer R> ? (...args: P) => R : never;

export type MapProxyInstance<O extends Record<string, MapHandler<any[], any>>> = { [K in keyof O]: UnwrapMapHandler<O[K]> };

export type MapFunctionKeys = PickKeys<mapboxgl.Map, Function>;

export interface UseMapboxAdapter {
  ready: Promise<mapboxgl.Map>
  setup: (map: mapboxgl.Map) => void
  onScopeDispose: (fn: Fn) => boolean
}
