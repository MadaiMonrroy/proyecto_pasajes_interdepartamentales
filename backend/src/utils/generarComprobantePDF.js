const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-BO');
}

function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function generarComprobantePDF({ compra, viaje, pasajeros }) {
  const qrTexto = JSON.stringify({
    sistema: 'ViaGo',
    ruta: `${viaje.origen} - ${viaje.destino}`,
    fecha: formatearFecha(viaje.fecha_hora_salida),
    hora: formatearHora(viaje.fecha_hora_salida),
    asientos: pasajeros.map(p => p.numero_asiento),
    boletos: pasajeros.map(p => p.codigo_boleto),
    total: compra.total
  });

  const qrDataUrl = await QRCode.toDataURL(qrTexto, {
    margin: 1,
    width: 180
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 20
    });

    const buffers = [];

    doc.on('data', data => buffers.push(data));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const x = 45;
    const width = 280;

    function center(text, size = 10, bold = false) {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(size)
        .fillColor('black')
        .text(text, x, doc.y, { width, align: 'center' });
    }

    function line() {
      doc.moveDown(0.25);
      doc.font('Helvetica').fontSize(9)
        .text('------------------------------------------------------------------------------------------', x, doc.y, { width });
      doc.moveDown(0.25);
    }

    function row(label, value, size = 10) {
      doc.font('Helvetica-Bold').fontSize(size)
        .text(label, x, doc.y, { continued: true });

      doc.font('Helvetica').fontSize(size)
        .text(` ${value || '-'}`);
    }
/* AQUI */
function filaTotal(label, valor) {
  const y = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(label, x + 95, y);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(valor, x + 180, y, {
      width: 80,
      align: 'right'
    });

  doc.moveDown(0.2);
}
    const total = Number(compra.total).toFixed(2);
    const codigos = pasajeros.map(p => p.codigo_boleto).join(', ');
    const asientos = pasajeros.map(p => p.numero_asiento).join(', ');

    center('COMPROBANTE', 17);
    center('DE COMPRA DE PASAJE', 10, true);
    center('VIA GO - SISTEMA DE PASAJES', 10, true);

    doc.moveDown(0.4);

    center('Venta de pasajes interdepartamentales', 9);
    center('Bolivia', 9);

    line();

    center('CODIGO(S) BOLETO', 10, true);
    center(codigos, 9, true);

    line();

    row('Nombre/Razon Social:', pasajeros[0]?.nombre_pasajero || 'Cliente');
    row('NIT/CI/CE:', pasajeros[0]?.ci_pasajero || '-');
    row('Fecha:', `${formatearFecha(new Date())} ${formatearHora(new Date())}`);
    row('Metodo de pago:', compra.metodo_pago);

    line();

    center('DETALLE', 10);

    pasajeros.forEach((p, index) => {
      doc.font('Helvetica').fontSize(9)
        .text(`${index + 1}. Venta de pasaje`, x, doc.y, { width });
    });

    doc.moveDown(0.5);

    filaTotal('SUBTOTAL', total);
filaTotal('DESCUENTO', '0.00');
filaTotal('TOTAL', total);
filaTotal('MONTO A PAGAR', total);

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(9)
      .text(`Son: ${total} BOLIVIANOS`, x);

    line();

    row('Origen:', viaje.origen, 11);
    row('Destino:', viaje.destino, 11);
    row('Fecha de Viaje:', formatearFecha(viaje.fecha_hora_salida), 11);
    row('Hora de Viaje:', formatearHora(viaje.fecha_hora_salida), 11);
    row('Numero de bus:', viaje.placa || '-', 11);
    row('Tipo de bus:', viaje.tipo_bus || '-', 11);
    row('Asiento(s):', asientos, 11);

    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(10)
      .text('PASAJEROS', x, doc.y, { width, align: 'center' });

    pasajeros.forEach((p) => {
      doc.font('Helvetica').fontSize(8)
        .text(`${p.numero_asiento}. ${p.nombre_pasajero}`, x, doc.y, { width });
    });

    doc.moveDown(0.7);

    row('Usuario vendedor:', compra.vendedor || 'Compra a través del sistema', 10);

    line();

    center('ESTE COMPROBANTE RESPALDA', 9, true);
    center('LA COMPRA REALIZADA EN EL SISTEMA', 9, true);
    center('Verifique fecha, hora, ruta y asiento.', 8);

    doc.moveDown(0.6);

    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrBase64, 'base64');

    doc.image(qrBuffer, x + 75, doc.y, {
      width: 130,
      height: 130
    });

    doc.moveDown(17);

    center('El lujo de viajar sin complicaciones', 9, true);
    center('ViaGo - Sistema de Pasajes', 8);

    doc.end();
  });
}

module.exports = generarComprobantePDF;