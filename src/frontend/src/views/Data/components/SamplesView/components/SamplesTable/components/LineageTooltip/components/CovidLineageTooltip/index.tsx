import { Tooltip } from "czifui";
import { LineageTooltipProps } from "../../lineageTooltipConfig";
import { Label, Text, Wrapper } from "./style";

const KEY_TO_LABELS = {
  lineage: "Lineage",
  qcStatus: "QC Status",
  scorpioCall: "Scorpio Call",
  scorpioSupport: "Scorpio Support",
  lineageSoftwareVersion: "Version",
  lineageType: "Lineage Type",
  lineageProbability: "Lineage Probability",
  lastUpdated: "Last Updated",
  referenceDatasetName: "Reference Dataset Name",
  referenceSequenceAccession: "Reference Sequence Accession",
  referenceDatasetTag: "Reference Dataset Tag",
};

const DISPLAY_ORDER: Array<keyof Lineage> = [
  "lineage",
  "qcStatus",
  "lineageSoftwareVersion",
  "lineageType",
  "lineageProbability",
  "lastUpdated",
  "scorpioCall",
  "scorpioSupport",
  "referenceDatasetName",
  "referenceSequenceAccession",
  "referenceDatasetTag",
];

export const CovidLineageTooltip = ({
  children,
  lineage,
}: LineageTooltipProps): JSX.Element => {
  const textRows = (
    <>
      {DISPLAY_ORDER.map((key) => {
        const value = lineage[key];
        // skip certain keys for now that are extra and not included in current design
        if (
          ![
            "referenceDatasetName",
            "referenceSequenceAccession",
            "referenceDatasetTag",
            "lineageType",
          ].includes(key)
        ) {
          return (
            <Wrapper key={key}>
              <Label>{KEY_TO_LABELS[key]}:</Label> <Text>{value}</Text>
            </Wrapper>
          );
        }
      })}
    </>
  );

  return (
    <Tooltip
      followCursor
      title={textRows}
      width="wide"
      data-test-id="lineage-tooltip"
    >
      <div>{children}</div>
    </Tooltip>
  );
};
