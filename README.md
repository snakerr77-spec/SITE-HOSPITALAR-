# Hospital Control - Sistema Hospitalar

Primeira versão visual em HTML, CSS e JavaScript puro, pronta para GitHub Pages.

## Login de teste

- Login: `admin1`
- Senha: `admin1`

## Arquivos

- `index.html`: estrutura principal do site
- `css/styles.css`: visual, animações, layout e responsividade
- `js/app.js`: funcionamento do sistema
- `assets/svg/medbot-mascot.svg`: mascote SVG
- `assets/svg/hospital-illustration.svg`: ilustração do painel

## O que já funciona

- Login administrativo local
- Dashboard com indicadores
- Cadastro de itens do almoxarifado
- Pedidos para almoxarifado
- Status de pedido: pendente, pronto para coleta e retirado
- Baixa automática no estoque ao registrar retirada
- Histórico por pessoa, dia e mês
- Exames em espera
- Prontuário médico por paciente
- Exportação de backup em JSON
- Campos com “Sua logo aqui” para substituir depois

## Observação importante

Esta versão usa `localStorage`, ou seja, salva os dados no navegador do computador atual.
Para uso real com várias pessoas, o próximo passo é ligar em um banco de dados como Cloudflare D1, Supabase ou Firebase.
