import json
import os
import re
from typing import Dict, Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload
from sqlalchemy.sql.expression import and_

from aspen.api.error import http_exceptions as ex
from aspen.api.utils import authz_phylo_tree_filters
from aspen.database.models import (
    DataType,
    Group,
    Location,
    PhyloRun,
    PhyloTree,
    Sample,
    User,
)

# 16 colors
NEXTSTRAIN_COLOR_SCALE = [
    "#277F8E",
    "#084A9F",
    "#4187E0",
    "#B2D3FD",
    "#DFC6FF",
    "#9069C2",
    "#440278",
    "#BD3232",
    "#ED5151",
    "#FF9999",
    "#FF8A24",
    "#FFDABA",
    "#A76738",
    "#FDE725",
    "#A0DA39",
    "#4AB569",
]


def _rename_nodes_on_tree(
    node: dict,
    name_map: Mapping[str, str],
    save_key: Optional[str] = None,
) -> dict:
    """Given a tree, a mapping of identifiers to their replacements, rename the nodes on
    the tree.  If `save_key` is provided, then the original identifier is saved using
    that as the key."""
    name = node["name"]
    renamed_value = name_map.get(name, None)
    if renamed_value is not None:
        # we found the replacement value! first, save the old value if the caller
        # requested.
        if save_key is not None:
            node[save_key] = name
        node["name"] = renamed_value
    for child in node.get("children", []):
        _rename_nodes_on_tree(child, name_map, save_key)
    return node


async def verify_and_access_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int, load_samples: bool = False
) -> Tuple[bool, Optional[PhyloTree], Optional[PhyloRun]]:
    tree_query = sa.select(PhyloTree).join(PhyloRun)  # type: ignore
    if load_samples:
        tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples))  # type: ignore
    authz_tree_query = authz_phylo_tree_filters(tree_query, user, set([phylo_tree_id]))  # type: ignore
    authz_tree_query_result = await db.execute(authz_tree_query)
    phylo_tree: Optional[PhyloTree]
    try:
        phylo_tree = authz_tree_query_result.scalars().unique().one()
    except sa.exc.NoResultFound:  # type: ignore
        return False, None, None
    run_query = sa.select(PhyloRun).join(PhyloTree).filter(PhyloTree.entity_id == phylo_tree.entity_id).options(selectinload(PhyloRun.group).joinedload(Group.default_tree_location))  # type: ignore
    run_query_result = await db.execute(run_query)
    phylo_run: Optional[PhyloRun]
    phylo_run = run_query_result.scalars().unique().one()
    return True, phylo_tree, phylo_run


def _sample_filter(sample: Sample, can_see_pi_group_ids: Set[int], system_admin: bool):
    if system_admin:
        return True
    return sample.submitting_group_id in can_see_pi_group_ids


def _collect_countries(node: dict) -> Set[str]:
    countries = set()
    node_country = node.get("node_attrs", {}).get("country", {}).get("value", None)
    if node_country:
        countries.add(node_country)
    for child in node.get("children", []):
        countries |= _collect_countries(child)
    return countries


