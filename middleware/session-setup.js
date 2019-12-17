/**
 * @SessionsAndCookies
 * Definido configuracao das sessoes e cookies.
 */

module.exports = dataBase => ({
  secret: [
    '787hhasn12ks2k1bnbs1qpoiewa10xssd000212Wssadl9112',
    'lord_vader_will_smash_the_rebels',
  ],
  resave: false, // Nao renova id de sessao.
  saveUninitialized: false, // Nao salva se a sessao nao for iniciada.
  cookie: {
    path: '/',
    secure: false, // 'true' para conexao HTTPS.
    maxAge: null, // encerra sessao ao fechar o browser.
    httpOnly: true, // Cookie nao pode ser lido por JS client side.
    sameSite: true, // envio restrito somente a origem.
  },
  store: dataBase, // objeto de conexao com o banco.
})
