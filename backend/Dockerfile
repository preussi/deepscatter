# syntax = docker/dockerfile:1.4

FROM python:3.9.13-slim-bullseye

WORKDIR /backend

COPY ./requirements.txt . 

RUN apt update

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

