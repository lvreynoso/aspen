import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  getColors,
  getSpaces,
} from "czifui";

const whiteBorder = "border: 1px solid white;";
export const UploadButton = styled(Button)`
  color: white;
  ${whiteBorder}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-right: ${spaces?.xl}px;

      &:hover {
        ${whiteBorder}
        color: black;
        background-color: white;
      }

      &:active {
        background-color: ${colors?.gray[200]};
      }
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${fontBodyXs}

  display: flex;
  justify-content: flex-end;
  flex: auto;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.l}px;
    `;
  }}
`;
