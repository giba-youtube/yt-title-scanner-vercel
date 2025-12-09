// api/yt-search.js
// Função Serverless da Vercel para buscar vídeos no YouTube por título

export default async function handler(req, res) {
  try {
    const apiKey = process.env.YT_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "YT_API_KEY não está definida nas variáveis de ambiente da Vercel."
      });
    }

    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        error: "Parâmetro 'q' é obrigatório. Ex: /api/yt-search?q=Titulo"
      });
    }

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "10");
    searchUrl.searchParams.set("q", q);

    const ytRes = await fetch(searchUrl.toString());
    const data = await ytRes.json();

    if (!ytRes.ok) {
      console.error("Erro da YouTube API:", data);
      return res.status(ytRes.status).json({
        error: "Erro ao consultar a YouTube Data API",
        details: data
      });
    }

    const results = (data.items || []).map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      channel: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnail: item.snippet?.thumbnails?.high?.url
    }));

    return res.status(200).json({
      query: q,
      totalResults: results.length,
      results
    });
  } catch (err) {
    console.error("Erro interno no /api/yt-search:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
