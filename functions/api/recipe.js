export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const ingredients = String(body.ingredients || "").trim();
    const people = String(body.people || "2 pessoas");
    const time = String(body.time || "Até 30 minutos");
    const meal = String(body.meal || "Almoço");

    if (!ingredients) {
      return new Response(
        JSON.stringify({ error: "Informe os ingredientes." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY não configurada." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
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
      return new Response(
        JSON.stringify({
          error: "Erro na API Gemini.",
          details: data?.error?.message || "Erro desconhecido"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!text) {
      throw new Error("A Gemini não retornou uma receita.");
    }

    return new Response(
      JSON.stringify({ text }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Não foi possível gerar a receita.",
        details: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
