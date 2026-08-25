export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const ingredientes = body.ingredientes || "";
    const pessoas = body.pessoas || "2";
    const tempo = body.tempo || "30 minutos";
    const refeicao = body.refeicao || "Almoço";

    const prompt = `
Crie uma receita simples e prática em português do Brasil.

Ingredientes disponíveis: ${ingredientes}
Quantidade de pessoas: ${pessoas}
Tempo disponível: ${tempo}
Refeição: ${refeicao}

Responda exatamente neste formato JSON:
{
  "nome": "Nome da receita",
  "ingredientes": ["ingrediente 1", "ingrediente 2"],
  "modo_preparo": ["passo 1", "passo 2", "passo 3"],
  "tempo": "${tempo}"
}

Não coloque markdown.
Não coloque texto antes ou depois do JSON.
`;

    const apiKey = context.env.GEMINI_API_KEY;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const limpo = texto
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const receita = JSON.parse(limpo);

    return new Response(JSON.stringify(receita), {
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        erro: "Não foi possível gerar a receita.",
        detalhes: error.message
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