# set which countries will be given color labels in the nextstrain viewer
# noqa: E711 is vital for the SQL query to compile correctly.
async def _set_countries(
    db: AsyncSession, tree_json: dict, phylo_run: PhyloRun
) -> dict:
    # information stored in tree_json["meta"]["colorings"], which is an
    # array of objects. we grab the index of the one for "country"
    country_defines_index = None
    for index, category in enumerate(tree_json["meta"]["colorings"]):
        if category["key"] == "country":
            country_defines_index = index

    # We want to make sure we include countries in the tree
    defined_countries: Set[str] = _collect_countries(tree_json["tree"])

    tree_location = phylo_run.group.default_tree_location
    countries = [tree_location.country]
    defined_countries -= set(countries)

    origin_location = aliased(Location)

    sorting_query = (
        sa.select(  # type: ignore
            Location.country,  # type: ignore
            sa.func.earth_distance(
                sa.func.ll_to_earth(Location.latitude, Location.longitude),
                sa.func.ll_to_earth(
                    origin_location.latitude, origin_location.longitude
                ),
            ).label("distance"),
        )
        .select_from(origin_location)  # type: ignore
        .join(
            Location,  # type: ignore
            and_(
                Location.division == None,  # noqa: E711
                Location.location == None,  # noqa: E711
                Location.country.in_(defined_countries),
            ),
        )
        .where(
            and_(
                origin_location.country == tree_location.country,
                origin_location.division == None,  # noqa: E711
                origin_location.location == None,  # noqa: E711
            )
        )
        .order_by(asc("distance"))
        .limit(15)
    )
    sorted_countries = await db.execute(sorting_query)
    sorted_country_names = [row["country"] for row in sorted_countries]

    # Add the countries we found location data for
    # If we still have fewer than 16, add whatever is left from the set we collected
    # in the tree, even if we don't have spatial data on them.
    countries.extend(sorted_country_names)
    if len(countries) < 16:
        defined_countries -= set(sorted_country_names)
        remaining_countries_in_tree = list(defined_countries)
        countries.extend(remaining_countries_in_tree[: 16 - len(countries)])

    colorings_entry = list(zip(countries, NEXTSTRAIN_COLOR_SCALE))

    if country_defines_index is not None:
        tree_json["meta"]["colorings"][country_defines_index]["scale"] = colorings_entry
    else:
        tree_json["meta"]["colorings"].append(
            {
                "key": "country",
                "title": "Country",
                "type": "categorical",
                "scale": colorings_entry,
            }
        )

    return tree_json


async def process_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int, id_style: Optional[str] = None
) -> dict:
    (
        authorized,
        phylo_tree_result,
        phylo_run_result,
    ) = await verify_and_access_phylo_tree(db, user, phylo_tree_id, load_samples=True)
    if not authorized or not phylo_tree_result:
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}"
        )
    if not phylo_run_result:
        raise ex.ServerException(f"No phylo run found for phylo tree {phylo_tree_id}")
    phylo_tree: PhyloTree = phylo_tree_result
    phylo_run: PhyloRun = phylo_run_result

    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)

    if id_style == "public":
        return json_data

    can_see_pi_group_ids: Set[int] = {user.group_id}
    if not user.system_admin:
        can_see_pi_group_ids.update(
            {
                can_see.owner_group_id
                for can_see in user.group.can_see
                if can_see.data_type == DataType.PRIVATE_IDENTIFIERS
            }
        )

    # If this tree was generated by a group that the user has private-identifier
    # read access to, then load a map of ALL public:private identifiers for that
    # group so we can translate public ID's to private ID's on the tree.
    identifier_map: Dict[str, str] = {}
    tree_owner_group = phylo_run.group
    all_translatable_samples: list[Sample] = []
    if user.system_admin or tree_owner_group.id in can_see_pi_group_ids:
        all_translatable_samples_query = sa.select(Sample).where(  # type: ignore
            Sample.submitting_group == tree_owner_group
        )
        all_translatable_samples_result = await db.execute(
            all_translatable_samples_query
        )
        all_translatable_samples = all_translatable_samples_result.scalars().all()
        for sample in all_translatable_samples:
            public_id = sample.public_identifier.replace("hCoV-19/", "")
            identifier_map[public_id] = sample.private_identifier

    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        json_data["tree"], identifier_map, "GISAID_ID"
    )

    # set country labeling/colors
    json_data = await _set_countries(db, json_data, phylo_run)
    return json_data


def extract_accessions(accessions_list: list, node: dict):
    node_attributes = node.get("node_attrs", {})
    if "external_accession" in node_attributes:
        accessions_list.append(node_attributes["external_accession"]["value"])
    if "name" in node:
        # NODE_ is some sort of generic name and not useful
        if not re.match("NODE_", node["name"]):
            accessions_list.append(node["name"])
    if "children" in node:
        for child in node["children"]:
            extract_accessions(accessions_list, child)
    return accessions_list