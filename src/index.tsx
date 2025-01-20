import React from 'react';
import ReactDOM from 'react-dom';
import { PostHogProvider } from 'posthog-js/react';
import App from './App';
import * as serviceWorker from './serviceWorker';
import '@elastic/eui/dist/eui_theme_dark.css';
import 'bootstrap/dist/css/bootstrap.css';
import { appEnv } from './config/env';

//const options = {
//  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST
//};
const options = {
  api_host: 'https://us.i.posthog.com'
};

if (appEnv.isTests) {
  ReactDOM.render(<App />, document.getElementById('root'));
} else {
  ReactDOM.render(
    <PostHogProvider apiKey={'phc_1UPR3wqvyvLllQJtpecsmaqEfKInrr0WDSPZf0RHODP'} options={options}>
      <App />
    </PostHogProvider>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
