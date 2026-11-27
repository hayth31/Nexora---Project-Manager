FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV IS_LOCAL=true
ENV PORT=3001

EXPOSE 3001

CMD ["python", "dev_server.py"]
