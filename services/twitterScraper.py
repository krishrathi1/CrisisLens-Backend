import tweepy
import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load API keys from environment
BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
MONGO_URI = os.getenv("MONGO_URI_PYTHON")

# Setup Twitter API v2
twitter_client = tweepy.Client(bearer_token=BEARER_TOKEN)

# Setup MongoDB Connection
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["disasterDB"]
collection = db["disasters"]

# Function to fetch tweets
def fetch_tweets():
    keywords = ["earthquake india", "flood india", "wildfire india", "hurricane india", "disaster india"]
    for keyword in keywords:
        try:
            query = f"{keyword} -is:retweet lang:en"
            tweets = twitter_client.search_recent_tweets(query=query, max_results=100, tweet_fields=["created_at", "geo"])

            if tweets.data:
                for tweet in tweets.data:
                    data = {
                        "source": "Twitter",
                        "content": tweet.text,
                        "location": tweet.geo,  # Might be None if location is not shared
                        "disaster_type": keyword,
                        "timestamp": tweet.created_at
                    }
                    collection.insert_one(data)
                    
        except Exception as e:
            print(f"Error fetching tweets for {keyword}: {e}")

if __name__ == "__main__":
    fetch_tweets()