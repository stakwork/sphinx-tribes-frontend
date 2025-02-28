# Sphinx Tribes 🌐

![Tribes](https://github.com/stakwork/sphinx-tribes/raw/master/img/sphinx-tribes.png)

Welcome to **Sphinx Tribes** - a decentralized message broker designed for public groups in Sphinx Chat. Empowering users to run their own **Sphinx Tribes** server, this platform seamlessly routes group messages for various applications such as **sphinx-relay** nodes, apps, websites, or IoT devices. 

Additionally, a subset of **Sphinx Tribes** is the Bounties Platform - a global marketplace for work paid out in bitcoin bounties. 

## How it Works 🚀

### Sphinx Tribes
**Sphinx Tribes** operates as an MQTT broker that any node can subscribe to. Message topics always consist of two parts: `{receiverPubKey}/{groupUUID}`. Only the group owner has the privilege to publish messages, and all messages from group members are required to be submitted to the owner as a Lightning keysend payment. The group `uuid` is essentially a timestamp signed by the owner.

![Tribes](https://github.com/stakwork/sphinx-tribes/raw/master/img/tribes.jpg)

### Bounties Platform
The **sphinx-tribes-frontend** also contains the frontend for the bounties platform website. In order to run the website locally on your computer, you'll need to run sphinx-tribes-frontend as a whole. You can find the backend repo at [sphinx-tribes](https://github.com/stakwork/sphinx-tribes).

Feel free to explore the potential of **sphinx-tribes** and contribute to its vibrant ecosystem! 🌟
=======

## Authentication 🔒

The authentication process is seamlessly handled by [sphinx-auth](https://github.com/stakwork/sphinx-auth).

## Running Against Sphinx-Stack 🏃

To run the **tribes** frontend locally, utilize the following ports:

- Tribes: `yarn start:tribes:docker` (localhost:23000)
- People: `yarn start:people:docker` (localhost:23007)

## Running Frontend Against people.sphinx.chat Locally 🌐

To run the frontend:

1. Install dependencies:
 - `yarn install` to install the dependencies

2. Start the application:
- For local development: `yarn start:local`
- For production environment: `yarn start`

## Contributing Guidelines 🤝

All code contributions, including those of people having commit access, must go through a pull request and be approved by a core developer before being merged. This is to ensure a proper review of all the code.

We truly ❤️ pull requests! If you wish to help, you can learn more about how you can contribute to this project in the [contribution guide](CONTRIBUTING.md).
## Community and Support 💬

Join our community on [Forum/Chat](https://people.sphinx.chat) to connect with other users and get support.

## Cypress Testing 

To write cypress test, read the cypress guide for setting up your environment for cypress testing [cypress guide](docs/setupCypressTest.md).