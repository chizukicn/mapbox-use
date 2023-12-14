export const clearLayers = (_map: mapboxgl.Map, ...names: string[]) => {
  names = names.length ? names : _map.getStyle().layers.map((layer) => layer.id);
  for (const name of names) {
    if (_map.getLayer(name)) {
      _map.removeLayer(name);
    }
  }
  return _map;
};


export const tryAddSource = (_map: mapboxgl.Map, name: string, source: mapboxgl.AnySourceData, force?: boolean) => {
  const exist = !!_map.getSource(name);
  if (exist) {
    if (force) {
      _map.removeSource(name);
    } else {
      return;
    }
  }
  return _map.addSource(name, source);
};


export const tryAddLayer = (_map: mapboxgl.Map, layer: mapboxgl.AnyLayer, force?: boolean) => {
  const exist = !!_map.getLayer(layer.id);
  if (exist) {
    if (force) {
      _map.removeLayer(layer.id);
    } else {
      return;
    }
  }
  return _map.addLayer(layer);
};


export const tryRemoveLayer = (_map: mapboxgl.Map, name: string) => {
  const exist = !!_map.getLayer(name);
  if (exist) {
    _map.removeLayer(name);
  }
  return _map;
};

export const tryRemoveSource = (_map: mapboxgl.Map, name: string) => {
  const exist = !!_map.getSource(name);
  if (exist) {
    _map.removeSource(name);
  }
  return _map;
};

export const tryAddImage = (_map: mapboxgl.Map, name: string, image: HTMLImageElement | ImageBitmap | ArrayBufferView, force?: boolean) => {
  const exist = _map.hasImage(name);
  if (exist) {
    if (force) {
      _map.removeImage(name);
    } else {
      return;
    }
  }
  return _map.addImage(name, image);
};

export const tryRemoveImage = (_map: mapboxgl.Map, name: string) => {
  const exist = !!_map.hasImage(name);
  if (exist) {
    _map.removeImage(name);
  }
  return _map;
};

export const waitMapLoaded = (map: mapboxgl.Map) => {
  return new Promise<mapboxgl.Map>((resolve, reject) => {
    try {
      if (map.loaded()) {
        resolve(map);
      } else {
        map.once("load", () => {
          resolve(map);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};



export const loadImageAsync = (map: mapboxgl.Map, url: string) => {
  return new Promise<HTMLImageElement | ImageBitmap | undefined>((resolve, reject) => {
    map.loadImage(url, (error, image) => {
      if (error) {
        reject(error);
      } else {
        resolve(image);
      }
    });
  });
};
