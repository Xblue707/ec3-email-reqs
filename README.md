# EC3 Email Manager

Simple portal used to manage the creation of email accounts for the ec3.dev domain.

Namely, members of HCI EC³ can use this portal to request the creation of email accounts for themselves. An ExCo member or "the Webmaster" will then approve the request and the account will be created.

Following this, the user will receive an email with a password reset (or set) link. The user can then set their password and start using their email account on a suitable webmail client.

## How to develop

Before anything below, first ensure you have Node.js 20.0.0 or higher installed. Corepack should be enabled as well.

1. Clone the repository
2. Install the dependencies
	```sh
	yarn install
	```
3. Create a `.env` file in the root directory of the project and add the following environment variables:
	```sh
	GOOGLE_CLIENT_ID=client-id-here
	GOOGLE_CLIENT_SECRET=client-secret-here

	EMAIL_USER=email-user-here
	EMAIL_PASS=email-password-here

	PURELYMAIL_API_KEY=purelymail-api-key-here
	```
	NB: The default SMTP server configuration is set to use `smtp.purelymail.com`. If you are using a different SMTP server, you can head over to `src/lib/mail.ts` and change the configuration there.

4. Start the development server
	```sh
	yarn dev
	```

## Building

To build the project, run the following command:
```sh
yarn build
```

This will create a `dist` directory with the compiled files.

See https://docs.astro.build/en/guides/integrations-guide/node/#standalone for more.