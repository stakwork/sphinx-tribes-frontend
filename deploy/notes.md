docker build -t sphinx-tribes-frontend .

docker tag sphinx-tribes-frontend sphinxlightning/sphinx-tribes-frontend:0.1.5

docker push sphinxlightning/sphinx-tribes-frontend:0.1.5

docker tag sphinx-tribes-frontend sphinxlightning/sphinx-tribes-frontend:latest

docker push sphinxlightning/sphinx-tribes-frontend:latest