# eskarun

個人のウェブサイト ([apkas.net](https://apkas.net))

## 開発

```sh
docker compose up dev
```

またはdevcontainerを使っている場合は、コンテナ内で

```sh
yarn dev
```

上記コマンドで開発用サーバーが `localhost:8080` で起動します。

## デプロイ

mainブランチにマージすると、GitHub Actionsにより自動でGitHub Pagesにデプロイされます。
