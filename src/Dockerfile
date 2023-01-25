FROM python:3.10-alpine

WORKDIR /src
COPY requirements.txt /src
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5049

CMD ["python3", "api.py"]