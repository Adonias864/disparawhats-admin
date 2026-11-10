# DisparaWhats Admin

Painel web para administrar contas do Firebase Authentication do projeto `disparawhats-e86a4`.

## Recursos
- Login administrativo com e-mail e senha.
- Listagem paginada e pesquisa de contas.
- Criação de contas sem encerrar a sessão do administrador.
- Exclusão de contas do Firebase Authentication.
- Operações privilegiadas executadas no backend com Firebase Admin SDK.

## Segurança
As funções exigem o custom claim `admin: true`. Não existe cadastro público de administradores. A configuração Firebase do navegador não é uma credencial administrativa; nunca coloque uma chave privada de service account no frontend ou neste repositório.

## Pré-requisitos
1. Node.js 20.
2. Firebase CLI: `npm install -g firebase-tools`.
3. Projeto `disparawhats-e86a4` com Authentication e provedor E-mail/senha ativados.
4. Plano Blaze no Firebase para implantar Cloud Functions (pode haver cobrança conforme uso).

## Implantar
Na raiz do projeto:

```bash
firebase login
firebase use disparawhats-e86a4
cd functions
npm install
cd ..
firebase deploy --only functions,hosting
```

## Autorizar o primeiro administrador
1. No Firebase Console > Authentication, crie manualmente a conta administrativa com e-mail e senha.
2. No Google Cloud Console do projeto, crie/baixe uma chave de conta de serviço com permissão adequada para administrar Firebase Authentication. Guarde o JSON somente no computador local; nunca faça commit dele.
3. Configure a variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` apontando para o caminho local do JSON.
4. Na raiz do projeto, instale localmente o SDK administrativo: `npm install firebase-admin`.
5. Execute:

```bash
node scripts/set-admin.js seu-email-administrador@exemplo.com
```

6. Saia e entre novamente no painel para receber o token atualizado com a permissão de administrador.

Depois disso, acesse o endereço do Firebase Hosting exibido ao final do deploy.

## Observações
- A exclusão remove a conta do Firebase Authentication. Ela não apaga automaticamente documentos do Firestore ou arquivos do Storage.
- A senha inicial é definida pelo administrador no momento da criação. Entregue-a ao usuário por um canal seguro e recomende que ele a altere.
- Não compartilhe a chave privada da conta de serviço em chats, sites ou repositórios.