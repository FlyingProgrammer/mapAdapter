function LatLng(lat, lng) {
    this.lat = lat;
    this.lng = lng;
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
    setTitle:function(title){
        this._marker.setTitle(title);
    },
    setMarker:function(marker){
        this._marker = marker;
    },
    setAdapter:function(adapter){
        this._mapInstance = adapter;
    },
    remove:function(){
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
            if(mapObj.mapInstance &&typeof mapObj.handle =="function"){
                mapObj.handle.call(mapObj);
            }
        })

    },
    toBMapPoint(latLng) {
        return new BMap.Point(latLng.lng, latLng.lat)
    },
    toQQMapPoint(latLng) {
        return new qq.maps.LatLng(latLng.lat, latLng.lng)
    }
}

function MapFactory(type, container, center, zoom,handle) {
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
        var point = new BMap.Point(center.lat, center.lng);
        MapAdapter.mapObj.setCenter(point);
    },
    getCenter: function () {

    },
    getZoom: function () {
        return this.mapInstance.getZoom();
    },
    setZoom: function (zoom) {
        MapAdapter.mapObj.setZoom(zoom);
    },
    addEventListener: function (evtName, fun) {
        this.dispatchListener.call(this,evtName, fun);
    },
    removeOverlay:function(overlay){
        this.mapInstance.removeOverlay(overlay)
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

    }
}

function QQMapAdapter() {
    this.container = null;
    this.zoom = 8;
    this.type = 2;
    this.center = new LatLng(39.915, 116.404);
}
QQMapAdapter.prototype = {

    setCenter: function () {

    },
    setZoom: function () {
    },
    getCenter: function () {

    },
    getZoom: function () {
        return this.mapInstance.getZoom();
    },
    addEventListener: function (evtName, fun) {

        this.dispatchListener.call(this,evtName, fun)
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
   
}
MapAdapter.prototype = {

    drawMarker: function () {

    },
    setCenter: function () {

    },
    setZoom: function () {

    },
}
window.onload = function () {
    MapFactory(1, document.getElementById("bmap"), null, 5,mapLoaded);
    MapFactory(2, document.getElementById("qqmap"),null,null,mapLoaded1);



}
function mapLoaded (){
    console.log(this)
    this.addEventListener("zoom_changed", function (data) {
        console.log(data)
    });
   
    var point = new LatLng(23,112);
    var marker = this.drawMarker(point);
    setTimeout(()=>{
        marker.remove();
    },3000)
}
function mapLoaded1 (){
    console.log(this)
    this.addEventListener("zoom_changed", function (data) {
        console.log(data)
    });

}

