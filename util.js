const getFullDateTimeString = date => {
  let diaSemana = date.getDay();
  let hora = date
    .getHours()
    .toString()
    .padStart(2, "0");
  let minuto = date
    .getMinutes()
    .toString()
    .padStart(2, "0");

  let ano = date.getFullYear();
  let mes = (date.getMonth() + 1).toString().padStart(2, "0");
  let dia = date
    .getDate()
    .toString()
    .padStart(2, "0");

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
};

module.exports = {
  getFullDateTimeString
};
