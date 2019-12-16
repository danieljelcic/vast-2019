import os
import psycopg2
import json
from psycopg2.extras import RealDictCursor
from datetime import date, datetime
import decimal


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError ("Type %s not serializable" % type(obj))

DATABASE_URL = os.environ['DATABASE_URL']

if DATABASE_URL == 'local':
    conn = psycopg2.connect(host="localhost",database="postgres", user="postgres", password="290BostonAve")
else:
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')

cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute('SELECT * FROM test_time')
json = json.dumps(cur.fetchall(), indent=2, default=json_serial)
print(json)
cur.close()