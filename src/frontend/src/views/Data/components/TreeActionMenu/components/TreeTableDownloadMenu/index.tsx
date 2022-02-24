import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, ReactNode, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { TREE_STATUS } from "src/common/constants/types";
import DownloadIcon from "src/common/icons/IconDownloadSmall.svg";
import { stringGuard } from "src/common/utils";
import { StyledIcon, StyledIconWrapper } from "../../style";

interface Props {
  item: TableItem;
}

const TreeTableDownloadMenu = ({ item }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick: MouseEventHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const jsonLink = stringGuard(item["downloadLink"]);
  const tsvDownloadLink = stringGuard(item["accessionsLink"]);
  const disabled = item?.status !== TREE_STATUS.Completed;
  // TODO (mlila): This is necessary due to an sds bug -- MUI tooltips should not display
  // TODO          without content, but that functionality was accidentally removed here.
  // TODO          https://app.shortcut.com/sci-design-system/story/176947
  const MenuItemTooltip = ({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element =>
    disabled ? (
      <Tooltip
        arrow
        title="This download is only available for completed trees."
        placement="top"
      >
        <div>{children}</div>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip arrow sdsStyle="dark" title="Download" placement="top">
        <StyledIconWrapper onClick={handleClick}>
          <StyledIcon>
            <DownloadIcon />
          </StyledIcon>
        </StyledIconWrapper>
      </Tooltip>
      {open && (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          open={open}
          onClose={handleClose}
          getContentAnchorEl={null}
        >
          <NewTabLink href={jsonLink}>
            <MenuItemTooltip>
              <MenuItem disabled={disabled} onClick={handleClose}>
                {"Tree file (.json)"}
              </MenuItem>
            </MenuItemTooltip>
          </NewTabLink>
          <NewTabLink href={tsvDownloadLink}>
            <MenuItem onClick={handleClose}>{"Private IDs (.tsv)"}</MenuItem>
          </NewTabLink>
        </Menu>
      )}
    </>
  );
};

export default TreeTableDownloadMenu;