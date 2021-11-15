import { Tooltip } from "czifui";
import React, { MouseEventHandler } from "react";
import { StyledButton, StyledButtonWrapper } from "./style";

interface Props {
  hasSamples: boolean;
  hasValidName: boolean;
  isInEditMode: boolean;
  isValidTreeType: boolean;
  onClick: MouseEventHandler;
}

const CreateTreeButton = ({
  hasSamples,
  hasValidName,
  isInEditMode,
  isValidTreeType,
  onClick,
}: Props): JSX.Element => {
  const NO_NAME_NO_SAMPLES =
    "Your tree requires a Tree Name & at least 1 Sample or Sample ID.";
  const NO_NAME = "Your tree requires a Tree Name.";
  const NO_SAMPLES = "Your tree requires at least 1 Sample or Sample ID.";
  const SAMPLES_ARE_IN_EDIT =
    "Finish adding Sample IDs before creating your tree.";

  let tooltipTitle = "";

  if (!hasValidName && !hasSamples) tooltipTitle = NO_NAME_NO_SAMPLES;
  else if (!hasValidName) tooltipTitle = NO_NAME;
  else if (!hasSamples) tooltipTitle = NO_SAMPLES;
  else if (isInEditMode) tooltipTitle = SAMPLES_ARE_IN_EDIT;

  const isTreeBuildDisabled =
    !hasValidName || !hasSamples || isInEditMode || !isValidTreeType;

  return (
    <Tooltip
      arrow
      disableHoverListener={!isTreeBuildDisabled || !tooltipTitle}
      placement="top"
      title={tooltipTitle}
    >
      <StyledButtonWrapper>
        <StyledButton
          color="primary"
          variant="contained"
          isRounded
          disabled={isTreeBuildDisabled}
          type="submit"
          value="Submit"
          onClick={onClick}
        >
          Create Tree
        </StyledButton>
      </StyledButtonWrapper>
    </Tooltip>
  );
};

export { CreateTreeButton };
