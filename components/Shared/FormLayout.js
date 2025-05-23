import React from 'react';
import { Container, Card } from 'react-bootstrap';

const FormLayout = ({ children, title }) => {
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{title}</h4>
        </Card.Header>
        <Card.Body>
          {children}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormLayout; 