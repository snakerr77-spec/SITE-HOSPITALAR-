# Sistema Hospitalar - Primeira versão

Sistema simples em HTML, CSS e JavaScript puro para subir no GitHub Pages.

## Login de teste

- Login: `admin1`
- Senha: `admin1`

## O que já tem

- Login administrativo local
- Cadastro de itens do almoxarifado
- Pedidos para almoxarifado
- Status: pendente, pronto para coleta e retirado
- Histórico por pessoa, dia e mês
- Controle simples de estoque
- Prontuário médico por paciente
- Exames em espera
- Espaços com “Sua logo aqui”

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos `index.html`, `styles.css` e `app.js` para a raiz do repositório.
3. Vá em Settings > Pages.
4. Em Source, escolha `Deploy from a branch`.
5. Escolha a branch `main` e a pasta `/root`.
6. Salve.

## Observação importante

Esta primeira versão salva os dados no navegador usando `localStorage`. Funciona para apresentação e protótipo, mas ainda não é banco de dados real. Para uso real no hospital, o próximo passo recomendado é criar backend com Cloudflare D1, Supabase ou Firebase para salvar tudo com segurança e acesso multiusuário.
