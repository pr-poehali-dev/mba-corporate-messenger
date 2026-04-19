import json
import os
import psycopg2

ADMIN_KEY_DEFAULT = 'mba-admin-2026'

def handler(event: dict, context) -> dict:
    """
    Бизнес: админская функция для просмотра запросов кодов авторизации.
    Args: event с httpMethod, headers (X-Admin-Key)
          context с request_id
    Returns: HTTP response со списком запросов кодов
    """
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    headers = event.get('headers') or {}
    admin_key = headers.get('X-Admin-Key') or headers.get('x-admin-key') or ''
    expected_key = os.environ.get('ADMIN_KEY', ADMIN_KEY_DEFAULT)

    if admin_key != expected_key:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'unauthorized'})
        }

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, phone, code, status, created_at, used_at, ip "
            "FROM auth_codes ORDER BY created_at DESC LIMIT 100"
        )
        rows = cur.fetchall()
        items = []
        for r in rows:
            items.append({
                'id': r[0],
                'phone': r[1],
                'code': r[2],
                'status': r[3],
                'created_at': r[4].isoformat() if r[4] else None,
                'used_at': r[5].isoformat() if r[5] else None,
                'ip': r[6]
            })
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'items': items})
        }
    finally:
        cur.close()
        conn.close()
