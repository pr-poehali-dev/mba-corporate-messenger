import json
import os
import random
import psycopg2

def handler(event: dict, context) -> dict:
    """
    Бизнес: авторизация пользователя через код подтверждения (код выдаёт админ).
    Args: event с httpMethod, body (action: request_code|verify_code, phone, code)
          context с request_id
    Returns: HTTP response с результатом операции
    """
    method = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        body = {}

    action = body.get('action', '')
    phone = (body.get('phone') or '').strip()
    code = (body.get('code') or '').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'phone required'})
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor()

    try:
        ip = ''
        try:
            ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '') or ''
        except Exception:
            ip = ''

        if action == 'request_code':
            new_code = f"{random.randint(0, 99999):05d}"
            phone_safe = phone.replace("'", "''")
            code_safe = new_code.replace("'", "''")
            ip_safe = ip.replace("'", "''")

            cur.execute(
                f"INSERT INTO auth_codes (phone, code, status, ip) "
                f"VALUES ('{phone_safe}', '{code_safe}', 'pending', '{ip_safe}') RETURNING id"
            )
            row = cur.fetchone()
            req_id = row[0] if row else None

            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'request_id': req_id})
            }

        if action == 'verify_code':
            if not code:
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'code required'})
                }
            phone_safe = phone.replace("'", "''")
            code_safe = code.replace("'", "''")
            cur.execute(
                f"SELECT id FROM auth_codes "
                f"WHERE phone = '{phone_safe}' AND code = '{code_safe}' AND status = 'pending' "
                f"ORDER BY created_at DESC LIMIT 1"
            )
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 401,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': False, 'error': 'invalid_code'})
                }
            code_id = row[0]
            cur.execute(
                f"UPDATE auth_codes SET status = 'used', used_at = CURRENT_TIMESTAMP WHERE id = {code_id}"
            )
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'user': {'phone': phone}})
            }

        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'unknown action'})
        }
    finally:
        cur.close()
        conn.close()
