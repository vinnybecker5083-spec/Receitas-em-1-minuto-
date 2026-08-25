export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/recipe") {
      if (request.method !== "POST") {
        return json({ error: "Use POST." }, 405);
      }

      try {
        const body = await request.json();

        const ingredients = String(body.ingredients || "").trim();
        const people = String(body.people || "2 pessoas");
        const time = String(body.time || "Até 30 minutos");
        const meal = String(body.meal || "Almoço");

        if (!ingredients) {
          return json({ error: "Informe os ingredientes." }, 400);
        }

        if (!env.GEMINI_API_KEY) {
          return json({ error: "GEMINI_API_KEY não configurada." }, 500);
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
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                maxOutputTokens: 1200
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return json({
            error: "Erro na API Gemini.",
            details: data?.error?.message || "Erro desconhecido"
          }, response.status);
        }

        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("") || "";

        if (!text) {
          return json({ error: "A Gemini não retornou uma receita." }, 502);
        }

        return json({ text });

      } catch (error) {
        return json({
          error: "Erro no servidor.",
          details: error.message
        }, 500);
      }
    }

    return new Response("Receita em 1 Minuto", {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
