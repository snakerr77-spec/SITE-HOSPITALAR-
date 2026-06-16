
(function () {
  const STORE = {
    triageQueue: 'hospital.triageQueue.v1',
    doctorQueue: 'hospital.doctorQueue.v1',
    receptionQueue: 'hospital.receptionQueue.v1',
    currentDoctorPatient: 'hospital.currentDoctorPatient.v1'
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (_) { return []; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value || []));
  }

  function id() {
    return 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function pushUnique(key, item) {
    const list = read(key);
    if (!item.id) item.id = id();
    if (!list.some((x) => x.id === item.id)) list.push(item);
    write(key, list);
    return item;
  }

  function popFirst(key) {
    const list = read(key);
    const item = list.shift() || null;
    write(key, list);
    return item;
  }

  function removeById(key, idValue) {
    if (!idValue) return;
    write(key, read(key).filter((item) => item.id !== idValue));
  }

  function initials(name) {
    return String(name || 'Paciente')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] || '')
      .join('')
      .toUpperCase() || 'PX';
  }

  function todayTime() {
    return new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  window.HospitalFlow = { STORE, read, write, pushUnique, popFirst, removeById, initials, todayTime };
})();
