# syntax = docker/dockerfile:1.4

FROM python:3.9.13-slim-bullseye

WORKDIR /server

COPY ./requirements.txt . 

RUN apt update

RUN apt install -y git

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

