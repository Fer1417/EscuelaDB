$(document).ready(function () {
    loadAsistencias();
    loadDocentes();
    loadAsistenciaDetalles();

    function loadAsistencias() {
        $.get('/asistenciadocente', function (data) {
            $('#asistenciaTableBody').empty();
            data.forEach(function (asistencia) {
                $('#asistenciaTableBody').append(`
                    <tr>
                        <td>${asistencia.AsistenciaDocenteId}</td>
                        <td>${asistencia.DocenteId}</td> 
                        <td>${new Date(asistencia.AsistenciaDocenteFechaHora).toLocaleString()}</td>
                        <td>${asistencia.AsistenciaDetalleId}</td> 
                        <td>${asistencia.AsistenciaDocenteFechaModificacion}</td>
                        <td>${asistencia.AsistenciaDocenteEstatus}</td>
                        <td>${asistencia.AsistenciaDocentePersonalModifica}</td> 
                        <td>
                            <button class='btn btn-warning' onclick='editAsistencia(${asistencia.AsistenciaDocenteId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteAsistencia(${asistencia.AsistenciaDocenteId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#asistenciaTable').removeClass('d-none');
        }).fail(function (xhr) {
            console.error('Error al cargar las asistencias:', xhr.responseText);
        });
    }

    function loadDocentes() {
        $.get('/docentes', function (data) { 
            const docenteSelect = $('#DocenteId');
            docenteSelect.empty(); 
            data.forEach(function (docente) {
                docenteSelect.append(`<option value="${docente.DocenteId}">${docente.DocenteId} ${docente.DocenteNombre}</option>`); // Ajusta los campos según tu API
            });
        }).fail(function (xhr) {
            console.error('Error al cargar los docentes:', xhr.responseText);
        });
    }

    function loadAsistenciaDetalles() {
        $.get('/asistenciadetalle', function (data) {
            const detalleSelect = $('#AsistenciaDetalleId');
            detalleSelect.empty(); // Limpiar opciones existentes
            data.forEach(function (detalle) {
                detalleSelect.append(`<option value="${detalle.AsistenciaDetalleId}">${detalle.AsistenciaDetalleDescripcion}</option>`); // Ajusta los campos según tu API
            });
        }).fail(function (xhr) {
            console.error('Error al cargar los detalles de asistencia:', xhr.responseText);
        });
    }

    $('#btnAddAsistencia').on('click', function () {
        resetForm();
        $('#formContainer').removeClass('d-none');
    });

    $('#AsistenciaForm').on('submit', function (e) {
        e.preventDefault();

        const asistenciaId = $('#AsistenciaId').val();
        const asistenciaData = {
            DocenteId: $('#DocenteId').val(),
            AsistenciaDocenteFechaHora: $('#AsistenciaFechaHora').val(),
            AsistenciaDetalleId: $('#AsistenciaDetalleId').val()
        };

        if (asistenciaId) { // Actualización
            $.ajax({
                url: `/asistenciadocente/${asistenciaId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(asistenciaData),
                success: function () {
                    loadAsistencias();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar la asistencia.');
                }
            });
        } else { // Creación
            $.ajax({
                url: '/asistenciadocente',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(asistenciaData),
                success: function () {
                    loadAsistencias();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear la asistencia.');
                }
            });
        }
    });

    window.editAsistencia = function (id) {
        $.get(`/asistenciadocente/${id}`, function (data) {
            $('#AsistenciaId').val(data.AsistenciaDocenteId);
            $('#DocenteId').val(data.DocenteId);
            $('#AsistenciaFechaHora').val(new Date(data.AsistenciaDocenteFechaHora).toISOString().slice(0, 16));
            $('#AsistenciaDetalleId').val(data.AsistenciaDetalleId);
            $('#formContainer').removeClass('d-none');
        }).fail(function () {
            alert('Error al cargar los datos de la asistencia.');
        });
    };

    window.deleteAsistencia = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta asistencia?')) {
            $.ajax({
                url: `/asistenciadocente/${id}`,
                type: 'DELETE',
                success: function () {
                    loadAsistencias();
                },
                error: function (xhr) {
                    alert('Error al eliminar la asistencia.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#AsistenciaId').val('');
        $('#DocenteId').val('');
        $('#AsistenteFechaHora').val('');
        $('#AsistenteDetalleId').val('');
        $('#formContainer').addClass('d-none');
    }

    $('#btnCancel').on('click', resetForm);
});