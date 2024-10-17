from flask import Flask, request, jsonify, session, render_template
from db import db_connection
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'
CORS(app)

#-----------------------------------------Personal-----------------------------------------#
# Login para Personal
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = db_connection()
    
    with conn.cursor() as cursor:
        # Verificar las credenciales del usuario
        cursor.execute("SELECT * FROM Personal WHERE PersonalId=%s AND PersonalContrasena=%s", (data['PersonalId'], data['PersonalContrasena']))
        personal = cursor.fetchone()

        if personal:
            rol_id = personal['PersonalRolId']
            
            # Obtener los menús asociados al rol
            cursor.execute("""
                SELECT m.MenuId, m.MenuDescripcion 
                FROM MenuRol mr 
                JOIN Menu m ON mr.MenuId = m.MenuId 
                WHERE mr.PersonalRolId = %s AND mr.MenuRolEstatus != 'I'
            """, (rol_id,))
            menus = cursor.fetchall()

            # Guardar información en la sesión
            session['personal_id'] = personal['PersonalId']
            session['rol'] = rol_id
            session['menus'] = menus

            return jsonify({'message': 'Login exitoso', 'personal': personal, 'menus': menus}), 200
        else:
            return jsonify({'message': 'ID o contraseña incorrectos'}), 401

# Crear un nuevo Personal
@app.route('/personal', methods=['POST'])
def create_personal():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(PersonalId) FROM Personal")
        max_id = cursor.fetchone()['MAX(PersonalId)'] or 1000
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A' 
        
        sql = "INSERT INTO Personal (PersonalId, PersonalNombre, PersonalPrimerApellido, PersonalSegundoApellido, PersonalContrasena, PersonalRolId, PersonalFechaModificacion, PersonalEstatus, PersonalModifica) VALUES (%s, %s, %s, %s, %s, %s, %s, , %s)"
        
        cursor.execute(sql, (new_id, data['PersonalNombre'], data['PersonalPrimerApellido'], data['PersonalSegundoApellido'], data['PersonalContrasena'], data['PersonalRolId'], fecha_modificacion, estatus, personal_id))
        conn.commit()

        return jsonify({'message': 'Personal creado', 'PersonalId': new_id}), 201

