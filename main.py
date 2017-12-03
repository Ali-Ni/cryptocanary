from canary.analysis import Analysis

analyzer = Analysis()

out = analyzer.get_sentiment("I love memes!")
print(out.magnitude)
print(out.score)