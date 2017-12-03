$(document).ready(function(){
    const socket = io.connect("http://" + document.domain + ":" + location.port);
    socket.on("connected", function(){
        console.log("connected");
    });
    socket.on("tweet", function(data){
        console.log("tweet");
        console.log(data);
    });
    socket.on("ticker", function(data){
      console.log("ticker");
      console.log(data);
  });
});
