const form = document.getElementById('loginForm');
const usuario = document.getElementById('loginUsuario');
const senha = document.getElementById('loginSenha');
const erro = document.getElementById('loginErro');
const btnMostrarSenha = document.getElementById('btnMostrarSenha');

btnMostrarSenha?.addEventListener('click', () => {
  const isPassword = senha.type === 'password';
  senha.type = isPassword ? 'text' : 'password';
  btnMostrarSenha.textContent = isPassword ? 'Ocultar senha' : 'Mostrar senha';
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const loginOk = usuario.value.trim().toLowerCase() === 'admin1';
  const senhaOk = senha.value.trim() === 'admin1';

  if (!loginOk || !senhaOk) {
    erro.textContent = 'Login ou senha incorretos.';
    return;
  }

  localStorage.setItem('hospital_usuario_logado', JSON.stringify({ nome: 'Administrador', login: 'admin1' }));
  window.location.href = 'home-page.html';
});
