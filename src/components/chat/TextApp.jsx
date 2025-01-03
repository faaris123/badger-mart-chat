import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';

import TextAppMessageList from './TextAppMessageList';
import MessageType from './messages/MessageType';

import createChatAgent from '../../agent/ChatAgent';


function TextApp() {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const inputRef = useRef();

    const chatAgent = useMemo(() => createChatAgent(), []);

    const addMessage = (m) => {
        setMessages(o => [...o, m]);
    }

    const addAIMessage = (txt) => {
        addMessage({type: MessageType.AI, text: txt})
    }

    const addClientMessage = (txt) => {
        addMessage({type: MessageType.CLIENT, text: txt})
    }

    useEffect(() => {
        setIsLoading(true);
        chatAgent.handleInitialize().then(m => {
            if (m) {
                addAIMessage(m);
            }
            setIsLoading(false);
        })
    }, [])

    const handleSend = (e) => {
        e?.preventDefault();
        const input = inputRef.current.value?.trim();
        if (input) {
            addClientMessage(input);
            setIsLoading(true);
            chatAgent.handleReceive(input)
                .then(res => {
                    addAIMessage(res);
                    setIsLoading(false);
                });
            inputRef.current.value = "";
        }
    };

    return (
        <div className="app">
            <TextAppMessageList messages={messages}/>
            {isLoading ? <BeatLoader color="#36d7b7"/> : <></>}
            <div className="input-area">
                <Form className="inline-form" onSubmit={handleSend}>
                    <Form.Control
                        ref={inputRef}
                        style={{ marginRight: "0.5rem", display: "flex" }}
                        placeholder="Type a message..."
                        aria-label='Type and submit to send a message.'
                    />
                    <Button type='submit' disabled={isLoading}>Send</Button>
                </Form>
            </div>
        </div>
    );
}

export default TextApp;