# Leer todos los Personal
@app.route('/personal', methods=['GET'])
def get_personal():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT p.*, pr.PersonalRolDescripcion 
            FROM Personal p 
            LEFT JOIN PersonalRol pr ON p.PersonalRolId = pr.PersonalRolId 
            WHERE p.PersonalEstatus != 'I'
        """)
        personal_list = cursor.fetchall()
    
    return jsonify(personal_list), 200  

# Leer un Personal por ID
@app.route('/personal/<int:id>', methods=['GET'])
def get_personal_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Personal WHERE PersonalId=%s AND PersonalEstatus != 'I'", (id,))
        personal = cursor.fetchone()
    
    if personal:
        return jsonify(personal), 200
    else:
        return jsonify({'message': 'Personal no encontrado'}), 404

# Actualizar un Personal
@app.route('/personal/<int:id>', methods=['PUT'])
def update_personal(id):
    data = request.json

    if 'PersonalNombre' not in data or 'PersonalContrasena' not in data:
        return jsonify({'message': 'Nombre y contraseña son requeridos'}), 400

    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Personal SET PersonalNombre=%s, PersonalPrimerApellido=%s, PersonalSegundoApellido=%s, PersonalContrasena=%s, PersonalRolId=%s, PersonalFechaModificacion=%s, PersonalEstatus=%s, PersonalModifica=%s WHERE PersonalId=%s"
        
        cursor.execute(sql, (data['PersonalNombre'], data.get('PersonalPrimerApellido'), data.get('PersonalSegundoApellido'), data['PersonalContrasena'], data.get('PersonalRolId'), fecha_modificacion, 'A', id, personal_id))
        conn.commit()

    return jsonify({'message': 'Personal actualizado'}), 200

# Eliminar un Personal (ocultar)
@app.route('/personal/<int:id>', methods=['DELETE'])
def delete_personal(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Personal SET PersonalFechaModificacion=%s, PersonalEstatus='I' WHERE PersonalId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Personal ocultado'}), 200

#-----------------------------------------Alumno-----------------------------------------#
# Crear un nuevo Alumno
@app.route('/alumno', methods=['POST'])
def create_alumno():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(AlumnoId) FROM Alumno")
        max_id = cursor.fetchone()['MAX(AlumnoId)'] or 4000
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A'
        
        sql = "INSERT INTO Alumno (AlumnoId, AlumnoNombre, AlumnoPrimerApellido, AlumnoSegundoApellido, AlumnoFechaModificacion, AlumnoEstatus, AlumnoPersonalModifica) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (new_id, data['AlumnoNombre'], data['AlumnoPrimerApellido'], data['AlumnoSegundoApellido'], fecha_modificacion, estatus, personal_id))
        conn.commit()
    
    return jsonify({'message': 'Alumno creado', 'AlumnoId': new_id}), 201

# Leer todos los Alumnos
@app.route('/alumnos', methods=['GET'])
def get_alumnos():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Alumno WHERE AlumnoEstatus != 'I'")
        alumnos = cursor.fetchall()
    return jsonify(alumnos), 200

# Actualizar un Alumno
@app.route('/alumno/<int:id>', methods=['PUT'])
def update_alumno(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Alumno SET AlumnoNombre=%s, AlumnoPrimerApellido=%s, AlumnoSegundoApellido=%s, AlumnoPersonalModifica=%s, AlumnoFechaModificacion=%s, AlumnoPersonalModifica=%s WHERE AlumnoId=%s"
        cursor.execute(sql, (data['AlumnoNombre'], data['AlumnoPrimerApellido'], data['AlumnoSegundoApellido'], data['AlumnoPersonalModifica'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Alumno actualizado'}), 200

# Eliminar un Alumno (ocultar)
@app.route('/alumno/<int:id>', methods=['DELETE'])
def delete_alumno(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Alumno SET AlumnoFechaModificacion=%s, AlumnoEstatus='I' WHERE AlumnoId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Alumno ocultado'}), 200

# Obtener un Alumno por ID
@app.route('/alumno/<int:id>', methods=['GET'])
def get_alumno(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Alumno WHERE AlumnoId=%s AND AlumnoEstatus != 'I'", (id,))
        alumno = cursor.fetchone()
    
    if alumno:
        return jsonify(alumno), 200
    else:
        return jsonify({'message': 'Alumno no encontrado'}), 404

#-----------------------------------------Docente-----------------------------------------#

# Crear un nuevo Docente
@app.route('/docente', methods=['POST'])
def create_docente():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(DocenteId) FROM Docente")
        max_id = cursor.fetchone()['MAX(DocenteId)'] or 2000
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A'
        
        sql = "INSERT INTO Docente (DocenteId, DocenteNombre, DocentePrimerApellido, DocenteSegundoApellido, DocenteFechaModificacion, DocenteEstatus, DocentePersonalModifica) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        
        cursor.execute(sql, (new_id, data['DocenteNombre'], data['DocentePrimerApellido'], data['DocenteSegundoApellido'], fecha_modificacion, estatus, personal_id))
        conn.commit()
    
    return jsonify({'message': 'Docente creado', 'DocenteId': new_id}), 201

# Leer todos los Docentes
@app.route('/docentes', methods=['GET'])
def get_docentes():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Docente WHERE DocenteEstatus != 'I'")
        docentes = cursor.fetchall()
    return jsonify(docentes), 200

# Leer un Docente por ID
@app.route('/docente/<int:id>', methods=['GET'])
def get_docente(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Docente WHERE DocenteId=%s AND DocenteEstatus != 'I'", (id,))
        docente = cursor.fetchone()
    
    if docente:
        return jsonify(docente), 200
    else:
        return jsonify({'message': 'Docente no encontrado'}), 404

# Actualizar un Docente
@app.route('/docente/<int:id>', methods=['PUT'])
def update_docente(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Docente SET DocenteNombre=%s, DocentePrimerApellido=%s, DocenteSegundoApellido=%s, DocenteFechaModificacion=%s, DocentePersonalModifica=%s WHERE DocenteId=%s"
        
        cursor.execute(sql, (data['DocenteNombre'], data['DocentePrimerApellido'], data['DocenteSegundoApellido'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Docente actualizado'}), 200

# Eliminar un Docente (ocultar)
@app.route('/docente/<int:id>', methods=['DELETE'])
def delete_docente(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Docente SET DocenteFechaModificacion=%s, DocenteEstatus='I' WHERE DocenteId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Docente ocultado'}), 200

#-----------------------------------------PersonalRol-----------------------------------------#

# Crear un nuevo PersonalRol
@app.route('/personalrol', methods=['POST'])
def create_personalrol():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(PersonalRolId) FROM PersonalRol")
        max_id = cursor.fetchone()['MAX(PersonalRolId)'] or 0
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A'
        
        sql = "INSERT INTO PersonalRol (PersonalRolId, PersonalRolDescripcion, PersonalRolFechaModificacion, PersonalRolEstatus, PersonalRolPersonalModifica) VALUES (%s, %s, %s, %s, %s)"
        
        cursor.execute(sql, (new_id, data['PersonalRolDescripcion'], fecha_modificacion, estatus, personal_id))
        conn.commit()
    
    return jsonify({'message': 'Personal Rol creado', 'PersonalRolId': new_id}), 201

# Leer todos los PersonalRol
@app.route('/personalroles', methods=['GET'])
def get_PersonalRol():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM PersonalRol WHERE PersonalRolEstatus != 'I'")
        personalrol = cursor.fetchall()
    return jsonify(personalrol), 200  

# Leer un PersonalRol por ID
@app.route('/personalrol/<int:id>', methods=['GET'])
def get_personalrol_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM PersonalRol WHERE PersonalRolId=%s AND PersonalRolEstatus != 'I'", (id,))
        personalrol = cursor.fetchone()
    
    if personalrol:
        return jsonify(personalrol), 200
    else:
        return jsonify({'message': 'Personal Rol no encontrado'}), 404

# Actualizar un personal rol
@app.route('/personalrol/<int:id>', methods=['PUT'])
def update_personalrol(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE PersonalRol SET PersonalRolDescripcion=%s, PersonalRolFechaModificacion=%s, PersonalRolPersonalModifica=%s WHERE PersonalRolId=%s"
        
        cursor.execute(sql, (data['PersonalRolDescripcion'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Personal Rol actualizado'}), 200

# Eliminar un Personal Rol (ocultar)
@app.route('/personalrol/<int:id>', methods=['DELETE'])
def delete_personalrol(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE PersonalRol SET PersonalRolFechaModificacion=%s, PersonalRolEstatus='I' WHERE PersonalRolId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Personal Rol ocultado'}), 200

#-----------------------------------------Menu-----------------------------------------#

# Crear un nuevo Menu
@app.route('/menu', methods=['POST'])
def create_menu():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(MenuId) FROM Menu")
        max_id = cursor.fetchone()['MAX(MenuId)'] or 0
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A' 
        
        sql = "INSERT INTO Menu (MenuId, MenuDescripcion, MenuFechaModificacion, MenuEstatus, MenuPersonalModifica) VALUES (%s, %s, %s, %s, %s)"
        
        cursor.execute(sql, (new_id, data['MenuDescripcion'], fecha_modificacion, estatus, personal_id))
        conn.commit()

        return jsonify({'message': 'Menú creado', 'MenuId': new_id}), 201

# Leer todos los Menus
@app.route('/menus', methods=['GET'])
def get_menus():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Menu WHERE MenuEstatus != 'I'")
        menus = cursor.fetchall()
    return jsonify(menus), 200  

# Leer un Menu por ID
@app.route('/menu/<int:id>', methods=['GET'])
def get_menu_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Menu WHERE MenuId=%s AND MenuEstatus != 'I'", (id,))
        menu = cursor.fetchone()
    
    if menu:
        return jsonify(menu), 200
    else:
        return jsonify({'message': 'Menú no encontrado'}), 404

# Actualizar un Menu
@app.route('/menu/<int:id>', methods=['PUT'])
def update_menu(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Menu SET MenuDescripcion=%s, MenuFechaModificacion=%s, MenuPersonalModifica=%s WHERE MenuId=%s"
        
        cursor.execute(sql, (data['MenuDescripcion'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Menú actualizado'}), 200

# Eliminar un Menu (ocultar)
@app.route('/menu/<int:id>', methods=['DELETE'])
def delete_menu(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "UPDATE Menu SET MenuFechaModificacion=%s, MenuEstatus='I' WHERE MenuId=%s"
            cursor.execute(sql, (fecha_modificacion, id))
            conn.commit()

        return jsonify({'message': 'Menú ocultado'}), 200

    except Exception as e:
        print("Error al ocultar menú:", str(e))  # Imprimir error si ocurre
        return jsonify({'message': 'Error al ocultar menú'}), 500

#-----------------------------------------MenuRol-----------------------------------------#

# Crear un nuevo MenuRol
@app.route('/menurole', methods=['POST'])
def create_menurol():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(MenuRolId) FROM MenuRol")
        max_id = cursor.fetchone()['MAX(MenuRolId)'] or 0
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A' 
        
        sql = "INSERT INTO MenuRol (MenuRolId, PersonalRolId, MenuId, MenuRolFechaModificacion, MenuRolEstatus, MenuRolPersonalModifica) VALUES (%s, %s, %s, %s, %s, %s)"
        
        cursor.execute(sql, (new_id, data['PersonalRolId'], data['MenuId'], fecha_modificacion, estatus, personal_id))
        conn.commit()

        return jsonify({'message': 'Menú Rol creado', 'MenuRolId': new_id}), 201

# Leer todos los MenuRoles
@app.route('/menuroles', methods=['GET'])
def get_menuroles():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT mr.MenuRolId, mr.PersonalRolId, pr.PersonalRolDescripcion, mr.MenuId, m.MenuDescripcion, mr.MenuRolFechaModificacion, mr.MenuRolEstatus, mr.MenuRolPersonalModifica FROM MenuRol mr JOIN PersonalRol pr ON mr.PersonalRolId = pr.PersonalRolId JOIN Menu m ON mr.MenuId = m.MenuId WHERE mr.MenuRolEstatus != 'I'")
        menu_roles = cursor.fetchall()
    
    return jsonify(menu_roles), 200  

# Leer un MenuRol por ID
@app.route('/menurole/<int:id>', methods=['GET'])
def get_menurole_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM MenuRol WHERE MenuRolId=%s AND MenuRolEstatus != 'I'", (id,))
        menu_role = cursor.fetchone()
    
    if menu_role:
        return jsonify(menu_role), 200
    else:
        return jsonify({'message': 'Menú Rol no encontrado'}), 404

# Actualizar un MenuRol
@app.route('/menurole/<int:id>', methods=['PUT'])
def update_menurole(id):
    data = request.json
    
    # Verificar que se haya enviado PersonalRolId y MenuId
    if 'PersonalRolId' not in data or 'MenuId' not in data:
        return jsonify({'message': 'PersonalRolId y MenuId son requeridos'}), 400

    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE MenuRol SET PersonalRolId=%s, MenuId=%s, MenuRolFechaModificacion=%s, MenuRolPersonalModifica=%s WHERE MenuRolId=%s"
        
        cursor.execute(sql, (data['PersonalRolId'], data['MenuId'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Menú Rol actualizado'}), 200

# Eliminar un Menu Rol (ocultar)
@app.route('/menurole/<int:id>', methods=['DELETE'])
def delete_menurole(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE MenuRol SET MenuRolFechaModificacion=%s, MenuRolEstatus='I' WHERE MenuRolId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Menú Rol ocultado'}), 200

#-----------------------------------------Clientes(Padres)-----------------------------------------#

# Crear un nuevo Cliente
@app.route('/cliente', methods=['POST'])
def create_cliente():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(ClienteId) FROM Cliente")
        max_id = cursor.fetchone()['MAX(ClienteId)'] or 3000
        new_id = max_id + 1
        personal_id = session.get('personal_id')
        fecha_modificacion = datetime.now()
        estatus = 'A' 
        sql = "INSERT INTO Cliente (ClienteId, ClienteNombre, ClientePrimerApellido, ClienteSegundoApellido, AlumnoId, ClienteFechaModificacion, ClienteEstatus, ClientePersonalModifica) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (new_id, data['ClienteNombre'], data['ClientePrimerApellido'], data['ClienteSegundoApellido'], data['AlumnoId'], fecha_modificacion, estatus, personal_id))
        conn.commit()

        return jsonify({'message': 'Cliente creado', 'ClienteId': new_id}), 201

# Leer todos los Clientes
@app.route('/clientes', methods=['GET'])
def get_clientes():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Cliente WHERE ClienteEstatus != 'I'")
        clientes = cursor.fetchall()
    
    return jsonify(clientes), 200  

# Leer un Cliente por ID
@app.route('/cliente/<int:id>', methods=['GET'])
def get_cliente_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Cliente WHERE ClienteId=%s AND ClienteEstatus != 'I'", (id,))
        cliente = cursor.fetchone()
    
    if cliente:
        return jsonify(cliente), 200
    else:
        return jsonify({'message': 'Cliente no encontrado'}), 404

# Actualizar un Cliente
@app.route('/cliente/<int:id>', methods=['PUT'])
def update_cliente(id):
    data = request.json
    
    # Verificar que se haya enviado los datos requeridos
    if 'ClienteNombre' not in data or 'AlumnoId' not in data:
        return jsonify({'message': 'ClienteNombre y AlumnoId son requeridos'}), 400
    personal_id = session.get('personal_id')
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Cliente SET ClienteNombre=%s, ClientePrimerApellido=%s, ClienteSegundoApellido=%s, AlumnoId=%s, ClienteFechaModificacion=%s, ClienteEstatus=%s, ClientePersonalModifica=%s WHERE ClienteId=%s"        
        
        cursor.execute(sql, (data['ClienteNombre'], data.get('ClientePrimerApellido'), data.get('ClienteSegundoApellido'), data['AlumnoId'], fecha_modificacion, 'A', personal_id, id))
        conn.commit()

    return jsonify({'message': 'Cliente actualizado'}), 200

# Eliminar un Cliente (ocultar)
@app.route('/cliente/<int:id>', methods=['DELETE'])
def delete_cliente(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE Cliente SET ClienteFechaModificacion=%s, ClienteEstatus='I' WHERE ClienteId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'Cliente ocultado'}), 200

from flask import session, redirect, render_template

#-----------------------------------------Asistencia Detalle-----------------------------------------#

# Crear un nuevo AsistenciaDetalle
@app.route('/asistenciadetalle', methods=['POST'])
def create_asistencia_detalle():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(AsistenciaDetalleId) FROM AsistenciaDetalle")
        max_id = cursor.fetchone()['MAX(AsistenciaDetalleId)'] or 0
        new_id = max_id + 1
        fecha_modificacion = datetime.now()
        personal_id = session.get('personal_id')
        
        sql = "INSERT INTO AsistenciaDetalle (AsistenciaDetalleId, AsistenciaDetalleDescripcion, AsistenciaDetalleComentario, AsistenciaDetalleFechaModificacion, AsistenciaDetalleEstatus, AsistenciaDetallePersonalModifica) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (new_id, data['AsistenciaDetalleDescripcion'], data.get('AsistenciaDetalleComentario'), fecha_modificacion, 'A', personal_id))
        conn.commit()

        return jsonify({'message': 'AsistenciaDetalle creado', 'AsistenciaDetalleId': new_id}), 201

# Leer todos los AsistenciaDetalles
@app.route('/asistenciadetalle', methods=['GET'])
def get_asistenciadetalle():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaDetalle WHERE AsistenciaDetalleEstatus != 'I'")
        asistencia_detalle_list = cursor.fetchall()
    
    return jsonify(asistencia_detalle_list), 200

# Leer un AsistenciaDetalle por ID
@app.route('/asistenciadetalle/<int:id>', methods=['GET'])
def get_asistenciadetalle_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaDetalle WHERE AsistenciaDetalleId=%s AND AsistenciaDetalleEstatus != 'I'", (id,))
        asistencia_detalle = cursor.fetchone()
    
    if asistencia_detalle:
        return jsonify(asistencia_detalle), 200
    else:
        return jsonify({'message': 'AsistenciaDetalle no encontrado'}), 404

# Actualizar un AsistenciaDetalle
@app.route('/asistenciadetalle/<int:id>', methods=['PUT'])
def update_asistencia_detalle(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')

    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE AsistenciaDetalle SET AsistenciaDetalleDescripcion=%s, AsistenciaDetalleComentario=%s, AsistenciaDetalleFechaModificacion=%s, AsistenciaDetalleEstatus=%s, AsistenciaDetallePersonalModifica=%s WHERE AsistenciaDetalleId=%s"
        
        cursor.execute(sql, (data['AsistenciaDetalleDescripcion'], data.get('AsistenciaDetalleComentario'), fecha_modificacion, 'A', personal_id, id))
        conn.commit()

    return jsonify({'message': 'AsistenciaDetalle actualizado'}), 200

# Eliminar un AsistenciaDetalle (ocultar)
@app.route('/asistenciadetalle/<int:id>', methods=['DELETE'])
def delete_asistenciadetalle(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE AsistenciaDetalle SET AsistenciaDetalleFechaModificacion=%s, AsistenciaDetalleEstatus='I' WHERE AsistenciaDetalleId=%s"
        cursor.execute(sql, (fecha_modificacion, id))
        conn.commit()

    return jsonify({'message': 'AsistenciaDetalle ocultado'}), 200

#-----------------------------------------Asistencia Docente-----------------------------------------#

# Crear un nuevo AsistenciaDocente
@app.route('/asistenciadocente', methods=['POST'])
def create_asistenciadocente():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(AsistenciaDocenteId) FROM AsistenciaDocente")
        max_id = cursor.fetchone()['MAX(AsistenciaDocenteId)'] or 0
        new_id = max_id + 1
        fecha_modificacion = datetime.now()
        personal_id = session.get('personal_id')
        
        sql = """
            INSERT INTO AsistenciaDocente 
            (AsistenciaDocenteId, DocenteId, AsistenciaDocenteFechaHora, AsistenciaDetalleId, AsistenciaDocenteFechaModificacion, AsistenciaDocenteEstatus, AsistenciaDocentePersonalModifica) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(sql, (new_id, data['DocenteId'], data['AsistenciaDocenteFechaHora'], data['AsistenciaDetalleId'], fecha_modificacion.strftime('%Y-%m-%d %H:%M:%S'), 'A', personal_id))
        conn.commit()

        return jsonify({'message': 'AsistenciaDocente creado', 'AsistenciaDocenteId': new_id}), 201
    
