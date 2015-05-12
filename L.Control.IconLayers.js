+ function() {
    function each(o, cb) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                cb(o[p], p, o);
            }
        }
    }

    function find(ar, cb) {
        if (ar.length) {
            for (var i = 0; i < ar.length; i++) {
                if (cb(ar[i])) {
                    return ar[i];
                }
            }
        } else {
            for (var p in ar) {
                if (ar.hasOwnProperty(p) && cb(ar[p])) {
                    return ar[p];
                }
            }
        }
    }

    function first(o) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                return o[p];
            }
        }
    }

    function length(o) {
        var length = 0;
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                length++;
            }
        }
        return length;
    }

    L.Control.IconLayers = L.Control.extend({
        _getActiveLayer: function() {
            if (this._activeLayerId) {
                return this._layers[this._activeLayerId];
            } else if (length(this._layers)) {
                return first(this._layers);
            } else {
                return null;
            }
        },
        _getPreviousLayer: function() {
            var activeLayer = this._getActiveLayer();
            if (!activeLayer) {
                return null;
            } else if (this._previousLayerId) {
                return this._layers[this._previousLayerId];
            } else {
                return find(this._layers, function(l) {
                    return L.stamp(l.layer) !== L.stamp(activeLayer.layer);
                }.bind(this)) || null;
            }
        },
        _getInactiveLayers: function() {
            var ar = [];
            var activeLayerId = this._getActiveLayer() ? L.stamp(this._getActiveLayer().layer) : null;
            var previousLayerId = this._getPreviousLayer() ? L.stamp(this._getPreviousLayer().layer) : null;
            each(this._layers, function(l) {
                var id = L.stamp(l.layer);
                if ((id !== activeLayerId) && (id !== previousLayerId)) {
                    ar.push(l);
                }
            });
            return ar;
        },
        _arrangeLayers: function() {
            var behaviors = {};

            behaviors['previous'] = function() {
                var activeLayer = this._getActiveLayer();
                var previousLayer = this._getPreviousLayer();
                if (previousLayer) {
                    return [previousLayer, activeLayer].concat(this._getInactiveLayers());
                } else if (activeLayer) {
                    return [activeLayer].concat(this._getInactiveLayers());
                } else {
                    return null;
                }
            };

            return behaviors[this.options.behavior].apply(this, arguments);
        },
        _createLayersElements: (function() {
            function createLayerElement(layerObj) {
                var el = L.DomUtil.create('div', 'leaflet-iconLayers-layer');
                if (layerObj.title) {
                    var titleContainerEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitleContainer');
                    var titleEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitle');
                    titleEl.innerHTML = layerObj.title;
                    titleContainerEl.appendChild(titleEl);
                    el.appendChild(titleContainerEl);
                }
                if (layerObj.icon) {
                    el.setAttribute('style', "background-image: url('" + layerObj.icon + "')");
                }
                return el;
            }

            return function() {
                var layers = this._arrangeLayers();
                for (var i = 0; i < layers.length; i++) {
                    this._container.appendChild(createLayerElement(layers[i]));
                }
            };
        })(),
        _attachEvents: (function() {
            return function() {

            };
        })(),
        _render: function() {
            this._container.innerHTML = '';
            this._createLayersElements();
            this._attachEvents();
        },
        options: {
            position: 'bottomleft', // one of expanding directions depends on this
            behavior: 'previous', // may be 'previous', 'expanded' or 'first'
            expand: 'horizontal', // or 'vertical'
            autoZIndex: true, // from L.Control.Layers
            maxLayersInRow: 5
        },
        initialize: function(layers, options) {
            L.setOptions(this, options);
            this.setLayers(layers);
        },
        onAdd: function(map) {
            this._container = L.DomUtil.create('div', 'leaflet-iconLayers');
            L.DomUtil.addClass(this._container, 'leaflet-iconLayers_' + this.options.position);
            this._render();
            return this._container;
        },
        setLayers: function(layers) {
            this._layers = {};
            layers.map(function(layer) {
                this._layers[L.stamp(layer.layer)] = layer;
            }.bind(this));
            this._container && this._render();
        },
        setActiveLayer: function(layer) {
            if (!layer || L.stamp(layer) === this._activeLayerId) {
                return;
            }
            this._previousLayerId = this._activeLayerId;
            this._activeLayerId = L.stamp(layer);
            this._container && this._render();
        }
    });
}();