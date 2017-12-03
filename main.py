from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from canary.analysis import Analysis
from canary.tweets import TweetStream
from canary.crypto import Ticker


app = Flask(__name__, static_folder="web/public", static_url_path="")
socketio = SocketIO(app, async_mode="threading")

bitcoin = Analysis()
etherium = Analysis()


def emit_tweet(crypto):
    def f(tweet):
        delta = crypto.process_tweet(tweet)
        payload = {"tweet": {"text": tweet.text, "followers": tweet.followers, "name": tweet.name},
                   "sentiment": crypto.get_value(), "delta": delta}
        socketio.emit("tweet", payload)
    return f


def emit_update(update):
    payload = {"currency": update.currency, "price": update.price, "timestamp": update.timestamp}
    socketio.emit("ticker", payload)


#btc_stream = TweetStream(["bitcoin", "btc"], emit_tweet(bitcoin))
#eth_stream = TweetStream(["ethereum", "eth"], emit_tweet(etherium))
btc_ticker = Ticker("btc", emit_update)
eth_ticker = Ticker("eth", emit_update)


@app.route("/")
def root():
    return app.send_static_file("index.html")


@socketio.on("connect", namespace="/")
def test_connect():
    emit("connected", {"data": "Connected"})


if __name__ == "__main__":
    socketio.run(app)
