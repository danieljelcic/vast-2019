import numpy as np

# Imports the Google Cloud client library
from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

# Instantiates a client
client = language.LanguageServiceClient()

# Generating Data
data = np.genfromtxt('../static/data/data.csv', delimiter='","', skip_header=1, dtype='str', encoding='utf-8', comments=None)

def clean_lt_double_quotes(data):
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            curr = data[i][j]
            if not curr:
                continue
                
            start = 1 if curr[0] == '"' else 0
            end = -1 if curr[-1] == '"' else len(curr)
            data[i][j] = curr[start:end]

clean_lt_double_quotes(data)


# Calculates sentiment score and writes results to a file
with open("../static/data/sentiment-data.csv", "w") as writer:
    for info in data:
        line = info[3]
        print(line)
        document = types.Document(
            content=line,
            type=enums.Document.Type.PLAIN_TEXT)

        # Detects the sentiment of the text
        sentiment = client.analyze_sentiment(document=document).document_sentiment
        line = line.rstrip()
        writer.writelines(str(sentiment.score) + ", " + str(sentiment.magnitude) + "\n")
