# Receita em 1 Minuto — versão com IA

## O que mudou
Agora o site envia os dados para `/api/recipe`. A função no servidor chama a API Gemini.
A chave NÃO fica no HTML público.

## Como colocar no Cloudflare Pages
1. Crie um projeto no Cloudflare Pages/Workers.
2. Faça upload deste projeto ou conecte um repositório Git.
3. O arquivo `index.html` deve ficar na raiz e a pasta `functions/api/recipe.js` deve ser preservada.
4. Em Settings > Environment variables, crie:
   GEMINI_API_KEY = sua_chave
5. Faça um novo deploy.

O Cloudflare Pages suporta site HTML estático e Pages Functions para código no servidor.

## Como obter a chave
Crie uma chave no Google AI Studio.
NUNCA cole a chave no `index.html` nem envie a chave para clientes.

## Observação
Este MVP usa `gemini-2.5-flash` por ser um modelo estável documentado pela Google.
A API e os limites de uso podem mudar; confira a documentação oficial.

## Próximas melhorias
- login
- limite de receitas grátis
- checkout
- plano premium
- lista de compras
- cardápio semanal
- painel de administração
