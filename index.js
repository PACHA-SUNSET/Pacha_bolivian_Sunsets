var camaraStream = null;
var entregas = JSON.parse(localStorage.getItem('entregas')) || [];

// Función para abrir o cerrar el dropdown
function toggleDropdown() {
    var dropdown = document.querySelector('.dropdown');
    dropdown.classList.toggle('active'); // Toggle class para activar/desactivar el menú
}

// Evento para cerrar el dropdown si se hace clic fuera de él
document.addEventListener('click', function(event) {
    var dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

function tomarFoto() {
    var nombreMesa = document.getElementById('nombreMesa').value.trim();

    if (nombreMesa === '') {
        alert('Por favor, ingrese un nombre para la mesa.');
        return;
    }

    var opcionesCamara = {
        video: {
            facingMode: 'environment'
        }
    };

    detenerCamara();

    navigator.mediaDevices.getUserMedia(opcionesCamara)
        .then(function (stream) {
            camaraStream = stream;
            var video = document.getElementById('camara');
            video.style.display = 'block';
            video.srcObject = camaraStream;

            var confirmarBtn = document.getElementById('confirmarFoto');
            confirmarBtn.style.display = 'inline-block';
        })
        .catch(function (error) {
            console.error('Error al acceder a la cámara: ', error);
        });
}

function confirmarFoto() {
    var video = document.getElementById('camara');
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detener la cámara después de tomar la foto
    detenerCamara();

    // Obtener la imagen en formato base64
    var fotoUrl = canvas.toDataURL('image/png');

    // Mostrar la foto tomada en un elemento img
    var fotoElemento = document.getElementById('foto');
    fotoElemento.style.display = 'block';
    fotoElemento.src = fotoUrl;

    // Guardar la entrega en el arreglo y en localStorage
    var entrega = {
        nombreMesa: document.getElementById('nombreMesa').value.trim(),
        fotoUrl: fotoUrl,
        fechaHora: new Date().toLocaleString()
    };

    entregas.push(entrega);
    localStorage.setItem('entregas', JSON.stringify(entregas));

    // Limpiar después de un breve tiempo
    setTimeout(function () {
        fotoElemento.style.display = 'none';
        var confirmarBtn = document.getElementById('confirmarFoto');
        confirmarBtn.style.display = 'none';

        document.getElementById('nombreMesa').value = '';

        var tomarFotoBtn = document.querySelector('.formulario button');
        tomarFotoBtn.disabled = false;

        // Limpiar la cámara y permitir tomar otra foto
        limpiarCamara();
    }, 1000);
}

function detenerCamara() {
    if (camaraStream) {
        camaraStream.getTracks().forEach(function (track) {
            track.stop();
        });
        camaraStream = null;
    }
    var video = document.getElementById('camara');
    video.style.display = 'none';
}

function limpiarCamara() {
    // Limpiar la cámara
    detenerCamara();

    // Reiniciar el elemento de video
    var video = document.getElementById('camara');
    video.srcObject = null;
}

function verRegistrosEnNuevaVentana() {
    var ventanaNueva = window.open('', 'Registros de Mesas Entregadas', 'width=600,height=400,scrollbars=yes,resizable=yes');
    var registrosHtml = '<html><head>';
    registrosHtml += '<title>Registros de Mesas Entregadas</title>';
    registrosHtml += '<style>';
    registrosHtml += 'body { font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px; }';
    registrosHtml += '.registro { border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-bottom: 10px; text-align: left; }';
    registrosHtml += '.registro img { max-width: 100%; height: auto; display: block; margin-top: 10px; }';
    registrosHtml += '</style>';
    registrosHtml += '</head><body>';
    registrosHtml += '<h2>Registros de Mesas Entregadas</h2>';

    entregas.forEach(function (entrega, index) {
        registrosHtml += '<div class="registro">';
        registrosHtml += '<p><strong>Nombre de la Mesa:</strong> ' + entrega.nombreMesa + '</p>';
        registrosHtml += '<p><strong>Fecha y Hora:</strong> ' + entrega.fechaHora + '</p>';
        registrosHtml += '<img src="' + entrega.fotoUrl + '" alt="Foto de la Mesa">';
        registrosHtml += '</div>';
    });

    registrosHtml += '</body></html>';

    ventanaNueva.document.open();
    ventanaNueva.document.write(registrosHtml);
    ventanaNueva.document.close();
}

function borrarRegistros() {
    if (confirm('¿Estás seguro de borrar todos los registros?')) {
        entregas = [];
        localStorage.setItem('entregas', JSON.stringify(entregas));

        // Forzar la actualización de la página principal
        window.location.href = 'index.html'; // Ajusta la URL según la ubicación de tu página principal
    }
}
