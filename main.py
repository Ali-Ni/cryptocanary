from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from canary.analysis import Analysis
from canary.tweets import TweetStream


app = Flask(__name__, static_folder="web/public", static_url_path="")
socketio = SocketIO(app,async_mode='threading')

bitcoin = Analysis()

def process_bitcoin(tweet):
    print("processing")
    delta = bitcoin.process_tweet(tweet)
    payload = {'tweet': {'text': tweet.text, 'followers': tweet.followers}, 'sentiment': bitcoin.get_value(), 'delta': delta}
    socketio.emit('tweet', payload)
    print("sent payload")

bitcoin_stream = TweetStream(["bitcoin"], process_bitcoin)

@app.route("/")
def root():
    return app.send_static_file("index.html")

@socketio.on("connect", namespace="/")
def test_connect():
    emit("connected", {"data": "Connected"})


if __name__ == "__main__":
    socketio.run(app)
