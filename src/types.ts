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



export interface UseMapboxOptions<O extends Record<string, MapHandler<any[], any>>, EE extends MapFunctionKeys[] | true > {

  /**
   * @description custom handlers
   */
  handlers?: O
  /**
   * @description extends mapboxgl.Map
   * @default true
   */
  extends?: EE
  /**
   * @description cleanup on scope dispose
   * @default true
   */
  cleanupOnScopeDispose?: boolean

  adapter?: UseMapboxAdapter
}

export interface UseMapboxReturn<O extends Record<string, MapHandler<any[], any>>, E extends MapFunctionKeys[] | true> {
  /**
   * @description mapboxgl.Map ready promise
   */
  ready: Promise<mapboxgl.Map>
  /**
   * @description mapboxgl.Map loaded promise
   */
  loaded: Promise<mapboxgl.Map>
  /**
   * @description mapboxgl.Map instance
   */
  instance: MapProxyInstance<O> & Pick<mapboxgl.Map, (E extends true ? MapFunctionKeys[] : E)[number]>
  /**
   * @description mapboxgl.Map setup
   */
  setup: (map: mapboxgl.Map) => void
  /**
   * @alias addEventListener
   */
  on: this["removeEventListener"]
  /**
   * @description add event listener
   */
  addEventListener: <T extends keyof mapboxgl.MapEventType>(type: T, callback: MapEventListenerCallback<mapboxgl.MapEventType[T] & mapboxgl.EventData>) => any
  /**
   * @alias removeEventListener
   */
  off: this["removeEventListener"]
  /**
   * @description remove event listener
   */
  removeEventListener: <T extends keyof mapboxgl.MapEventType>(type: T, callback: MapEventListenerCallback<mapboxgl.MapEventType[T] & mapboxgl.EventData>) => any
  /**
   * @description cleanup
   */
  cleanup: (name: MapFunctionKeys) => void
  /**
   * @description mapboxgl.Map ready lifecycle
   */
  onReady: (callback: MapLifecycleCallback) => void
  /**
   * @description mapboxgl.Map loaded lifecycle
   */
  onLoaded: (callback: MapLifecycleCallback) => void
}
