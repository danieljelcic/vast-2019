from flask import Flask, current_app, send_from_directory, request, jsonify
import os
import psycopg2
import json
from psycopg2.extras import RealDictCursor
from datetime import date, datetime
import decimal
import json

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

    query = request.json['query'] if request.is_json else "Sorry :("
    print('query:', query)
    response = query_db(query)
    print('successfuly got a response')
    return query if not request.is_json else response

@app.route('/test', methods=['GET'])
def test_get():
    print('In test get')
    response = json.dumps({ 'res': request.args.get('query')})
    print(response)
    return response

@app.route('/test_post', methods=['POST'])
def test_post():
    print('In test get')
    query = request.json['query'] if request.is_json else "Sorry :("
    response = json.dumps({ 'res': query})
    print(response)
    return response

# returns json
def query_db(query):
    DATABASE_URL = os.environ['DATABASE_URL']

    if DATABASE_URL == 'local':
        conn = psycopg2.connect(host="localhost",database="vast_test", user="postgres", password="290BostonAve")
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