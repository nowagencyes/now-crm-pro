const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const statusBox = document.getElementById("status");

function showStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.className = "status " + type;
}

function getCredentials() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    showStatus("Completa email y contraseña.", "error");
    return null;
  }
  if (password.length < 6) {
    showStatus("La contraseña debe tener mínimo 6 caracteres.", "error");
    return null;
  }
  return { email, password };
}

async function register() {
  const credentials = getCredentials();
  if (!credentials) return;
  showStatus("Creando usuario...", "info");
  const { error } = await sb.auth.signUp({
    email: credentials.email,
    password: credentials.password
  });
  if (error) return showStatus(error.message, "error");
  showStatus("Usuario creado correctamente. Ahora pulsa Entrar.", "success");
}

async function login() {
  const credentials = getCredentials();
  if (!credentials) return;
  showStatus("Entrando...", "info");
  const { error } = await sb.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });
  if (error) return showStatus(error.message, "error");
  showStatus("Login correcto. Entrando al dashboard...", "success");
  setTimeout(() => window.location.href = "dashboard.html", 700);
}
