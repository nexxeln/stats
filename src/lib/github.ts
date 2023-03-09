import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

const GithubUser = t.type({
  followers: t.number,
  public_repos: t.number,
});

const GithubRepo = t.type({
  stargazers_count: t.number,
  fork: t.boolean,
});

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

const GithubSearch = t.type({
  total_count: t.number,
});

export async function getTotalPrs(username: string) {
  const prs = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+is:pr`
  )
    .then((res) => res.json())
    .then((json) => GithubSearch.decode(json));

  return pipe(
    prs,
    either.map((prs) => prs.total_count),
    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => 0)
  );
}

export async function getTotalIssues(username: string) {
  const issues = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+is:issue`
  )
    .then((res) => res.json())
    .then((json) => GithubSearch.decode(json));

  return pipe(
    issues,
    either.map((issues) => issues.total_count),
    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => 0)
  );
}

export async function getTotalCommits(username: string) {
  const commits = await fetch(
    `https://api.github.com/search/commits?q=author:${username}`
  )
    .then((res) => res.json())
    .then((json) => GithubSearch.decode(json));

  return pipe(
    commits,
    either.map((commits) => commits.total_count),

    either.mapLeft((err) => console.error(err)),
    either.getOrElse(() => 0)
  );
}
