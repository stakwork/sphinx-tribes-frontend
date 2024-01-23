# build

**npm run build**

### docker build

docker build -t sphinx-tribes-frontend .

### docker publish

docker tag sphinx-tribes-frontend sphinxlightning/sphinx-tribes-frontend:0.1.2

docker push sphinxlightning/sphinx-tribes-frontend:0.1.2

docker tag sphinx-tribes-frontend sphinxlightning/sphinx-tribes-frontend:latest

docker push sphinxlightning/sphinx-tribes-frontend:latest