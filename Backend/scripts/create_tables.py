#!/usr/bin/env python3
import os
from db.db import get_connection


def run_sql_file(sql_path: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql = f.read()

        # split simple statements by ';' and execute non-empty ones
        statements = [s.strip() for s in sql.split(';') if s.strip()]
        for stmt in statements:
            cursor.execute(stmt)
        conn.commit()
        print('Executed SQL file:', sql_path)
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    base = os.path.dirname(__file__)
    sql_path = os.path.normpath(os.path.join(base, '..', 'db', 'sql', 'create_table.sql'))
    if not os.path.exists(sql_path):
        print('SQL file not found:', sql_path)
    else:
        run_sql_file(sql_path)
