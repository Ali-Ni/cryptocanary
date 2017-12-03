var BUY_SELL_FRAC = 0.1

var USD_INIT = 10000;
var BTC_INIT = 1;
var ETH_INIT = 1;

var USD_currrent;
var BTC_currrent;
var ETH_current;

var BTC_ticker = 0;
var ETH_ticker = 0;

var TIMESTAMP_INIT;

if (localStorage.getItem("USD") == null){
    USD_current = USD_INIT;
    BTC_current = BTC_INIT;
    ETH_current = ETH_INIT;
    TIMESTAMP_INIT = (new Date).getTime();
    localStorage.setItem("TIMESTAMP_INIT", TIMESTAMP_INIT);
}else{
    USD_current = localStorage.getItem("USD");
    BTC_current = localStorage.getItem("BTC");
    ETH_current = localStorage.getItem("ETH");
    TIMESTAMP_INIT = localStorage.getItem("TIMESTAMP_INIT");
}

function updateAssets(){
    $("#assets").innerHTML = USD_current + BTC_current*BTC_ticker + ETH_current*ETH_ticker;
}

$(document).ready(function(){
    const socket = io.connect("http://" + document.domain + ":" + location.port);
    var chartData;
    if(localStorage.getItem("chartData") == null){
        chartData = [];
    }else{
        chartData = localStorage.getItem("chartData");
    }
    
    var chart = new Chart($("#chart")[0], {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: false,
            scales: {
            xAxes: [{
                time: {
                unit: 'minute'
                }
            }]
            }
        }
    });
    chart.canvas.parentNode.style.height = '48vh';

    function updateChart(timestamp){
        var data = {x: (timestamp - TIMESTAMP_INIT)/60000,
                    y: USD_current + BTC_current*BTC_ticker + ETH_current*ETH_ticker};

        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });

        if(chart.datasets[0].data.length > 10){
            chart.data.datasets.forEach((dataset) => {
                dataset.data.pop(0);
            });
        }
        chart.update();
    }

    

    socket.on("connected", function(){
        console.log("connected");
    });
    socket.on("tweet", function(data){
        console.log("tweet");
        //update tweet, sentiment
        console.log(data);
    });
    socket.on("ticker", function(data){
        console.log("ticker");
        if(data.currency == "BTC"){
            BTC_ticker = data.price;
        }else if(data.currency == "ETH"){
            ETH_ticker = data.price;
        }else{
            throw "Unrecognized currency exception";
        }
        updateAssets(data.timestamp);
      console.log(data);
    });
    socket.on("buy", function(data){
        console.log("buy")
        var toBuy = USD_current * BUY_SELL_FRAC;
        USD_current -= toBuy;
        localStorage.setItem("USD", USD_currrent);
        if(data.currency == "BTC"){
            BTC_current += toBuy/BTC_ticker;
            localStorage.setItem("BTC", BTC_currrent);
            //update sentiment
        }else if(data.currency == "ETH"){
            ETH_current += toBuy/ETH_ticker;
            localStorage.setItem("ETH", ETH_current);
            //update sentiment
        }else{
            throw "Unrecognized currency exception";
        }
        console.log(data)
    });
    socket.on("sell", function(data){
        var toSell;
        if(data.currency == "BTC"){
            toSell = BTC_currrent*BUY_SELL_FRAC;
            BTC_current -= toSell;
            USD_currrent += toSell*BTC_ticker;
            localStorage.setItem("BTC", BTC_currrent);
            //update sentiment
        }else if(data.currency == "ETH"){
            toSell = ETH_currrent*BUY_SELL_FRAC;
            ETH_current -= toSell;
            USD_currrent += toSell*ETH_ticker;
            localStorage.setItem("ETH", ETH_current);
            //update sentiment
        }else{
            throw "Unrecognized currency exception";
        }
        localStorage.setItem("USD", USD_currrent);
        console.log("sell")
        console.log(data)
    });
});
