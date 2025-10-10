const obtenerFechaHoraActual = () => {
   const ahora = new Date();
   // Colombia está en UTC-5
   const horaColombia = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
   const fechaHora = horaColombia
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);
   return fechaHora;
};

module.exports = {
   obtenerFechaHoraActual,
};
