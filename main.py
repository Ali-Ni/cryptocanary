from canary.analysis import Analysis
from canary.tweets import TweetStream
import time

bitcoin = Analysis()

def nut(tweet):
  bitcoin.process_tweet(tweet)
  #print(tweet.followers)
  print(bitcoin.get_value())
  print()

#out = analyzer.get_sentiment("I love memes!")
stream = TweetStream(["bitcoin"], nut)
