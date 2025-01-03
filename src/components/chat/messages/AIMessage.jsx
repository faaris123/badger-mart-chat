import { Col } from "react-bootstrap";

export default function AIMessage(props) {
    return <Col
        className="ai-message"
        style={{width: "fit-content", maxWidth: "66.6666667%"}}
        xs={8}>
        {props.children}
    </Col>
}
