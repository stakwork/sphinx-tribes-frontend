# Setup Sphinx Stack to run Cypress Test Locally

## Prerequisite

1. Ensure you have [docker](https://www.docker.com/) installed on your Machine.

## Setup Sphinx Stack

1. Clone the Sphinx Stack Repo [here](https://github.com/stakwork/sphinx-stack)

    ```bash
    git clone https://github.com/stakwork/sphinx-stack.git
    ```

2. Open a terminal inside the root directory of sphinx stack cloned on your machine and run the following command:

    ```bash
    docker-compose -f ./alts/cln-proxy.yml --project-directory . up -d
    ```

The above command will pull images from Docker Hub and start up docker compose

Note: Please allow the following container to exit before you proceed

`relaysetup-1`

`lndsetup-1`

### Next time you want to run Stack

Please when next you want to run sphinx stack ensure you pull the current tribes image. Run the command below to pull tribes server latest image.

```bash
docker pull sphinxlightning/sphinx-tribes:latest
```

If you are using the Apple Silicon(M1), use the command below to pull tribes latest image

```bash
docker pull --platform linux/x86_64 sphinxlightning/sphinx-tribes:latest
```

### Reset Sphinx Stack Data

1. Stop the Docker Compose if it's currently running.

2. Open your terminal in the root directory of Sphinx Stack.

3. Run the following command:

    ```bash
    ./clearall.sh
    ```

4. Proceed to run step 2 in the `Setup Sphinx Stack` section and don't forget to wait for `relaysetup` and `lndsetup` to exit before you procced.

5. Finally, rerun the steps outlined in the `Setup Frontend with Cypress` section

## Setup Frontend with Cypress

1. Go to the sphinx-stack folder, locate the `NODES.json` file located in `sphinx-stack/relay/NODES.json` and copy the content of the file.
PS: the content should be an array of objects

2. In your frontend folder locate the `cypres/fixtures` folder, create a new file called `nodes.json` and paste the content you copied from the above step.

## Cypress Test

1. If this is your first time running this project, please open a terminal inside the root directory of this repository and run the command below:

    ```bash
    yarn install
    ```

2. Use the command below to start the app.

    ```bash
    yarn run start:cypress 
    ```

3. Use the command below to run current cypress test.

    ```bash
    yarn run cypress:run
    ```

4. If you will like to see Cypress run in a UI, run the command below:

    ```bash
    npx cypress open
    ```

With the above commands executed properly you should be able to start writing your test in the `cypress/e2e` folder.

## Help

1. To login as a user you can use the command below and pass in the name of the user you want to login as:

    ```bash
    cy.login("alice")
    ```

2. To logout you can use the command below, also passing the user who want's to log out

    ```bash
    cy.logout("alice")
    ```

 You can also checkout the `cypress/support/commands.ts` file to get other custom made commands.

## Stoping Sphinx Stack

Please use the command below to stop sphinx stack:

```bash
docker-compose down
```

Running `docker-compose down` instead of sending a SIGINT or SIGTERM is very important! Otherwise `bitcoind` will not finish writing to its database, and on the next run `LND` will crash with a block index mismatch.

You can also run with Docker Desktop and just use the "play" and "stop" buttons (and view the logs from each container).
