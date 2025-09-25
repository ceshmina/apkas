FROM amazonlinux:2023

RUN yum update && yum install -y python3.13 python3.13-pip zip
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /lambda
COPY pyproject.toml .
RUN uv pip compile pyproject.toml --output-file requirements.txt

RUN pip3.13 install -r requirements.txt -t .

COPY functions functions
RUN mkdir output
