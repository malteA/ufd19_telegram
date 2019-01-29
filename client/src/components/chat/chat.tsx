import React, {Component} from "react";
import "./chat.css";

interface State {
    message: string;
    messages: any[];
    history: any[];
}
export default class Chat extends Component<any, State> {
    private ws: WebSocket = new WebSocket(`ws://${window.location.hostname}:1337`);

    public constructor(prop: any) {
        super(prop);
        this.state = {
            message: "",
            messages: [],
            history: []
        }
    }

    public async componentDidMount(): Promise<void> {
        this.ws.onmessage = (event: MessageEvent) => {
            const evt: any = JSON.parse(event.data);
            const messages: string[] = this.state.messages;
            if (evt.type === "history") {
                return this.setState({history: evt.data});
            }
            messages.push(evt);
            this.setState({messages})
        }
    }

    public render(): JSX.Element {
        return(
            <div className="chat">
                <div className="list">
                    {this.state.history && this.state.history.map((history, key) => {
                        // return <li className={`history chat ${history.author === "-1" ? "server" : "client"}`} key={key}>{history.text}</li>
                        return <div className={`message ${history.author === "-1" ? "received" : "send"}`} key={key}>
                            <span>
                                <span>{history.author === "-1" ? "server" : "client"}</span>
                                <br />
                                {history.text}
                            </span>
                        </div>
                    })}
                    {this.state.messages && this.state.messages.map((message, key) => {
                        // return <li className={`chat ${message.author === "-1" ? "server" : "client"}`} key={key}>{message.data}</li>
                        return <div className={`message ${message.author === "-1" ? "received" : "send"}`} key={key}>
                            <span>
                                <span>{message.author === "-1" ? "server" : "client"}</span>
                                <br />
                                {message.data}
                            </span>
                        </div>
                    })}
                </div>
                <hr />
                <div className="compose-message">
                    <input type="text" onChange={this.handleChangeMessage} />
                    <button onClick={this.handleSendMessage}>Send</button>
                </div>
            </div>
        )
    }

    private handleChangeMessage = (evt: React.ChangeEvent<any>) => {
        this.setState({message: evt.target.value});
    }

    private handleSendMessage = () => {
        const message: any = {type: "message", data: this.state.message, author: "1"};
        this.ws.send(this.state.message);
        const messages: string[] = this.state.messages;
        messages.push(message);
        this.setState({messages})
    }
}