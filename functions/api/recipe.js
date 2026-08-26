export async function onRequestPost(context) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });

  try {
    let body;

    try {
      body = await context.request.json();
    } catch {
      return json({ error: "Dados da pesquisa inválidos." }, 400);
    }

    const ingredients = String(body?.ingredients || "").trim();
    const people = String(body?.people || "2 pessoas");
    const time = String(body?.time || "Até 30 minutos");
    const meal = String(body?.meal || "Almoço");

    if (!ingredients) {
      return json({ error: "Informe os ingredientes." }, 400);
    }

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return json({
        error: "GEMINI_API_KEY não configurada no Cloudflare."
      }, 500);
    }

    const prompt = `
Crie uma receita brasileira simples e prática.

Ingredientes disponíveis: ${ingredients}
Porções: ${people}
Tempo disponível: ${time}
Refeição: ${meal}

Priorize os ingredientes informados.
A receita deve ser fácil para iniciantes.

Responda em português do Brasil com:

## Nome da receita
Tempo
Porções
Ingredientes com quantidades
Modo de preparo passo a passo
Dica do chef
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1200
          }
        })
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      return json({
        error: "A API Gemini retornou uma resposta inválida.",
        details: responseText || "Resposta vazia."
      }, 502);
    }

    if (!response.ok) {
      return json({
        error: "Erro na API Gemini.",
        details: data?.error?.message || "Erro desconhecido."
      }, response.status);
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part?.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return json({
        error: "A Gemini não retornou uma receita."
      }, 502);
    }

    return json({ text });

  } catch (error) {
    return json({
      error: "Não foi possível gerar a receita.",
      details: error?.message || "Erro desconhecido."
    }, 500);
  }
        }         
