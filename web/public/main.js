var BUY_SELL_FRAC = 0.1

var USD_INIT = 10000;
var BTC_INIT = 1;
var ETH_INIT = 10;

var USD_current;
var BTC_current;
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
    USD_current = parseFloat(localStorage.getItem("USD"));
    BTC_current = parseFloat(localStorage.getItem("BTC"));
    ETH_current = parseFloat(localStorage.getItem("ETH"));
    TIMESTAMP_INIT = parseInt(localStorage.getItem("TIMESTAMP_INIT"));
}

function updateAssets(){
    $("#USD")[0].innerHTML = USD_current;
    $("#BTC")[0].innerHTML = BTC_current;
    $("#ETH")[0].innerHTML = ETH_current;
    if(BTC_ticker != 0 && ETH_ticker != 0){
        $("#profit")[0].innerHTML = Math.floor((USD_current + BTC_current*BTC_ticker + ETH_current*ETH_ticker) - (USD_INIT + BTC_INIT*BTC_ticker + ETH_INIT*ETH_ticker));        
    }
    localStorage.setItem("USD", USD_current);
    localStorage.setItem("BTC", BTC_current);
    localStorage.setItem("ETH", ETH_current);
}


$(document).ready(function(){
    const socket = io.connect("http://" + document.domain + ":" + location.port);
    updateAssets();
    var chartData;
    if(localStorage.getItem("chartData") == null){
        chartData = {borderColor: "#ffdd57", labels: [], datasets: [{data: []}]};
    }else{
        chartData = {borderColor: "#ffdd57", labels: [], datasets: [{data: JSON.parse(localStorage.getItem("chartData"))}]};
    }
    
    var chart = new Chart($("#chart")[0], {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            },
            scales: {
                xAxes: [{
                    type: 'category',
                    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                }] 
            }
        }
    });
    chart.canvas.parentNode.style.height = '48vh';

    function updateChart(timestamp){
        if(BTC_ticker == 0 || ETH_ticker == 0){
            return -1;
        }
        // var data = {x: (timestamp - TIMESTAMP_INIT)/60000,
        //             y: USD_current + BTC_current*BTC_ticker + ETH_current*ETH_ticker};
        var data = USD_current + BTC_current*BTC_ticker + ETH_current*ETH_ticker;
        
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });

        if(chart.data.datasets[0].data.length > 10){
            chart.data.datasets.forEach((dataset) => {
                dataset.data.pop(0);
            });
        }else{
            chart.data.labels.push(chart.data.labels.length-1);
        }
        console.log(chart.data)
        localStorage.setItem("chartData", JSON.stringify(chart.data.datasets[0].data));
        chart.update();
    }
    $("#tweet-template").hide();
    socket.on("connected", function(){
        console.log("connected");
    });
    socket.on("tweet", function(data){
        console.log("tweet");
        var item = $("#tweet-template").clone();
        item.attr("id", "");
        item.find(".name").text(data.tweet.name);
        item.find(".full_name").text(data.tweet.full_name);
        console.log(data.delta)
        if (data.delta > 0.1) {
          item.find(".tag").text("positive");
          item.find(".tag").removeClass("is-warning");
          item.find(".tag").addClass("is-success");
        } else if (data.delta < -0.05)  {
          item.find(".tag").text("negative");
          item.find(".tag").removeClass("is-warning");
          item.find(".tag").addClass("is-danger");
        }
        item.find(".text").text(data.tweet.text);
        item.find("img").attr("src", data.tweet.img);
        item.prependTo("#tweets .list");
        item.fadeIn();

        console.log(data);
    });

    socket.on("ticker", function(data){
        console.log("ticker");
        if(data.currency == "BTC"){
            BTC_ticker = parseFloat(data.price);
        }else if(data.currency == "ETH"){
            ETH_ticker = parseFloat(data.price);
        }else{
            throw "Unrecognized currency exception";
        }
        updateAssets();
        updateChart();
      console.log(data);
    });
    socket.on("buy", function(data){
        console.log("buy")
        var toBuy = USD_current * BUY_SELL_FRAC;
        USD_current -= toBuy;
        if(data.currency == "BTC"){
            BTC_current += Math.floor(toBuy/BTC_ticker);
        }else if(data.currency == "ETH"){
            ETH_current += Math.floor(toBuy/ETH_ticker);
        }else{
            throw "Unrecognized currency exception";
        }
        updateAssets();
        console.log(data)
    });
    socket.on("sell", function(data){
        var toSell;
        if(data.currency == "BTC"){
            toSell = BTC_currrent*BUY_SELL_FRAC;
            BTC_current -= toSell;
            USD_currrent += toSell*BTC_ticker;
            //update sentiment
        }else if(data.currency == "ETH"){
            toSell = ETH_currrent*BUY_SELL_FRAC;
            ETH_current -= toSell;
            USD_currrent += toSell*ETH_ticker;
            //update sentiment
        }else{
            throw "Unrecognized currency exception";
        }
        updateAssets();
        console.log("sell")
        console.log(data)
    });
});
