$(document).ready(function () {
    loadClientes(); 
    loadAlumnos(); 

    function loadClientes() {
        $.get('/clientes', function (data) {
            $('#clienteTableBody').empty(); 
            data.forEach(function (cliente) {
                $('#clienteTableBody').append(`
                    <tr>
                        <td>${cliente.ClienteId}</td>
                        <td>${cliente.ClienteNombre}</td>
                        <td>${cliente.ClientePrimerApellido}</td>
                        <td>${cliente.ClienteSegundoApellido}</td>
                        <td>${cliente.AlumnoId}</td>
                        <td>${cliente.ClienteFechaModificacion}</td>
                        <td>${cliente.ClienteEstatus}</td>
                        <td>${cliente.ClientePersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editCliente(${cliente.ClienteId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteCliente(${cliente.ClienteId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#clienteTable').removeClass('d-none'); 
        }).fail(function (xhr) {
            console.error('Error al cargar los clientes:', xhr.responseText);
        });
    }

    function loadAlumnos() {
        $.get('/alumnos', function (data) {
            const alumnoSelect = $('#AlumnoId');
            alumnoSelect.empty(); // Limpiar opciones existentes
            data.forEach(function (alumno) {
                alumnoSelect.append(`<option value="${alumno.AlumnoId}">${alumno.AlumnoId} - ${alumno.AlumnoNombre}</option>`);
            });
        }).fail(function (xhr) {
            console.error('Error al cargar los alumnos:', xhr.responseText);
        });
    }

    $('#btnAddCliente').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#ClienteForm').on('submit', function (e) {
        e.preventDefault(); 
        
        const clienteId = $('#ClienteId').val();
        const clienteData = {
            ClienteNombre: $('#ClienteNombre').val(),
            ClientePrimerApellido: $('#ClientePrimerApellido').val(),
            ClienteSegundoApellido: $('#ClienteSegundoApellido').val(),
            AlumnoId: $('#AlumnoId').val()
        };
    
        if (clienteId) { // Si existe un ID, es una actualización
            $.ajax({
                url: `/cliente/${clienteId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(clienteData),
                success: function () {
                    loadClientes();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el cliente.');
                }
            });
        } else { // Si no existe un ID, es una creación
            $.ajax({
                url: '/cliente',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(clienteData),
                success: function () {
                    loadClientes();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear el cliente.');
                }
            });
        }
    });

    window.editCliente = function (id) {
        $.get(`/cliente/${id}`, function (data) {
            $('#ClienteId').val(data.ClienteId);
            $('#ClienteNombre').val(data.ClienteNombre);
            $('#ClientePrimerApellido').val(data.ClientePrimerApellido);
            $('#ClienteSegundoApellido').val(data.ClienteSegundoApellido);
            $('#AlumnoId').val(data.AlumnoId); 
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del cliente.');
        });
    };

    window.deleteCliente = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            $.ajax({
                url: `/cliente/${id}`,
                type: 'DELETE',
                success: function () {
                    loadClientes(); 
                },
                error: function (xhr) {
                    alert('Error al eliminar el cliente.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#ClienteId').val('');
        $('#ClienteNombre').val('');
        $('#ClientePrimerApellido').val('');
        $('#ClienteSegundoApellido').val('');
        $('#AlumnoId').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});