import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BaseEmailProps {
  subject: string;
  body: string;
  previewText?: string;
}

export function BaseEmail({ subject, body, previewText }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{subject}</Heading>
          <Section>
            <Text style={textStyle}>{body}</Text>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>Sent from skeleton-app</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const headingStyle = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  marginBottom: "16px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const hrStyle = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerStyle = {
  fontSize: "12px",
  color: "#8898aa",
};
