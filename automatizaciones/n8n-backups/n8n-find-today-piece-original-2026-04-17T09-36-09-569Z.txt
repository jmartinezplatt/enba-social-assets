const calendar = $input.first().json;
const now = new Date();
const argDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const argDD = String(argDate.getUTCDate()).padStart(2, '0');
const argMM = String(argDate.getUTCMonth() + 1).padStart(2, '0');
const argYYYY = argDate.getUTCFullYear();
const todayStr = `${argDD}/${argMM}/${argYYYY}`;

const todayEntries = calendar.calendario.filter(e => e.fecha === todayStr && e.tipo === 'pieza');

if (todayEntries.length === 0) {
  return [{ json: { skip: true, message: `No hay piezas para hoy (${todayStr})`, date: todayStr } }];
}

const entry = todayEntries[0];
return [{ json: { skip: false, date: todayStr, ...entry } }];
