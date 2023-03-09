import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

const DevArticle = t.type({
  page_views_count: t.number,
});

type DevArticle = t.TypeOf<typeof DevArticle>;

async function getArticles(
  page = 1,
  articles = [] as DevArticle[]
): Promise<DevArticle[]> {
  const articlesData = await fetch(
    `https://dev.to/api/articles/me?page=${page}`,
    {
      headers: {
        "api-key": import.meta.env.DEV_API_KEY,
      },
    }
  ).then((res) => res.json());

  const updatedArticles = [...articles, ...articlesData];

  return articlesData.length < 30
    ? updatedArticles
    : getArticles(page + 1, updatedArticles);
}

export async function getTotalBlogViews() {
  const articles = await getArticles().then((json) =>
    t.array(DevArticle).decode(json)
  );

  return pipe(
    articles,
    either.map((articles) =>
      articles.reduce((acc, article) => acc + article.page_views_count, 0)
    ),
    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => 0)
  );
}
