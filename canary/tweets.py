import json
from collections import defaultdict

from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

conf = json.load(open('./credentials/twitter_credentials.json'))

ACCESS_TOKEN = conf["accessToken"]
ACCESS_TOKEN_SECRET = conf["accessTokenSecret"]
CONSUMER_KEY = conf["consumerKey"]
CONSUMER_SECRET = conf["consumerSecret"]

FOLLOWER_LOWER_LIMIT = 15


class Tweet:
    def __init__(self, text, followers):
        self.text = text
        self.followers = followers


class _TweetListener(StreamListener):
    def __init__(self, callback):
        super(_TweetListener, self).__init__()
        self.callback = callback

    def on_data(self, data):
        obj = defaultdict(int, json.loads(data))
        if obj["lang"] != "en" or "retweeted_status" in obj or obj["user"]["followers_count"] < FOLLOWER_LOWER_LIMIT:
            return True
        tweet = Tweet(obj["text"], obj["user"]["followers_count"])
        self.callback(tweet)
        return True

    def on_error(self, status):
        print(status)
        return False


class TweetStream:
    def __init__(self, keywords, callback):
        listener = _TweetListener(callback)
        auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
        auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        stream = Stream(auth, listener)
        stream.filter(track=keywords, async=True)
