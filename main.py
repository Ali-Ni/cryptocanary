from canary.analysis import Analysis
from canary.tweets import TweetStream
import time

analyzer = Analysis()

def nut(tweet):
  print(tweet.text, tweet.followers)

out = analyzer.get_sentiment("I love memes!")
stream = TweetStream(["bitcoin"], nut)
print(out.magnitude)
print(out.score)