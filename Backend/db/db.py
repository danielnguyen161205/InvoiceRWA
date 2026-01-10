from dbutils.pooled_db import PooledDB
import pymysql
from pymysql.cursors import DictCursor
from fastapi import Depends



USER = "avnadmin"
PASSWORD = "AVNS_Ulfgj5QiKBfkQbkOBDM"
HOST = "mysql-bfd5202-nguyenthai161205-25d3.l.aivencloud.com"
PORT   = 22740
DB = "invoicedb"


pool = PooledDB(
    creator=pymysql,
    maxconnections=20,
    blocking=True,
    host=HOST,
    port=PORT,
    user=USER,
    password=PASSWORD,
    database=DB,
    cursorclass=DictCursor,
    ssl={"ssl": {}},
)

def get_connection():
    return pool.connection()

def get_cursor():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()