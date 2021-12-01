import styled from "@emotion/styled";
import { Checkbox, getColors, getSpaces, Props } from "czifui";

interface ExtraProps extends Props {
  shouldShowCheckboxes?: boolean;
}

const doNotForwardProps = ["shouldShowCheckboxes"];

export const StyledHeaderRow = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  display: flex;

  ${(props: ExtraProps) => {
    const { shouldShowCheckboxes } = props;

    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${shouldShowCheckboxes ? 0 : `0 ${spaces?.l}px`};
      border-bottom: 3px solid ${colors?.gray[200]} !important;
    `;
  }}
`;

export const HeaderCheckbox = styled(Checkbox)`
  padding: 0;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      padding-right: ${spaces?.l}px;
      padding-left: ${spaces?.m}px;
      padding-bottom: ${spaces?.l}px;
      &.MuiCheckbox-indeterminate {
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;