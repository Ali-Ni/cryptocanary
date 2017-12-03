import requests
import time
import threading


class Update:
    def __init__(self, currency, price, timestamp):
        self.currency = currency
        self.price = price
        self.timestamp = timestamp


class Ticker:
    def __init__(self, currency, callback):
        url = "https://api.cryptonator.com/api/ticker/" + currency + "-usd"
        self.thread = threading.Thread(target=self._loop, args=(url, callback))
        self.thread.start()

    def kill(self):
        self.thread.stop()

    def _loop(self, url, callback):
        prev_time = None
        while True:
            time.sleep(5)
            r = requests.get(url)
            if r.status_code != 200:
                continue
            data = r.json()
            timestamp = data["timestamp"]
            if prev_time == timestamp:
                continue
            else:
                prev_time = timestamp
            update = Update(data["ticker"]["base"],
                            data["ticker"]["price"], timestamp)
            callback(update)
