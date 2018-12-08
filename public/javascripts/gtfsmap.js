var mymap = L.map('mapid').setView([34.673716, 133.923387], 15);
var shapeLayer;

L.tileLayer(
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
    { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }
).addTo(mymap);
getStops("stops");

const geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

const shapeStyle = {
    "color": "#2378e3",
    "weight": 5,
    "opacity": 0.65
};

var setInterval_ID = 0

// slider
var $slider = $('.slider');
$slider.slick({
    // スライドの高さが違うときに自動調整するか [初期値:false]
    adaptiveHeight: true,
    // 自動再生するか [初期値:false]
    autoplay: true,
    // 自動再生で切り替えする時間(ミリ秒) [初期値:3000]
    autoplaySpeed: 3000,
    // 前次ボタンを表示するか [初期値:true]
    arrows: false,
    // slidesToShowが奇数のとき、現在のスライドを中央に表示するか [初期値:false]
    centerMode: true,
    // centerMode:trueのとき、左右のスライドをチラ見せさせる幅 [初期値:'50px']
    centerPadding: '0px',
    // スライドをループさせるか [初期値:true]
    infinite: true,
    // autoplay:trueのとき、マウスフォーカスしたら一時停止させるか [初期値:true]
    pauseOnFocus: false,
    // autoplay:trueのとき、マウスホバーしたら一時停止させるか [初期値:true]
    pauseOnHover: false,
    // レスポンシブ設定の基準（window/slider/min） [初期値:'window']
    respondTo: 'slider',
});

// mapの表示/非表示切り替え
$('#togglebutton').click(function(){
    // $('#mapid').toggle();
    const p2 = document.getElementById("mapid");
    if(p2.style.visibility=="visible"){
		// hiddenで非表示
		p2.style.visibility ="hidden";
	}else{
		// visibleで表示
		p2.style.visibility ="visible";
	}
});

var obj_UpLoadButton = document.getElementById("uploadfile");

obj_UpLoadButton.addEventListener("change", function(evt){
  var file = evt.target.files;
  var reader = new FileReader();
  
  //dataURL形式でファイルを読み込む
  reader.readAsDataURL(file[0]);
  
  //ファイルの読込が終了した時の処理
  reader.onload = function(){
    var dataUrl = reader.result;

    //読み込んだ画像とdataURLを書き出す
    $slider.slick('slickAdd', "<div>" + "<img src='" + dataUrl + "'>" + "</div>");
  }
},false);

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.stop_name) {
        const sid = feature.properties.stop_id;
        layer.bindPopup(feature.properties.stop_name + " " + feature.properties.stop_id).on('click', call_updateTimetable);
    }
}


async function getStops(url) {
    const response = await fetch(url);
    const json = await response.json();
//    console.log(json);

    L.geoJSON(json, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);
}

// 60秒毎にデータを更新するための関数．
async function call_updateTimetable(event){
    // この関数が複数回呼び出されていた場合，前回分のsetIntervalを停止させる
    if(setInterval_ID != 0){
        clearInterval(setInterval_ID)
    }
    await updateTimetable(event)
    setInterval_ID =  setInterval(async function() {
        updateTimetable(event)
    },60000);
}


async function updateTimetable(event){
    const stop_id = event.target.feature.properties.stop_id;
    console.log(event.target.feature.properties.stop_id);
    const response = await fetch('/timetable/' + stop_id);
    const json = await response.json();
//    console.log(json);

    const html = `
    <table class="table table-sm table-hover">
    ${
        json.stop_times.map(function(i){
            return `
    <tr class="timetable-line" data-shape_id="${i['shape_id']}" data-service_id="${i['service_id']}" data-route_id="${i['route_id']}" data-trip_id="${i['trip_id']}">
        <!-- <td>${i['service_id']}</td> -->
        <td>${i['headsign']}行き</td>
        <td>${i['route_long_name']}</td>
        <td>${i['departure_time'].substring(0, 5)}</td>
        <td>${i['agency_name']}</td>
        <td>あと${i['time_left']}分です</td>
        <!-- <td>${i['shape_id']}</td> -->
    </tr>`;
        }).join('\n')
    }
    </table>
    `;

    document.querySelector("#timetable").innerHTML = html;

    $('.timetable-line').on('click', function(event){
        displayShape(event.target.parentNode.dataset.shape_id);
    });
    
}

async function displayShape(shape_id){
    const response = await fetch('/shape/' + shape_id);
    const json = await response.json();

    if(shapeLayer)shapeLayer.remove();
    shapeLayer= L.geoJSON(json, {
            style: shapeStyle
    })
    shapeLayer.addTo(mymap);

}