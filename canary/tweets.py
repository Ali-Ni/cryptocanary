import json

from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

conf = json.load(open('./credentials/twitter_credentials.json'))

ACCESS_TOKEN = conf["accessToken"]
ACCESS_TOKEN_SECRET = conf["accessTokenSecret"]
CONSUMER_KEY = conf["consumerKey"]
CONSUMER_SECRET = conf["consumerSecret"]

FOLLOWER_LOWER_LIMIT = 15


class TweetListener(StreamListener):

    def on_data(self, data):
        obj = json.loads(data)
        if obj["lang"] != "en" or "retweeted_status" in obj or obj["user"]["followers_count"] < FOLLOWER_LOWER_LIMIT:
            return True
        print(obj["text"])
        print(obj["user"]["followers_count"])
        return True

    def on_error(self, status):
        print(status)


class TweetStream:
    def __init__(self, keywords):
        listener = TweetListener()
        auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
        auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        stream = Stream(auth, listener)
        stream.filter(track=keywords, async=True)