# Leer todos los AsistenciasDocentes
@app.route('/asistenciadocente', methods=['GET'])
def get_asistenciadocentes():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaDocente WHERE AsistenciaDocenteEstatus != 'I'")
        asistencia_docentes_list = cursor.fetchall()
    
    return jsonify(asistencia_docentes_list), 200  

# Leer un AsistenciasDocentes por ID
@app.route('/asistenciadocente/<int:id>', methods=['GET'])
def get_asistenciadocentes_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaDocente WHERE AsistenciaDocenteId=%s AND AsistenciaDocenteEstatus != 'I'", (id,))
        asistencia_docente = cursor.fetchone()
    
    if asistencia_docente:
        return jsonify(asistencia_docente), 200
    else:
        return jsonify({'message': 'Asistente Docente no encontrado'}), 404

# Actualizar un AsistenciasDocentes
@app.route('/asistenciadocente/<int:id>', methods=['PUT'])
def update_asistenciadocentes(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')

    conn = db_connection()
    with conn.cursor() as cursor:
        sql = """
            UPDATE AsistenciaDocente 
            SET DocenteId=%s, AsistenciaDocenteFechaHora=%s, AsistenciaDocenteFechaModificacion=%s, AsistenciaDocentePersonalModifica=%s 
            WHERE AsistenciaDocenteId=%s
        """
        
        cursor.execute(sql, (data['DocenteId'], data['AsistenciaDocenteFechaHora'], fecha_modificacion, personal_id, id))
        conn.commit()

    return jsonify({'message': 'Asistente Docente actualizado'}), 200

# Eliminar un Docente (ocultar)
@app.route('/asistenciadocente/<int:id>', methods=['DELETE'])
def delete_asistenciadocentes(id):
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE AsistenciaDocente SET AsistenciaDocenteEstatus='I' WHERE AsistenciaDocenteId=%s"
        cursor.execute(sql, id)
        conn.commit()

    return jsonify({'message': 'Asignación ocultada'}), 200

#-----------------------------------------Asistencia Personal-----------------------------------------#

# Crear un nuevo AsistenciaPersonal
@app.route('/asistenciapersonal', methods=['POST'])
def create_asistenciapersonal():
    data = request.json
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT MAX(AsistenciaPersonalId) FROM AsistenciaPersonal")
        max_id = cursor.fetchone()['MAX(AsistenciaPersonalId)'] or 0
        new_id = max_id + 1
        fecha_modificacion = datetime.now()
        
        sql = """
            INSERT INTO AsistenciaPersonal 
            (AsistenciaPersonalId, PersonalId, AsistenciaPersonalFechaHora, AsistenciaDetalleId, AsistenciaPersonalFechaModificacion, AsistenciaPersonalEstatus, AsistenciaPersonalPersonalModifica) 
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """
        
        cursor.execute(sql,(new_id,data['PersonalId'],data['AsistenciaPersonalFechaHora'],data['AsistenciaDetalleId'],fecha_modificacion.strftime('%Y-%m-%d %H:%M:%S'),'A',session.get('personal_id')))
        conn.commit()

    return jsonify({'message': 'AsistenciaPersonal creado', 'AsistenciaPersonalId': new_id}), 201

# Leer todos los Personal de la asistencia 
@app.route('/asistenciapersonal', methods=['GET'])
def get_asistencias_personal():
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaPersonal WHERE AsistenciaPersonalEstatus != 'I'")
        asistencias_personal_list = cursor.fetchall()

    return jsonify(asistencias_personal_list), 200  

# Leer un Personal por ID 
@app.route('/asistenciapersonal/<int:id>', methods=['GET'])
def get_asistencias_personal_by_id(id):
    conn = db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM AsistenciaPersonal WHERE AsistenciaPersonalId=%s AND AsistenciaPersonalEstatus != 'I'", (id,))
        asistencia_personal = cursor.fetchone()

    if asistencia_personal:
        return jsonify(asistencia_personal), 200
    else:
        return jsonify({'message': 'Asistente Personal no encontrado'}), 404

# Actualizar un Personal 
@app.route('/asistenciapersonal/<int:id>', methods=['PUT'])
def update_asistencias_personal(id):
    data = request.json
    fecha_modificacion = datetime.now()
    personal_id = session.get('personal_id')
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE AsistenciaPersonal SET PersonalId=%s, AsistenciaPersonalFechaHora=%s, AsistenciaDetalleId=%s, AsistenciaPersonalFechaModificacion=%s, AsistenciaPersonalPersonalModifica=%s WHERE AsistenciaPersonalId=%s"
        
        cursor.execute(sql, (data['PersonalId'], data['AsistenciaPersonalFechaHora'], data['AsistenciaDetalleId'], fecha_modificacion.strftime('%Y-%m-%d %H:%M:%S'), personal_id, id))
        conn.commit()

    return jsonify({'message': 'Asistente Personal actualizado'}), 200

# Eliminar un Personal (ocultar)
@app.route('/asistenciapersonal/<int:id>', methods=['DELETE'])
def delete_asistencias_personal(id):
    fecha_modificacion = datetime.now()
    
    conn = db_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE AsistenciaPersonal SET AsistenciaPersonalEstatus='I', AsistenciaPersonalFechaModificacion=%s WHERE AsistenciaPersonalId=%s"
        cursor.execute(sql, (fecha_modificacion.strftime('%Y-%m-%d %H:%M:%S'), id))
        conn.commit()

    return jsonify({'message': 'Asistente Personal ocultado'}), 200

#-----------------------------------------Rutas-----------------------------------------#

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/principal')
def principal():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('principal.html')

# Rutas protegidas
@app.route('/personales')
def personal():
    if 'personal_id' not in session:
        return redirect('/') 
    return render_template('Personal.html')

@app.route('/alumno')
def alumnos():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('Alumnos.html')

@app.route('/docente')
def docentes():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('docentes.html')

@app.route('/personalrol')
def personalrol():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('PersonalRol.html')

@app.route('/menu')
def menu():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('Menu.html')

@app.route('/menurole')
def menurole():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('MenuRole.html')

@app.route('/cliente')
def cliente():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('Cliente.html')

@app.route('/asistenciadetalles')
def asistenciadetalles():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('AsistenciaDetalle.html')

@app.route('/asistenciapersonales')
def asistenciapersonal():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('AsistenciaPersonal.html')

@app.route('/asistenciadocentes')
def asistenciadocentes():
    if 'personal_id' not in session:
        return redirect('/')  
    return render_template('AsistenciaDocentes.html')

@app.route('/logout')
def logout():
    session.pop('personal_id', None)  
    return redirect('/')  

if __name__ == '__main__':
    app.run(debug=True)