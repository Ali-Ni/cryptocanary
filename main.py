from canary.analysis import Analysis
from canary.tweets import TweetStream
import time

analyzer = Analysis()

out = analyzer.get_sentiment("I love memes!")
stream = TweetStream("bitcoin")
print(out.magnitude)
print(out.score)
while True:
  time.sleep(1)