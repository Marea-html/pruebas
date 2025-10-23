document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const responseEl = document.getElementById("response");

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    responseEl.textContent = text;
    responseEl.style.color = res.ok ? "green" : "red";
  } catch (err) {
    responseEl.textContent = "Error al conectar con el servidor.";
    responseEl.style.color = "red";
  }
});
