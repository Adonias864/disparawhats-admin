const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

initializeApp();

function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Faça login para continuar.");
  }
  if (request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Acesso restrito a administradores.");
  }
}

exports.adminListUsers = onCall({ region: "us-central1", maxInstances: 5 }, async (request) => {
  requireAdmin(request);
  const pageToken = typeof request.data?.pageToken === "string" ? request.data.pageToken : undefined;
  const result = await getAuth().listUsers(100, pageToken);
  return {
    users: result.users.map(user => ({
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime
    })),
    nextPageToken: result.pageToken || null
  };
});

exports.adminCreateUser = onCall({ region: "us-central1", maxInstances: 5 }, async (request) => {
  requireAdmin(request);
  const email = typeof request.data?.email === "string" ? request.data.email.trim().toLowerCase() : "";
  const password = typeof request.data?.password === "string" ? request.data.password : "";
  const displayName = typeof request.data?.displayName === "string" ? request.data.displayName.trim().slice(0, 100) : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Informe um e-mail válido.");
  }
  if (password.length < 6 || password.length > 128) {
    throw new HttpsError("invalid-argument", "A senha deve ter entre 6 e 128 caracteres.");
  }

  try {
    const user = await getAuth().createUser({
      email,
      password,
      displayName: displayName || undefined,
      emailVerified: false,
      disabled: false
    });
    return { uid: user.uid, email: user.email };
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Já existe uma conta com esse e-mail.");
    }
    throw new HttpsError("internal", "Não foi possível criar a conta.");
  }
});

exports.adminDeleteUser = onCall({ region: "us-central1", maxInstances: 5 }, async (request) => {
  requireAdmin(request);
  const uid = typeof request.data?.uid === "string" ? request.data.uid.trim() : "";
  if (!uid) throw new HttpsError("invalid-argument", "Identificador de usuário inválido.");
  if (uid === request.auth.uid) {
    throw new HttpsError("failed-precondition", "Não é permitido excluir a própria conta administrativa.");
  }
  try {
    await getAuth().deleteUser(uid);
    return { success: true, uid };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      throw new HttpsError("not-found", "Usuário não encontrado.");
    }
    throw new HttpsError("internal", "Não foi possível excluir a conta.");
  }
});