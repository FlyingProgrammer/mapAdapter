function LatLng(lat,lng){
    this.lat = lat;
    this.lng = lng;
}
var MapAdapter={
    MapType:{
        BMAP:1,
        QQMAP:2
    },
    eventList: {
            "zoom_changed":["zoomend","zoom_changed"] 
        }  
    ,
    maps:[],
    MapFactory:MapFactory,
    
    initMap:function(){
        MapAdapter.maps.filter(item => item.mapInstance==null).forEach((mapObj)=>{
            if(mapObj.type == 1){
                mapObj.mapInstance = new BMap.Map(mapObj.container); 
                var point =  mapObj.center ;
                mapObj.mapInstance.centerAndZoom(MapAdapter.toBMapPoint(point),mapObj.zoom);
                mapObj.mapInstance.enableScrollWheelZoom(true); 
            }
           
            else if(mapObj.type == 2){
                var point = mapObj.center;
                var myOptions = {
                    zoom:  mapObj.zoom,
                    center: MapAdapter.toQQMapPoint(point),
                    zoomControl:false,
                    scaleControl:false,
                    mapTypeControl:false,
                    panControl:false
                };
                mapObj.mapInstance = new qq.maps.Map(mapObj.container,myOptions); 
            }
        })
       
    },
    toBMapPoint(latLng){
        return new BMap.Point( latLng.lng,latLng.lat)
    },
    toQQMapPoint(latLng){
        return  new qq.maps.LatLng(latLng.lat, latLng.lng)
    }
}

function MapFactory(type,container,center,zoom){
    if(!(type &&  container)){
        console.error("type和container不能为空");
        return;   
    }
    center &&  (MapAdapter.center = center) ;
    zoom && (MapAdapter.zoom = zoom);
    MapAdapter.container = container;
    var map = {};
    if(type === 1){
        map =  new BMapAdapter();
    }
    else if(type === 2){
        map =  new QQMapAdapter();
    }
    map.mapInstance = null;
    map.type = type;
    map.container = container;
    center && (map.center = center);
    zoom && (map.zoom = zoom);
    MapAdapter.maps.push(map);
    loadMapScript(type)
    return map;
}
function loadMapScript(type){
    var src  ="";
    if(type == 1){
       if(typeof BMap != "undefined"){
            MapAdapter.initMap();
            return;
       }
       src =  "http://api.map.baidu.com/api?v=2.0&ak=020EONzGzbIU96064GCgRv0jpoX69dk3&callback=MapAdapter.initMap";
    }
    else if(type == 2){
        if(typeof qq != "undefined"){
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
function BMapAdapter(){
    this.container = null;
    this.zoom = 8;
    this.type = 1;
    this.center = new LatLng(39.915,116.404);
}
BMapAdapter.prototype={
    setCenter:function(center){
        var point = new BMap.Point(center.lat, center.lng);
        MapAdapter.mapObj.setCenter(point);
    },
    getCenter:function(){

    },
    getZoom:function(){
        return this.mapInstance.getZoom();
    },
    setZoom:function(zoom){
        MapAdapter.mapObj.setZoom(zoom);
    },
    addEventListener:function(evtName,fun){
        var names = MapAdapter.eventList[evtName];
        if(names){
            evtName = names[this.type-1];
           
        }
        else{
            console.error("暂不支持["+evtName+"]事件")
        }
        var that = this;
        var maxTimes = 20; //
        var i = 0;
        var timer1 = setInterval(()=>{
            i++;
            if(i > maxTimes ){
                clearInterval(timer1); 
            }
            if(that.mapInstance ){
                clearInterval(timer1);
                that.mapInstance.addEventListener(evtName,function(){
                    var param = {
                        zoom:that.mapInstance.getZoom(),
                    }
                    fun(param);
                });
            }
        },100)
    },
}
function QQMapAdapter(){
    this.container = null;
    this.zoom = 8;
    this.type = 2;
    this.center = new LatLng(39.915,116.404);
}
QQMapAdapter.prototype={
    
    setCenter:function(){

    },
    setZoom:function(){

    },
    getCenter:function(){

    },
    getZoom:function(){
        return this.mapInstance.getZoom();
    },
    addEventListener:function(evtName,fun){
        var names = MapAdapter.eventList[evtName];
        if(names){
            evtName = names[this.type-1];
           
        }
        else{
            console.error("暂不支持["+evtName+"]事件")
        }
        var that = this;
        var maxTimes = 20; //
        var i = 0;
        var timer1 = setInterval(()=>{
            i++;
            if(i > maxTimes ){
                clearInterval(timer1); 
            }
            if(that.mapInstance ){
                clearInterval(timer1);
                qq.maps.event.addListener(that.mapInstance,evtName,function(){
                    var param = {
                        zoom:that.mapInstance.getZoom(),
                    }
                    fun(param)
                });
            }
        },100)
    }
}
MapAdapter.prototype={
    
    drawMarker:function(){

    },
    setCenter:function(){

    },
    setZoom:function(){

    },
}
window.onload = function(){
    var bmap = MapFactory(1,document.getElementById("bmap"),null,5);
    bmap.addEventListener("zoom_changed",function(data){
        console.log(data)
    });
    var qqmap = MapFactory(2,document.getElementById("qqmap"));
    qqmap.addEventListener("zoom_changed",function(data){
        console.log(data)
    });
    setTimeout(()=>{
        bmap.getZoom();
        var bmap1 = MapFactory(1,document.getElementById("bmap1"));
    },5000)
   
}

