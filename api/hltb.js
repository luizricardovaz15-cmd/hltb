
const { HowLongToBeatService } = require("howlongtobeat");

const hltb = new HowLongToBeatService();

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300");

  const game = String(req.query.game || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);

  if (req.method !== "GET") {
    return res.status(405).send("Use GET.");
  }

  if (!game) {
    return res.status(200).send("Use !hltb nome do jogo.");
  }

  try {
    const results = await hltb.search(game);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(200).send(
        `Nao encontrei "${game}" no HowLongToBeat.`
      );
    }

    const usable = results
      .filter(
        x => x && x.name &&
        Number(x.gameplayMain) > 0 &&
        Number.isFinite(Number(x.gameplayMain))
      )
      .sort(
        (a, b) =>
          Number(b.similarity || 0) -
          Number(a.similarity || 0)
      );

    if (!usable.length) {
      return res.status(200).send(
        `Nao encontrei o tempo principal de "${game}".`
      );
    }

    const best = usable[0];
    const hours = Number(best.gameplayMain);
    const time = Number.isInteger(hours)
      ? String(hours)
      : hours.toLocaleString("pt-BR", {
          maximumFractionDigits: 1
        });

    return res.status(200).send(
      `${best.name} — historia principal: ${time}h (HowLongToBeat)`
    );
  } catch (error) {
    console.error(error);
    return res.status(200).send(
      "Erro ao consultar o HowLongToBeat. Tente novamente."
    );
  }
};
