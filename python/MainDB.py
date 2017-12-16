# -*- coding: utf-8 -*-
import mysql.connector
import sys
import json

reload(sys)
sys.setdefaultencoding('utf8')
import mysql.connector
from mysql.connector import cursor


def connect():
    conn = mysql.connector.connect(host='195.42.183.91',database='KenigQuest',user='semak',password='12345')
    # if conn.is_connected():
    #	print('Connected to MySQL database')
    a = 1
    return conn


def query_db(_sql, _args, one = False):
    conn = connect()
    cursor = conn.cursor()
    cursor.execute(_sql, _args)
    r = [dict((cursor.description[i][0], value) \
              for i, value in enumerate(row)) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return (r[0] if r else None) if one else r


def query_db_table(_table, _args = [], addFilter = '', one = False):
    sql = "select * from %s"%_table
    if(len(_args)==0):
        sql = sql
    else:
        sql = "%s where 1=1" % sql
        for k, v in _args.items():
            whereClause = "and %s = %s(%s)s"%(k,'%',k)
            sql ="%s %s" %(sql,whereClause)
    if(addFilter!=''):
        sql = "%s AND %s "%(sql,addFilter)
    return query_db(sql, _args, one)


def query_db_no_ret(_sql,_args):
    conn = connect()
    cursor = conn.cursor()
    cursor.execute(_sql, _args)
    conn.commit()
    id = cursor.lastrowid
    cursor.close()
    conn.close()
    return id

def call_proc(_procName,_args):
    conn = connect()
    cursor = conn.cursor()
    cursor.callproc(_procName, _args)
    conn.commit()
    cursor.close()
    conn.close()

