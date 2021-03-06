function LatLng(lat, lng) {
    this.lat = lat;
    this.lng = lng;
}
function AddressComponent(city){
    this.city = city;
  
}
function Marker() {
    this.map = null;
    this.title = "";
    this._mapInstance = null;
    this._marker = null;
}
Marker.prototype = {
    addEventListener: function (evtName, handle) {

    },
    setTitle: function (title) {
        this._marker.setTitle(title);
    },
    setMarker: function (marker) {
        this._marker = marker;
    },
    setAdapter: function (adapter) {
        this._mapInstance = adapter;
    },
    remove: function () {
        this._mapInstance.removeOverlay(this._marker);

    }

}
var MapAdapter = {
    MapType: {
        BMAP: 1,
        QQMAP: 2
    },
    maps: [],
    MapFactory: MapFactory,

    initMap: function () {
        MapAdapter.maps.filter(item => item.mapInstance == null).forEach((mapObj) => {
            if (mapObj.type == 1) {
                mapObj.mapInstance = new BMap.Map(mapObj.container);
                var point = mapObj.center;
                mapObj.mapInstance.centerAndZoom(MapAdapter.toBMapPoint(point), mapObj.zoom);
                mapObj.mapInstance.enableScrollWheelZoom(true);
            }

            else if (mapObj.type == 2) {
                var point = mapObj.center;
                var myOptions = {
                    zoom: mapObj.zoom,
                    center: MapAdapter.toQQMapPoint(point),
                    zoomControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    panControl: false
                };
                mapObj.mapInstance = new qq.maps.Map(mapObj.container, myOptions);
            }
            if (mapObj.mapInstance && typeof mapObj.handle == "function") {
                mapObj.handle(mapObj);
            }
        })

    },
    toBMapPoint(latLng) {
        return new BMap.Point(latLng.lng, latLng.lat)
    },
    toQQMapPoint(latLng) {
        return new qq.maps.LatLng(latLng.lat, latLng.lng)
    },
    toLatLng(point) {
        return new LatLng(point.lat, point.lng);
    }
}

function MapFactory(type, container, center, zoom, handle) {
    if (!(type && container)) {
        console.error("type和container不能为空");
        return;
    }
    center && (MapAdapter.center = center);
    zoom && (MapAdapter.zoom = zoom);
    MapAdapter.container = container;
    var map = {};
    if (type === 1) {
        map = new BMapAdapter();
    }
    else if (type === 2) {
        map = new QQMapAdapter();
    }
    map.mapInstance = null;
    map.type = type;
    map.container = container;
    map.handle = handle;
    center && (map.center = center);
    zoom && (map.zoom = zoom);
    MapAdapter.maps.push(map);
    loadMapScript(type)
    return map;
}
function loadMapScript(type) {
    var src = "";
    if (type == 1) {
        if (typeof BMap != "undefined") {
            MapAdapter.initMap();
            return;
        }
        src = "http://api.map.baidu.com/api?v=2.0&ak=020EONzGzbIU96064GCgRv0jpoX69dk3&callback=MapAdapter.initMap";
    }
    else if (type == 2) {
        if (typeof qq != "undefined") {
            MapAdapter.initMap();
            return;
        }
        src = "https://map.qq.com/api/js?v=2.exp&key=27VBZ-5ZYKW-AZTRS-O234W-SU342-HRFR5&callback=MapAdapter.initMap"
    }
    var scriptElem = document.createElement("script");
    scriptElem.type = "text/javascript";
    scriptElem.src = src;
    document.body.appendChild(scriptElem);
}
function BMapAdapter() {
    this.container = null;
    this.zoom = 8;
    this.type = 1;
    this.center = new LatLng(39.915, 116.404);
}
BMapAdapter.prototype = {
    setCenter: function (center) {
        this.mapInstance.setCenter(MapAdapter.toBMapPoint(center));
    },
    getCenter: function () {
        var center = this.mapInstance.getCenter();
        return MapAdapter.toLatLng(center)
    },
    getZoom: function () {
        return this.mapInstance.getZoom();
    },
    setZoom: function (zoom) {
        this.mapInstance.setZoom(zoom);
    },
    addEventListener: function (evtName, fun) {
        this.dispatchListener.call(this, evtName, fun);
    },
    removeOverlay: function (overlay) {
        this.mapInstance.removeOverlay(overlay)
    },
    clearAllOverlay: function () {
        
    },

    drawMarker: function (latLng) {
        var point = MapAdapter.toBMapPoint(latLng);
        var bMarker = new BMap.Marker(point);        // 创建标注    
        this.mapInstance.addOverlay(bMarker);
        var marker = new Marker();
        marker.setMarker(bMarker);
        marker.setAdapter(this);
        return marker;
    },
    dispatchListener: function (evtName, fun) {
        var that = this;
        switch (evtName) {
            case "zoom_changed":
                this.mapInstance.addEventListener("zoomend", function () {
                    var param = {
                        type: evtName,
                        zoom: that.mapInstance.getZoom(),
                    }
                    fun && fun(param);
                });
                break;
            default:
                console.error("暂不支持[" + evtName + "]事件")
        }

    },
    getPoint:function(location,fun){
        var geocoder = new BMap.Geocoder();        
        geocoder.getPoint(location, function(point,addressComponent){ 
            if (point && fun) {   
                var latLng =    MapAdapter.toLatLng(point);
                var address = new AddressComponent(addressComponent.city);
               fun(latLng,address);   
            }      
        });
    }
}

function QQMapAdapter() {
    this.container = null;
    this.zoom = 8;
    this.type = 2;
    this.center = new LatLng(39.915, 116.404);
}
QQMapAdapter.prototype = {

    setCenter: function (point) {
        var center = MapAdapter.toQQMapPoint(point);
        this.mapInstance.setCenter(center);
    },
    setZoom: function (zoom) {
        this.mapInstance.setZoom(zoom);
    },
    getCenter: function () {
        var center = this.mapInstance.getCenter();
        return MapAdapter.toLatLng(center)
    },
    getZoom: function () {
        return this.mapInstance.getZoom();
    },
    addEventListener: function (evtName, fun) {

        this.dispatchListener.call(this, evtName, fun)
    },
    dispatchListener: function (evtName, fun) {
        var that = this;
        switch (evtName) {
            case "zoom_changed":
                qq.maps.event.addListener(that.mapInstance, evtName, function () {
                    var param = {
                        type: evtName,
                        zoom: that.mapInstance.getZoom(),
                    }
                    fun && fun(param)
                });
                break;
            default:
                console.error("暂不支持[" + evtName + "]事件")
        }

    },
    drawMarker: function (latLng) {
        var point = MapAdapter.toQQMapPoint(latLng);
        var bMarker = new qq.maps.Marker({
            position: point,
            map: this.mapInstance
        });        // 创建标注    
        var marker = new Marker();
        marker.setMarker(bMarker);
        marker.setAdapter(this);
        return marker;
    },
    removeOverlay: function (overlay) {
        overlay.setMap(null)
    },
    getPoint:function(location,fun){
      
    
        var geocoder =  new qq.maps.Geocoder();  
        geocoder.setComplete(function(result) {
            var latLng =    MapAdapter.toLatLng(result.detail.location);
            var addressComponent = result.detail.addressComponents;
            var address = new AddressComponent(addressComponent.city);
            fun && fun(latLng,address);
        });
        geocoder.setError(function(){
            console.error("解析地址错误");
        })
        geocoder.getLocation(location);
    }
}




