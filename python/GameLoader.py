# -*- coding: utf-8 -*-

import MainDB
from xml.dom import minidom
'''
<task order="1">
      <name>Ш-1</name>
      <text>
        &lt;img src='%rootDir%/СМК-1.jpg' style="width:100%"/&gt;
		&lt;p&gt;Штиц вышел из вагона самым последним, но его неспешность была показной. В голове у Отто Штица уже включился обратный отсчет.&lt;/p&gt;
		&lt;p&gt;Разведчик сразу же прошел через арку. Монументальный столб был хорошо виден. Именно возле него должна была состояться первая встреча. Сейчас Штиц не отказался бы от помощи тевтонцев или ливонцев. Ему любой ценой нужна была…&lt;/p&gt;
        &lt;p&gt;Что?&lt;/p&gt;
      </text>
      <hints>
        <hint num="1">Ливонцы и тевтонцы – это ордена.</hint>
        <hint num="2">На самой вершине. </hint>
        <hint num="3">Победа</hint>
      </hints>
      <codes>
        <code>Победа</code>
      </codes>
    </task>
    '''


def parseTask(task_xml):
    task_order = task_xml.attributes["order"].value
    task_name = task_xml.getElementsByTagName("name")[0].firstChild.data
    task_text = task_xml.getElementsByTagName("text")[0].firstChild.data
    hints = []
    codes = []

    codes_xml = task_xml.getElementsByTagName("codes")[0].getElementsByTagName("code")
    for code in codes_xml:
        codes.append(code.firstChild.data)
    hints_xml = task_xml.getElementsByTagName("hints")
    if len(hints_xml) > 0:
        for hint in hints_xml[0].getElementsByTagName("hint"):
            hints.append(hint.firstChild.data)

    return {"order": task_order, "name": task_name, "text": task_text, "hints": hints, "codes": codes}


def load_task(task, game_id):
    return MainDB.query_db_no_ret("INSERT INTO task(_NAME,_TEXT, GAME_ID) VALUES(%(taskName)s,%(_text)s, %(gameId)s)",
                           {"taskName": task["name"], "_text": task["text"], "gameId": game_id})


def load_codes(code, task_id):
    similar_codes = code.split('^')
    main_code = similar_codes[0]
    MainDB.query_db_no_ret("INSERT INTO code(_TYPE,_VALUE, TASK_ID) VALUES('SIMPLE', %(_value)s, %(taskId)s)",
                                  {"_value": main_code, "taskId": task_id})
    for similar_code in similar_codes:
        MainDB.query_db_no_ret("INSERT INTO similar_code(CODE, REAL_CODE, TASK_ID) VALUES(%(code)s, %(realCode)s, %(taskId)s)",
                               {"code": similar_code, "realCode": main_code, "taskId": task_id})


def load_hints(hint, order, task_id):
    MainDB.query_db_no_ret("INSERT INTO hint(HINT_TEXT,HINT_ORDER, TASK_ID) VALUES(%(hintText)s, %(hintOrder)s, %(taskId)s)",
                           {"hintText": hint, "hintOrder": order, "taskId": task_id})

def load_game(game_id, game_name, game_text):
    MainDB.query_db_no_ret("INSERT INTO game(_ID, _NAME, _COMMENTS) VALUES(%(id)s, %(name)s, %(comments)s)",
                           {"id": game_id, "name": game_name, "comments": game_text})


def load_game_file(game_id, file_name):
    MainDB.query_db_no_ret("INSERT INTO game_file(GAME_ID, FILE_NAME) VALUES(%(gameId)s, %(name)s)",
                           {"gameId": game_id, "name": file_name})


def load_game_image(file_name):
    MainDB.query_db_no_ret("INSERT INTO game_image(FILE_NAME) VALUES(%(name)s)",
                            {"name": file_name})


def load_game_order(game_id, task_id, order):
    MainDB.query_db_no_ret("INSERT INTO game_order(GAME_ID, TASK_ID, TASK_ORDER, DONE) VALUES(%(gameId)s, %(taskId)s, %(taskOrder)s, 0)",
                           {"gameId": game_id, "taskId": task_id, "taskOrder": order})


def load_file(file_name):
    e = minidom.parse(file_name)
    gameInfo = e.getElementsByTagName("game")[0].getElementsByTagName("gameInfo")[0]
    gameId = gameInfo.attributes['id'].value
    gameName = e.getElementsByTagName("name")[0].firstChild.nodeValue
    gameComments = e.getElementsByTagName("comments")[0].firstChild.nodeValue
    load_game(gameId, gameName, gameComments)
    tasksXml = e.getElementsByTagName("game")[0].getElementsByTagName("tasks")
    imagesXml = e.getElementsByTagName("game")[0].getElementsByTagName("images")
    #print len(imagesXml)
    for imageXml in imagesXml[0].getElementsByTagName("img"):
        load_game_image(imageXml.firstChild.data)
    for imageXml in imagesXml[1].getElementsByTagName("img"):
        load_game_file(gameId, imageXml.firstChild.data)
    tasks = []
    for taskXml in tasksXml[0].getElementsByTagName("task"):
        task = parseTask(taskXml)
        tasks.append(task)
    for task in tasks:
        task_id = load_task(task, gameId)
        load_game_order(gameId, task_id, task["order"])
        i = 1
        for hint in task["hints"]:
            load_hints(hint, i, task_id)
            i = i + 1
        for code in task["codes"]:
            load_codes(code, task_id)
