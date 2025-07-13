# AWS SSO Setup Guide

このガイドでは、AWS SSOを使用してTerraformから実際のAWS環境にデプロイするための設定方法を説明します。

## 前提条件

- AWS CLIがインストールされていること
- 組織でAWS SSOが有効化されていること
- デプロイ対象のAWSアカウントへのアクセス権限があること

## 1. AWS CLIの設定

### AWS CLIのインストール（まだの場合）
```bash
# macOS
brew install awscli

# または公式インストーラー
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### バージョン確認
```bash
aws --version
# aws-cli/2.x.x が表示されることを確認
```

## 2. AWS SSO設定

### SSOプロファイルの設定
```bash
aws configure sso
```

設定時に入力する情報：
- **SSO session name**: `apkas-session` (任意の名前)
- **SSO start URL**: 組織のSSO URL（例：`https://your-org.awsapps.com/start`）
- **SSO region**: `ap-northeast-1` (SSOが設定されているリージョン)
- **Account ID**: デプロイ対象のAWSアカウントID
- **Role name**: 使用するIAMロール名（例：`PowerUserAccess`, `AdministratorAccess`）
- **CLI default client Region**: `ap-northeast-1`
- **CLI default output format**: `json`
- **CLI profile name**: `apkas-prod` (または適切な名前)

### 設定例
```
SSO session name (Recommended): apkas-session
SSO start URL [None]: https://your-org.awsapps.com/start
SSO region [None]: ap-northeast-1
SSO registration scopes [sso:account:access]: (Enterを押す)

# アカウント選択画面が表示される
Please choose an account: [選択]

# ロール選択画面が表示される  
Please choose a role: [選択]

CLI default client Region [None]: ap-northeast-1
CLI default output format [None]: json
CLI profile name [xxx-xxx]: apkas-prod
```

## 3. プロファイル確認

### 設定されたプロファイルの確認
```bash
aws configure list-profiles
```

`apkas-prod`が表示されることを確認します。

### 設定内容の確認
```bash
cat ~/.aws/config
```

以下のような設定が表示されるはずです：
```ini
[profile apkas-prod]
sso_session = apkas-session
sso_account_id = 123456789012
sso_role_name = PowerUserAccess
region = ap-northeast-1
output = json

[sso-session apkas-session]
sso_start_url = https://your-org.awsapps.com/start
sso_region = ap-northeast-1
sso_registration_scopes = sso:account:access
```

## 4. SSOログイン

### 初回ログイン
```bash
aws sso login --profile apkas-prod
```

ブラウザが開き、SSOログイン画面が表示されます。認証を完了してください。

### ログイン状態の確認
```bash
aws sts get-caller-identity --profile apkas-prod
```

アカウント情報が表示されればログイン成功です。

## 5. Terraform設定の更新

### プロダクション環境設定の更新
`terraform/terraform.tfvars.prod`を編集：
```hcl
# Production AWS environment (uses SSO)
is_localstack = false
environment   = "prod"
project_name  = "apkas"
region        = "ap-northeast-1"
aws_profile   = "apkas-prod"  # 設定したプロファイル名
```

### ステージング環境用の追加プロファイル（必要な場合）
ステージング環境用に別のプロファイルを作成する場合：
```bash
aws configure sso --profile apkas-staging
```

## 6. デプロイテスト

### プランの確認
```bash
./scripts/deploy.sh prod plan
```

### 実際のデプロイ
```bash
./scripts/deploy.sh prod apply
```

## トラブルシューティング

### SSOセッションが期限切れの場合
```bash
aws sso login --profile apkas-prod
```

### 権限エラーが発生する場合
- IAMロールに必要な権限があることを確認
- 以下のサービスへの権限が必要：
  - S3 (フルアクセス)
  - Lambda (フルアクセス)
  - DynamoDB (フルアクセス)
  - IAM (必要最小限)

### 複数アカウント/リージョンでの作業
環境ごとに異なるプロファイルを作成：
```bash
# ステージング環境
aws configure sso --profile apkas-staging

# プロダクション環境
aws configure sso --profile apkas-prod

# 開発環境（別アカウント）
aws configure sso --profile apkas-dev
```

## セキュリティのベストプラクティス

1. **最小権限の原則**: 必要最小限の権限のみを持つIAMロールを使用
2. **定期的なローテーション**: SSOセッションは定期的に期限切れになるため、必要に応じて再ログイン
3. **プロファイル管理**: 不要になったプロファイルは削除
4. **環境分離**: 本番環境とステージング環境で異なるプロファイルを使用

## 参考リンク

- [AWS CLI SSO Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [AWS SSO User Guide](https://docs.aws.amazon.com/singlesignon/latest/userguide/)
- [Terraform AWS Provider SSO](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#shared-configuration-and-credentials-files)