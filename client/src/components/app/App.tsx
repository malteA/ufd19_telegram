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
        {/* <div className="chat">
          <div className="list">
            <div className="message">
              <span>
                <span>text-top</span>
                <br />
                text-bottom
              </span>
            </div>
          </div>
          <hr className="divider" />
          <div className="send"></div>
        </div> */}
      </div>
    );
  }
}

export default App;
