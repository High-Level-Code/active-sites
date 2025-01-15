NAME=active-sites
SOURCE=ghcr.io/high-level-code/$(NAME)

all:
	tsx src/index.ts

docker-build:
	docker build -t $(NAME) .

docker-run:
	docker run -d --name $(NAME) --env-file .env $(NAME)

# build and run
br:
	make docker-build && make docker-run

exe:
	docker exec -it $(NAME) bash

docker-clean:
	docker stop $(NAME) && docker remove$(NAME)

tag:
	docker tag $(NAME)

push:
	docker push $(SOURCE)

tag-push:
	make tag && make push
