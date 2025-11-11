import React from 'react';
import ReactDOM from 'react-dom';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import App from './App';
import * as serviceWorker from './serviceWorker';
import '@elastic/eui/dist/eui_theme_dark.css';
import 'bootstrap/dist/css/bootstrap.css';
import { appEnv } from './config/env';

if (appEnv.isTests) {
  ReactDOM.render(<App />, document.getElementById('root'));
} else {
  posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST || '',
    capture_pageview: false,
    person_profiles: 'identified_only'
  });
  ReactDOM.render(
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
