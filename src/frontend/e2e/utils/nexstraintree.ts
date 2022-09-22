const faker = require("@faker-js/faker");
import { sample } from "lodash";
import { GeneralUtil } from "./general";

const lineages = ["A", "BA.1.1", "BA.1.15"];

export class NextstrainUtil {
  public static getNextStrainTreeData(
    defaults?: NextStrainTreeData
  ): NextStrainTreeData {
    const treeTypes = ["OVERVIEW", "TARGETED"];

    return {
      name: GeneralUtil.getValueOrDefault(
        defaults?.name,
        faker.name.fullName()
      ) as string,
      samples: defaults?.samples !== undefined ? defaults?.samples : [],
      tree_type: GeneralUtil.getValueOrDefault(
        defaults?.tree_type,
        sample(treeTypes)
      ) as string,
      template_args: {
        filter_start_date: GeneralUtil.getValueOrDefault(
          defaults?.template_args?.filter_start_date,
          GeneralUtil.getADateInThePast()
        ) as string,
        filter_pango_lineages: GeneralUtil.getValueOrDefault(
          defaults?.template_args?.filter_pango_lineages,
          lineages
        ) as Array<string>,
      },
    };
  }
}

export interface NextStrainTreeData {
  name: string;
  samples: any;
  tree_type: string;
  template_args: {
    filter_start_date: string;
    filter_pango_lineages: Array<string>;
  };
}