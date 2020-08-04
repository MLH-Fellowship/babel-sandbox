import styled from "styled-components";
import { Editor } from "./Editor";
import { Segment } from "semantic-ui-react";

const Root = styled.div``;

const Wrapper = styled.div``;

const Config = styled(Editor)`
  padding: 4px;
`;

const Code = styled(Editor)``;

const ASTButton = styled.button`
  border: none;
  background: none;
  width: 2em;
`;

const ASTSegment = styled(Segment)`
  border-color: white !important;
  box-shadow: none !important;
`;

export { Root, Wrapper, Config, Code, ASTButton, ASTSegment };
