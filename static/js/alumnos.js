$(document).ready(function () {
    loadAlumnos();

    function loadAlumnos() {
        $.get('/alumnos', function (data) {
            $('#alumnosTableBody').empty();
            data.forEach(function (alumno) {
                $('#alumnosTableBody').append(`
                    <tr>
                        <td>${alumno.AlumnoId}</td>
                        <td>${alumno.AlumnoNombre}</td>
                        <td>${alumno.AlumnoPrimerApellido}</td>
                        <td>${alumno.AlumnoSegundoApellido}</td>
                        <td>${alumno.AlumnoFechaModificacion}</td>
                        <td>${alumno.AlumnoEstatus}</td>
                        <td>${alumno.AlumnoPersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editAlumno(${alumno.AlumnoId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteAlumno(${alumno.AlumnoId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#alumnosTable').removeClass('d-none');
        });
    }

    $('#btnAddAlumno').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#alumnoForm').on('submit', function (e) {
        e.preventDefault(); 
        
        const alumnoId = $('#alumnoId').val();
        const alumnoData = {
            AlumnoNombre: $('#AlumnoNombre').val(),
            AlumnoPrimerApellido: $('#AlumnoPrimerApellido').val(),
            AlumnoSegundoApellido: $('#AlumnoSegundoApellido').val(),
            AlumnoPersonalModifica: "2" 
        };

        if (alumnoId) {
            $.ajax({
                url: `/alumno/${alumnoId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(alumnoData),
                success: function () {
                    loadAlumnos();
                    resetForm();
                },
                error: function (xhr, status, error) {
                    console.error('Error al actualizar el alumno:', xhr.responseText);
                    alert('Error al actualizar el alumno. Ver consola para más detalles.');
                }
            });
        } else {
            $.ajax({
                url: '/alumno',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(alumnoData),
                success: function () {
                    loadAlumnos();
                    resetForm();
                },
                error: function (xhr) {
                    console.error('Error al crear el alumno:', xhr.responseText);
                    alert('Error al crear el alumno. Ver consola para más detalles.');
                }
            });
        }
    });

    window.editAlumno = function (id) {
        $.get(`/alumno/${id}`, function (data) {
            $('#alumnoId').val(data.AlumnoId);
            $('#AlumnoNombre').val(data.AlumnoNombre);
            $('#AlumnoPrimerApellido').val(data.AlumnoPrimerApellido);
            $('#AlumnoSegundoApellido').val(data.AlumnoSegundoApellido);
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del alumno.');
        });
    };

    window.deleteAlumno = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
            $.ajax({
                url: `/alumno/${id}`,
                type: 'DELETE',
                success: function () {
                    loadAlumnos();
                }
            });
        }
    };

    function resetForm() {
        $('#alumnoId').val('');
        $('#AlumnoNombre').val('');
        $('#AlumnoPrimerApellido').val('');
        $('#AlumnoSegundoApellido').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});