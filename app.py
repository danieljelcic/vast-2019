from flask import Flask, current_app, send_from_directory, request, jsonify
import os
import psycopg2
import json
from psycopg2.extras import RealDictCursor
from datetime import date, datetime
import decimal

app = Flask(__name__)

@app.route('/')
def hello():
    return current_app.send_static_file('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/data', methods=['POST'])
def db_connect():
    print(request.content_type)
    query = request.form.get('query')
    print(query)
    return "Sorry :(" if query == None else query_db(query)

# returns json
def query_db(query):
    DATABASE_URL = os.environ['DATABASE_URL']

    if DATABASE_URL == 'local':
        conn = psycopg2.connect(host="localhost",database="postgres", user="postgres", password="290BostonAve")
    else:
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')

    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query)
    json_data = json.dumps(cur.fetchall(), indent=2, default=json_serial)
    # print(json)
    cur.close()

    return json_data
    

def json_serial(obj):

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError ("Type %s not serializable" % type(obj))


if __name__ == '__main__':
    app.run(debug=True)