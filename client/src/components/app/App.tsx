import React, { Component } from 'react';
import './App.css';
import Chat from '../chat/chat';

class App extends Component<any, any> {
  public render(): JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            UFD19 Chat-Bot
          </p>
        </header>
        <Chat />
      </div>
    );
  }
}

export default App;
