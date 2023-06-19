import React from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APP_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

initializeApp(firebaseConfig);

const App: React.FC = () => {
  const [user, setUser] = React.useState<User|null>(null);
  const [authCompleted, setAuthCompleted] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const queryPrams = new URLSearchParams(window.location.search);
      const token = queryPrams.get('t');
      const auth = getAuth();

      if (token) {
        window.history.replaceState(undefined, window.document.title, window.location.href.replace(window.location.search, ''));
        await signInWithCustomToken(auth, token);
      }

      onAuthStateChanged(auth, user => {
        setAuthCompleted(true);
        setUser(user);
      })
    })();
  });

  if (!authCompleted) {
    return (
      <div>Loading...</div>
    )
  }

  if (user) {
    return (
      <React.Fragment>
        <h1>Sign in with Slack Example</h1>
        <h2>Welcome!</h2>
        <div>Login as {user.uid}</div>
        <button onClick={() => getAuth().signOut()}>Sign out</button>
      </React.Fragment>
    )
  } else {
    return (
      <React.Fragment>
        <h1>Sign in with Slack Example</h1>
        <a href={`https://slack.com/openid/connect/authorize?response_type=code&scope=openid,email,profile&client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&state=${Math.random().toString(36).slice(-8)}&team=${process.env.REACT_APP_SLACK_TEAM_ID}&redirect_uri=${process.env.REACT_APP_SLACK_REDIRECT_URL}`}><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" /></a>
      </React.Fragment>
    );
  }
}

export default App;
