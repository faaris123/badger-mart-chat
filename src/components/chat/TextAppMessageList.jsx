import { useEffect, useRef } from "react";
import { Container, Row } from "react-bootstrap";
import Message from "./messages/Message";

export default function TextAppMessageList({messages}) {

    const lastItem = useRef();

    useEffect(() => {
        lastItem.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return <Container className="message-list">
        {messages.map((message, i) => (
            <div
                ref={i === messages.length - 1 ? lastItem : undefined}
                key={i}
            >
                <Row style={{ display: "flow-root", marginBottom: "0.5rem" }}>
                    <Message type={message.type}>
                        <p>{message.text}</p>
                    </Message>
                </Row>
            </div>
        ))}
    </Container>
}