import type mapboxgl from "mapbox-gl";
import { waitMapLoaded } from "./handlers";
import type { Fn, MapEventListenerCallback, MapFunctionKeys, MapHandler, MapLifecycleCallback, MapProxyInstance, MaybePromise, PickKeys, UseMapboxOptions, UseMapboxReturn } from "./types";
import { vueAdapter } from "./adapter";


export const useMapbox = <O extends Record<string, MapHandler<any[], any>>, E extends (MapFunctionKeys[]) | true = []>(options: UseMapboxOptions<O, E> = {}): UseMapboxReturn<O, E> => {
  type EffectName = Exclude<PickKeys<O, (...args: any[]) => MaybePromise<Fn>>, number | symbol>;

  type ExtendsName = (E extends true ? MapFunctionKeys[] : E)[number];

  let _map: mapboxgl.Map;

  const { ready, setup, onScopeDispose } = options.adapter ?? vueAdapter();

  const loaded = ready.then(async (map) => {
    _map = map;
    await waitMapLoaded(map);
    return map;
  });


  const handlers = (options.handlers ?? {}) as O;

  const cleanups = new Map<string, Function[]>();

  const addCleanup = (cleanup: Function, name?: string) => {
    const effectName = name ?? cleanup.name;
    const array = cleanups.get(effectName) ?? [];
    array.push(cleanup);
    cleanups.set(effectName, array);
  };

  const proxy = <P extends any[], R = any> (handler: MapHandler<P, R>, name?: string) => {
    return (...args: P) => {
      const rs = handler(_map, ...args);
      if (rs instanceof Promise) {
        rs.then((cleanup) => {
          if (typeof cleanup === "function") {
            addCleanup(cleanup, name);
          }
        });
      } else if (typeof rs === "function") {
        addCleanup(rs, name);
      }
      return rs;
    };
  };


  const instance = new Proxy({}, {
    get(target, key: string) {
      const handler = handlers[key];
      if (handler) {
        return proxy(handler, key);
      }
      const k = key as ExtendsName;
      if (options.extends === true || options.extends?.includes(k)) {
        return (...args: any[]) => {
          const f = _map[k] as Fn;
          if (typeof f === "function") {
            return f.apply(_map, args);
          }
        };
      }
    }
  }) as MapProxyInstance<O> & Pick<mapboxgl.Map, ExtendsName>;

  function cleanup(name: EffectName): void;
  function cleanup(name: string): void;
  function cleanup(name: EffectName | string) {
    const cu = cleanups.get(name);
    if (cu) {
      cu.forEach((c) => c());
      cleanups.delete(name);
    }
  };

  const createMapLifecycleHook = (promise: Promise<any>) => {
    return (callback: MapLifecycleCallback) => {
      let off = () => {};
      onScopeDispose(() => {
        if (typeof off === "function") {
          off();
        }
      });
      promise.then(async (map) => {
        off = await callback(map) ?? off;
      });
    };
  };


  function addEventListener<T extends keyof mapboxgl.MapEventType>(type: T, callback: MapEventListenerCallback<mapboxgl. MapEventType[T] & mapboxgl.EventData>): any;
  function addEventListener(type: string, callback: MapEventListenerCallback): any;
  async function addEventListener(type: string, callback: MapEventListenerCallback) {
    const _map = await ready;

    const cb = async (e: any) => {
      const cleanup = await callback(_map, e);
      if (typeof cleanup === "function") {
        addCleanup(() => {
          _map.off(type, cb);
          cleanup();
        }, type);
      }
    };

    _map.on(type, cb);

    return _map;
  }

  function removeEventListener<T extends keyof mapboxgl.MapEventType>(type: T, callback: MapEventListenerCallback<mapboxgl. MapEventType[T] & mapboxgl.EventData>): any;
  function removeEventListener(type: string, callback: MapEventListenerCallback): any;
  async function removeEventListener(type: string, callback: MapEventListenerCallback) {
    const _map = await ready;
    cleanup(type);
    _map.off(type, callback as () => void);
    return _map;
  }

  onScopeDispose(() => {
    if (options.cleanupOnScopeDispose !== false) {
      cleanups.forEach((cu) => {
        cu.forEach((c) => c());
      });
      cleanups.clear();
    }
  });

  return {
    ready,
    loaded,
    instance,
    setup,
    on: addEventListener,
    addEventListener,
    off: removeEventListener,
    removeEventListener,
    cleanup,
    onReady: createMapLifecycleHook(ready),
    onLoaded: createMapLifecycleHook(loaded)
  };
};

