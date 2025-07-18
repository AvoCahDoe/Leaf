from pymongo import MongoClient

# Replace the following with your MongoDB Atlas connection string
uri = "mongodb+srv://farid:farid@freecluster.gf5tdxb.mongodb.net/?retryWrites=true&w=majority&appName=FreeCluster"

# Create a MongoClient to the Atlas cluster
client = MongoClient(uri)

# Choose your database
db = client["sample_mflix"]

# Choose a collection
collection = db["movies"]

# Example operation: print the count of documents in the collection
print("Number of documents in collection:", collection.count_documents({}))
