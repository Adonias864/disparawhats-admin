// Execute localmente, nunca no navegador e nunca publique a chave da conta de serviço.
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/set-admin.js administrador@exemplo.com");
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: "disparawhats-e86a4"
});

(async () => {
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true
  });
  console.log("Permissão de administrador concedida a:", user.email);
  console.log("Saia e entre novamente no painel para atualizar o token.");
  process.exit(0);
})().catch(error => {
  console.error("Falha ao autorizar administrador:", error.message);
  process.exit(1);
});