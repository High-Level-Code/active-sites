all:

docker-build:
	docker build -t url-cron .

docker-run:
	docker run -d --name url-cron --env-file .env url-cron

docker:
	make docker-build && make docker-run

docker-exec:
	docker exec -it url-cron bash

docker-clean:
	docker stop url-cron && docker remove url-cron

tag:
	docker tag url-cron ghcr.io/high-level-code/url-cron

push:
	docker push ghcr.io/high-level-code/url-cron

tag-push:
	make tag && make push
