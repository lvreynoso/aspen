import React from "react";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledHeader, StyledImg, StyledP } from "./style";

interface Props {
  content: string | JSX.Element;
  footer?: string;
  img: string;
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
  customConfirmButton?: JSX.Element;
}

const RedirectConfirmationModal = ({
  content,
  footer,
  img,
  isOpen,
  onClose,
  onConfirm,
  ...props
}: Props): JSX.Element => {
  const title = (
    <>
      <StyledImg src={img} />
      <StyledHeader>You are now leaving Aspen.</StyledHeader>
    </>
  );

  const formattedContent = (
    <div>
      <StyledP>{content}</StyledP>
    </div>
  );

  return (
    <div>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        content={formattedContent}
        footer={footer}
        {...props}
      />
    </div>
  );
};

export { RedirectConfirmationModal };