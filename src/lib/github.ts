import { either, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

const GithubUser = t.type({
  followers: t.number,
  public_repos: t.number,
});

export type GithubUser = t.TypeOf<typeof GithubUser>;

const GithubRepo = t.type({
  stargazers_count: t.number,
  fork: t.boolean,
});

export type GithubRepo = t.TypeOf<typeof GithubRepo>;

export async function getGithubUser(username: string) {
  const user = await fetch(`https://api.github.com/users/${username}`)
    .then((res) => res.json())
    .then((json) => GithubUser.decode(json));

  return pipe(
    user,
    either.map((user) => user),
    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => ({ followers: 0, public_repos: 0 }))
  );
}

export async function getTotalStars(username: string) {
  const repos = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=1000`
  )
    .then((res) => res.json())
    .then((json) => t.array(GithubRepo).decode(json));

  return pipe(
    repos,
    either.map((repos) =>
      repos
        .filter((repo) => !repo.fork)
        .reduce((acc, repo) => acc + repo.stargazers_count, 0)
    ),
    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => 0)
  );
}
