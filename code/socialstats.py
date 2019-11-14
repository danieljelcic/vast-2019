# To-Do

# still something wrong with hashtags!!!!

import numpy as np

class User:
    def __init__(self, username):
        self.name = username
        self.posts = []
        self.mentioned = []
        self.score = None

    def add_post(self, post):
        self.posts.append(post)
        
    def add_mention(self, mention):
        self.mentioned.append(mention)

    def set_score(self, score):
        self.score = score


class Post:
    def __init__(self, username, body, timestamp, location):
        self.user = username
        self.body = body
        self.time = timestamp
        self.location = location
        self.mentions = [] # list of strings corresponding to user key
        self.hashtags = [] # list of strings corresponding to hashtag key
        self.reposts = []
        self.score = None

        split_body = body.split()
        for split in split_body:
            if not split:
                continue
            elif split[0] == '@':
                self.mentions.append(str(split[1:]))
            elif split[0] == '#':
                self.hashtags.append(str(split[1:]))

    def add_hashtags(self, tag):
        self.hashtags.append(tag)
        
    def add_mention(self, mention):
        self.mentions.append(mention)
        
    def add_repost(self, repost):
        self.reposts.append(repost)

    def set_score(self, score):
        self.score = score

class Repost:
    def __init__(self, user, time, location):
        self.user = user
        self.timestamp = time
        self.location = location

class Hashtag:
    def __init__(self, body):
        self.body = body
        self.occurences = [] # list of post object references

    def add_occurence(self, post):
        self.occurences.append(post)


data = np.genfromtxt('../data/YInt.csv', delimiter='","', skip_header=1, dtype='str', encoding='utf-8', comments=None)

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

# users are hashed by their username, which is assumed to be unique
# posts are hashed by their body: if there are multiple posts with the same body
#   a chain is created
# posts starting with "re: " are added to the Post.reposts of the post that the current body hases to;
#   if that key hashes to a chain, the repost is not counted


posts = {} # dictionary of lists of Post objects
users = {} # dictionary of User objects
hashtags = {}
locations = [] # list of location names, index of each corresponds to its ID

for row in data:
    
    time, location_name, user_name, body = row

    # process new user

    if user_name not in users:
        users[user_name] = User(user_name)

    # pocess location

    if location_name in locations:
        location = locations.index(location_name)
    else:
        locations.append(location_name)
        location = len(locations) - 1

    # posts without body
    if len(body) == 0:
        continue
    # process repost
    elif body[:4] == 're: ':
        body = body[4:]

        # if the original post hasn't been seen yet (invalid repost)
        if body not in posts:
            continue
        # if the original post hasn't been seen more than once
        elif len(posts[body]) > 1:
            continue
        else:
            repost = Repost(users[user_name], time, location)
            posts[body][0].add_repost(repost)
    
    # process normal post
    else:
        post = Post(users[user_name], body, time, location)

        # chaining
        if body in posts:
            posts[body].append(post)
        # unique post
        else:
            posts[body] = [post]

        post_ref = posts[body][-1] 

        # add curr post to user's list of posts
        users[user_name].add_post(post_ref)

        # add curr post's mentions to all the users' mentions lists
        for user in post.mentions:
            if user not in users:
                users[user] = User(user)
            users[user].add_mention(post)

        # record hashtags
        for hashtag in post.hashtags:
            if hashtag not in hashtags:
                hashtags[hashtag] = Hashtag(hashtag)
            hashtags[hashtag].add_occurence(post)

# set unscaled scores
max_user_unscaled_score = 0
for user in users.values():

    reposts = 0
    for post in user.posts:
        reposts += len(post.reposts)
    
    user_unscaled_score = reposts + len(user.mentioned)
    user.set_score(user_unscaled_score)

    max_user_unscaled_score = user_unscaled_score if user_unscaled_score > max_user_unscaled_score else max_user_unscaled_score

# set up numpy array to export user score data
users_export = np.empty(dtype=np.dtype('U100'), shape=(len(users) + 1, 2))
users_export[0][0] = "usernname"
users_export[0][1] = "score"

# scale user scores and put them into the np array
for i, user in enumerate(users.values()):
    user.set_score(user.score / max_user_unscaled_score)

    users_export[i+1][0] = user.name
    users_export[i+1][1] = "{:.6f}".format(user.score)

# export user score file
np.savetxt("user_scores.csv", users_export, delimiter=",", fmt='%s')

# set rankings for posts
for post in posts.values():
    num_reposts = len(post[0].reposts)
    user = post[0].user
    
    post_rank = (1 + user.score) * num_reposts
    post[0].set_score(post_rank)

data_export = np.empty(dtype=np.dtype('U500'), shape=(len(posts) + 1, 5))
data_export[0] = ['time', 'location', 'user', 'post', 'post_score']

for i, post in enumerate(posts.values()):
    data_export[i+1] = ['\"{0}\"'.format(post[0].time), '\"{0}\"'.format(locations[post[0].location]), '\"{0}\"'.format(post[0].user.name), '\"{0}\"'.format(post[0].body), '\"{0}\"'.format(str(post[0].score))]

np.savetxt("data.csv", data_export, delimiter=",", fmt='%s', encoding='utf-8')

'''

user ranking

- count total num of reposts for each post of each user
- count total num of mentions
- add those two up
- find the max
- scale based on the max


post ranking

- for each post
    - get length of reposts
    - scale based on user rating --> num_reposts * (1 + user_ranking)

new data set

time | location | user | post | post_score


'''