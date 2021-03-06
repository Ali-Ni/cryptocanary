from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types
import math
INFLUENCE_ERROR_FACTOR = 0.000001
FOLLOWER_LOWER_LIMIT = 15
SENTIMENT_INTERCEPT = -0.15
VOLUME_FACTOR = 0.1


class Analysis:
    """Tweet analysis"""
    def __init__(self, label):
        self.client = language.LanguageServiceClient()
        self.sum = 0
        self.label = label

    def get_sentiment(self, text):
        """Use google cloud NLP to retrieve the sentiment of the text"""
        #print("Getting sentiment value...")
        document = types.Document(
            content=text,
            type=enums.Document.Type.PLAIN_TEXT)
        try:
            sentiment = self.client.analyze_sentiment(document=document).document_sentiment
        except: 
            sentiment = 0
        return sentiment

    def process_tweet(self, tweet):
        """Process a tweet and add its weighted value to the sum of sentiments"""
        sentiment = self.get_sentiment(tweet.text)
        if sentiment == 0:
            return -1
        print("Sentiment: "+str(sentiment.score)+" Followers: ", str(tweet.followers))
        self.sum += sentiment.score*get_influence(tweet.followers)
        print("Sum: "+str(self.sum))      
        return sentiment.score

    def get_value(self):
        """Return a net sentiment value between -1 and 1"""
        return math.erf(VOLUME_FACTOR*self.sum)

    def soft_reset(self):
        """Soft reset of value"""
        self.sum /= 2

def get_influence(numfollowers):
    """Calculate an influence value (from 0-1) from the number of followers using a sigmoid function"""
    return math.erf(INFLUENCE_ERROR_FACTOR*numfollowers)
