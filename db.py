import pymysql

def db_connection():
    conn = None
    try:
        conn = pymysql.connect(
            host="34.176.222.47",
            user="user",
            password="lagata",
            database="EscuelaDB",
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
    except pymysql.MySQLError as e:
        print(e)
    return conn