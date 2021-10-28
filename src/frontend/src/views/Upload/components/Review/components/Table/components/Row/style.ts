import styled from "@emotion/styled";
import {
  TableCell,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import {
  fontHeaderS,
  getColors,
  getSpaces,
  Props as CzifuiProps,
} from "czifui";

export const Id = styled.div`
  ${fontHeaderS}

  min-width: 300px;

  justify-content: center;
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px 0 ${spaces?.m}px ${spaces?.s}px
    `;
  }}
`;

interface TableRowProps extends MuiTableRowProps, CzifuiProps {
  component: "div";
}

export const StyledTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    ${(props: TableRowProps) => {
      const colors = getColors(props);

      return `
        background-color: ${colors?.gray[100]};
      `;
    }}
  }
`;

export const StyledTableCell = styled(TableCell)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px 0;
    `;
  }}
`;

export const IsPrivateTableCell = styled(TableCell)`
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      padding: ${spaces?.m}px 0;
      border-left: solid 2px ${colors?.gray[200]};
      border-right: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const IsPrivateContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
`;

export const StyledLock = styled(Lock)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;
