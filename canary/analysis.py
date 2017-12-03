from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types
import math
INFLUENCE_ERROR_FACTOR = 0.000001
FOLLOWER_LOWER_LIMIT = 15
VOLUME_FACTOR = 0.01

class Analysis:
    """Tweet analysis"""
    def __init__(self):
        self.client = language.LanguageServiceClient()
        self.numtweets = 0
    def get_sentiment(self, text):
        """Use google cloud NLP to retrieve the sentiment of the text"""
        document = types.Document(
            content=text,
            type=enums.Document.Type.PLAIN_TEXT)
        return self.client.analyze_sentiment(document=document).document_sentiment
    def get_volume_factor(self):
        """Return a factor from 0-1 dependant on the volume of tweets"""
        return math.erf(VOLUME_FACTOR*self.numtweets)
def get_influence(numfollowers):
    """Calculate an influence value (from 0-1) from the number of followers using a sigmoid function"""
    return math.erf(INFLUENCE_ERROR_FACTOR*(numfollowers-FOLLOWER_LOWER_LIMIT))
