import styled from "@emotion/styled";
import { getFontWeights } from "czifui";

export const SemiBold = styled.span`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;