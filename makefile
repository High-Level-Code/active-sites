all:

docker-build:
	docker build -t url-cron .

docker-run:
	docker run -d --name url-cron --env-file .env url-cron

docker:
	make docker-build && make docker-run

docker-exec:
	docker exec -it url-cron bash
